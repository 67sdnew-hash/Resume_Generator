import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

import {
  GenerateRequestSchema,
  GenerationOutputSchema,
} from "../lib/schemas";

import { prisma } from "../lib/prisma";

import fs from "fs";
import path from "path";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, "../../prompts/system-prompt.md"),
  "utf8"
);

const LOCAL_USER_EMAIL = "local@dev.local";

async function getOrCreateLocalUserId(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: {
      email: LOCAL_USER_EMAIL,
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.user.create({
    data: {
      email: LOCAL_USER_EMAIL,
    },
  });

  return created.id;
}
router.post("/api/generate", async (req: Request, res: Response) => {
  try {
    const parsed = GenerateRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request payload",
        details: parsed.error.flatten(),
      });
    }

    const {
      profile,
      jobDescription,
      profileId: incomingProfileId,
    } = parsed.data;

    const experienceWithIds = profile.experience.map((exp, i) => ({
      ...exp,
      id: exp.id ?? `exp_${i}`,
    }));

    const userPrompt = `
CANDIDATE PROFILE

${JSON.stringify(
  {
    ...profile,
    experience: experienceWithIds,
  },
  null,
  2
)}

TARGET JOB DESCRIPTION

${jobDescription}

COVER LETTER REQUIREMENTS:
- Write a polished, well-structured cover letter in 3-4 short paragraphs.
- Introduce the candidate, connect relevant experience and skills to the role, and close with enthusiasm.
- Use language that is professional, concise, and free of clichés.
- Keep the letter strictly based on the candidate's real experience and the job description.

IMPORTANT:

Return ONLY valid JSON.

The JSON MUST exactly follow this schema.

{
  "summary": string,
  "optimizedExperience": [
    {
      "id": string,
      "company": string,
      "optimizedBullets": string[]
    }
  ],
  "prioritizedSkills": {
    "technical": string[],
    "soft": string[]
  },
  "coverLetter": string,
  "matchNotes": string
}

Do not wrap the JSON inside markdown.

Do not explain anything.

Return JSON only.
`;

    let parsedOutput: unknown;
    let usedCanned = false;

    // helper to produce a canned valid response
    const makeCanned = () => {
      const optimizedExperience = experienceWithIds.map((e: any) => ({
        id: e.id,
        company: e.company || "Company Inc",
        optimizedBullets: e.bullets && e.bullets.length ? e.bullets.slice(0, 3) : ["Worked on projects."]
      }));

      if (optimizedExperience.length === 0) {
        optimizedExperience.push({ id: "exp_dummy", company: "Company Inc", optimizedBullets: ["Worked on projects."] });
      }

      const canned = {
        summary: "This is a canned summary for local development.",
        optimizedExperience,
        prioritizedSkills: {
          technical: ["JavaScript", "TypeScript"],
          soft: ["Communication", "Teamwork"],
        },
        coverLetter: "I am excited to apply for this opportunity because it aligns with my strengths and experience.\n\nIn my most recent role, I supported delivery efforts with strong communication, attention to detail, and a focus on collaboration. I consistently worked with teammates to meet project goals and ensure a smooth workflow.\n\nI am motivated to bring that same dedication to your team and help contribute to successful outcomes.\n\nThank you for considering my application.",
        matchNotes: "Canned match notes.",
      };

      const validation = GenerationOutputSchema.safeParse(canned);
      if (!validation.success) {
        console.error("Canned output failed schema validation:", validation.error.flatten());
        return null;
      }

      return canned;
    };

    if (!process.env.GEMINI_API_KEY) {
      if (process.env.NODE_ENV === "production") {
        return res.status(502).json({ error: "Gemini API key missing in production" });
      }
      const canned = makeCanned();
      if (!canned) return res.status(500).json({ error: "Canned output invalid" });
      parsedOutput = canned;
      usedCanned = true;
    } else {
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-pro",

          contents: userPrompt,

          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
          },
        });
      } catch (e: any) {
        console.error("Gemini generation error:", e?.message ?? e);

        // If the error looks like a quota / RESOURCE_EXHAUSTED issue, fall back to canned output
        const msg = e?.message ?? String(e);
        if (msg && (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("429"))) {
          if (process.env.NODE_ENV === "production") {
            return res.status(502).json({ error: "Gemini quota/exhausted in production" });
          }
          console.warn("Gemini quota exceeded — using canned fallback for dev.");
          const canned = makeCanned();
          if (!canned) return res.status(500).json({ error: "Canned output invalid" });
          parsedOutput = canned;
          usedCanned = true;
        } else {
          return res.status(502).json({
            error: "Gemini generation failed",
            details: msg,
          });
        }
      }

      if (!parsedOutput) {
        const raw = response.text;

        if (!raw) {
          return res.status(502).json({
            error: "Gemini returned an empty response",
          });
        }

        try {
          parsedOutput = JSON.parse(raw);
        } catch {
          return res.status(502).json({
            error: "Gemini did not return valid JSON",
          });
        }

        const validation = GenerationOutputSchema.safeParse(parsedOutput);

        if (!validation.success) {
          console.error(validation.error.flatten());

          return res.status(502).json({
            error: "Gemini output failed validation",
            details: validation.error.flatten(),
          });
        }
      }
    }

    const validatedOutput = GenerationOutputSchema.parse(parsedOutput);

        const profileData = {
      contact: profile.contact,
      summary: profile.summary ?? null,
      experience: experienceWithIds,
      education: profile.education,
      skills: profile.skills,
      projects: profile.projects ?? undefined,
    };

    const profileCreateData = {
      contact: JSON.stringify(profile.contact),
      summary: profile.summary ?? null,
      experience: JSON.stringify(experienceWithIds),
      education: JSON.stringify(profile.education),
      skills: JSON.stringify(profile.skills),
      projects: profile.projects ? JSON.stringify(profile.projects) : undefined,
    };

    const savedProfile = incomingProfileId
      ? await prisma.profile.update({
          where: { id: incomingProfileId },
          data: profileCreateData,
        })
      : await prisma.profile.create({
          data: {
            ...profileCreateData,
            userId: await getOrCreateLocalUserId(),
          },
        });

    const generation = await prisma.generation.create({
      data: {
        profileId: savedProfile.id,
        jobDescription,
        output: JSON.stringify(validatedOutput),
      },
    });

    return res.status(200).json({
      success: true,
      profileId: savedProfile.id,
      generationId: generation.id,
      data: validatedOutput,
      cannedFallback: usedCanned,
    });
      } catch (err: any) {
        console.error("Resume generation error:", err?.stack ?? err);

        return res.status(500).json({
          error: "Failed to generate resume content",
          details: err?.message ?? String(err),
        });
      }
});

export default router;