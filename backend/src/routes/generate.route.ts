import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { GenerateRequestSchema, GenerationOutputSchema } from "../lib/schemas";
import { resumeOutputTool, loadSystemPrompt } from "../lib/anthropic-tools";
import { prisma } from "../lib/prisma";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM_PROMPT = loadSystemPrompt();

const LOCAL_USER_EMAIL = "local@dev.local";

/**
 * This build has no auth layer — it's a single-user local app.
 * We lazily create one placeholder User row so Profile.userId has
 * something valid to point at. Swap this out entirely once you add
 * Clerk/Auth.js and pull the real user id from the request.
 */
async function getOrCreateLocalUserId(): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email: LOCAL_USER_EMAIL } });
  if (existing) return existing.id;
  const created = await prisma.user.create({ data: { email: LOCAL_USER_EMAIL } });
  return created.id;
}

router.post("/api/generate", async (req: Request, res: Response) => {
  try {
    // 1. Validate input
    const parsed = GenerateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request payload",
        details: parsed.error.flatten(),
      });
    }
    const { profile, jobDescription, profileId: incomingProfileId } = parsed.data;

    // 2. Ensure every experience entry has a stable id so the LLM's
    //    optimizedExperience[].id can be mapped back to the source entry.
    const experienceWithIds = profile.experience.map((exp, i) => ({
      ...exp,
      id: exp.id ?? `exp_${i}`,
    }));

    const userMessage = `
CANDIDATE PROFILE:
${JSON.stringify({ ...profile, experience: experienceWithIds }, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

Generate the optimized resume content and cover letter per your instructions.
`;

    // 3. Call Claude with forced tool use (structured output).
    //    tool_choice forces the model to always respond via the tool,
    //    which is what eliminates conversational filler at the API level.
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5", // confirm the current model string for your account
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [resumeOutputTool],
      tool_choice: { type: "tool", name: "return_optimized_resume" },
      messages: [{ role: "user", content: userMessage }],
    });

    // 4. Extract the tool_use block
    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUseBlock) {
      return res.status(502).json({ error: "LLM did not return structured output" });
    }

    // 5. Re-validate the LLM's own output before trusting it downstream.
    //    A model can satisfy the tool schema and still return something
    //    semantically broken — never skip this step.
    const validation = GenerationOutputSchema.safeParse(toolUseBlock.input);
    if (!validation.success) {
      console.error("LLM output failed validation:", validation.error.flatten());
      return res.status(502).json({
        error: "LLM returned malformed output",
        details: validation.error.flatten(),
      });
    }
    const validatedOutput = validation.data;

    // 6. Persist. This is a local, single-user build (no auth layer yet),
    //    so we upsert a Profile row by id if one was passed, or create a
    //    fresh one otherwise, then attach a Generation record to it.
    const profileData = {
      contact: profile.contact,
      summary: profile.summary ?? null,
      experience: experienceWithIds,
      education: profile.education,
      skills: profile.skills,
      projects: profile.projects ?? undefined,
    };

    const savedProfile = incomingProfileId
      ? await prisma.profile.update({
          where: { id: incomingProfileId },
          data: profileData,
        })
      : await prisma.profile.create({
          data: { ...profileData, userId: await getOrCreateLocalUserId() },
        });

    const generation = await prisma.generation.create({
      data: {
        profileId: savedProfile.id,
        jobDescription,
        output: validatedOutput,
      },
    });

    // 7. Return to client. PDF rendering is a separate endpoint so the
    //    user can review/edit AI output before committing to a file.
    return res.status(200).json({
      success: true,
      profileId: savedProfile.id,
      generationId: generation.id,
      data: validatedOutput,
    });
  } catch (err) {
    console.error("Resume generation error:", err);
    return res.status(500).json({ error: "Failed to generate resume content" });
  }
});

export default router;
