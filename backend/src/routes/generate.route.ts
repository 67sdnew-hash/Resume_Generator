import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateRequestSchema, GenerationOutputSchema } from "../lib/schemas";
import fs from "fs";
import path from "path"; // Keeping this to load your existing prompt text
import { prisma } from "../lib/prisma";

const router = Router();
// Initialize Gemini with the key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), "prompts", "system-prompt.md"),
  "utf8"
);

const LOCAL_USER_EMAIL = "local@dev.local";

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

    // 2. Ensure every experience entry has a stable id
    const experienceWithIds = profile.experience.map((exp, i) => ({
      ...exp,
      id: exp.id ?? `exp_${i}`,
    }));

    // 3. Build the prompt for Gemini, including strict JSON formatting instructions
    const userMessage = `
CANDIDATE PROFILE:
${JSON.stringify({ ...profile, experience: experienceWithIds }, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

Generate the optimized resume content and cover letter based on the system instructions.
You MUST output ONLY a valid JSON object with exactly this structure:
{
  "summary": "Professional summary paragraph...",
  "optimizedExperience": [
    { "id": "exp_...", "optimizedBullets": ["Bullet 1", "Bullet 2"] }
  ],
  "prioritizedSkills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Skill 1"]
  },
  "coverLetter": "Full cover letter text..."
}
`;

    // 4. Call Gemini 1.5 Pro using JSON mode
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json", // This forces Gemini to output clean JSON
        maxOutputTokens: 8192,
      },
    });

    const result = await model.generateContent(userMessage);

  const responseText = result.response!.text();

  if (!responseText) {
    return res.status(502).json({
      error: "LLM returned an empty response",
    });
  }
    // Parse the JSON returned by Gemini
    const rawJson = JSON.parse(responseText);

    // 5. Validate the output against your existing schema
    const validation = GenerationOutputSchema.safeParse(rawJson);
    if (!validation.success) {
      console.error("LLM output failed validation:", validation.error.flatten());
      return res.status(502).json({
        error: "LLM returned malformed output",
        details: validation.error.flatten(),
      });
    }
    const validatedOutput = validation.data;

    // 6. Persist to SQLite database
    const profileData = {
      contact: JSON.stringify(profile.contact),
      summary: profile.summary ?? null,
      experience: JSON.stringify(experienceWithIds),
      education: JSON.stringify(profile.education),
      skills: JSON.stringify(profile.skills),
      projects: profile.projects ? JSON.stringify(profile.projects) : null,
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
        output: JSON.stringify(validatedOutput),
      },
    });

    // 7. Return to client
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