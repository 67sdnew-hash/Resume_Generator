import fs from "fs";
import path from "path";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * The tool definition IS the enforced output schema.
 * Keep this structurally aligned with GenerationOutputSchema in schemas.ts —
 * the Zod schema re-validates whatever the model returns here.
 */
export const resumeOutputTool: Anthropic.Tool = {
  name: "return_optimized_resume",
  description: "Return the tailored resume content and cover letter.",
  input_schema: {
    type: "object",
    required: ["summary", "optimizedExperience", "prioritizedSkills", "coverLetter"],
    properties: {
      summary: {
        type: "string",
        description: "Tailored 2-4 sentence professional summary",
      },
      optimizedExperience: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "optimizedBullets"],
          properties: {
            id: {
              type: "string",
              description: "Matches the input experience entry id (e.g. exp_0)",
            },
            company: { type: "string" },
            optimizedBullets: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
      prioritizedSkills: {
        type: "object",
        properties: {
          technical: { type: "array", items: { type: "string" } },
          soft: { type: "array", items: { type: "string" } },
        },
      },
      coverLetter: {
        type: "string",
        description: "Full cover letter body, 3-4 paragraphs, no letterhead",
      },
      matchNotes: {
        type: "string",
        description: "Internal note: 1-2 sentences on the key alignment strategy used",
      },
    },
  },
};

/**
 * Loaded from disk rather than inlined so non-engineers (or you, at 1am)
 * can iterate on prompt wording without touching route/TypeScript code.
 */
export function loadSystemPrompt(): string {
  const promptPath = path.join(__dirname, "../../prompts/system-prompt.md");
  return fs.readFileSync(promptPath, "utf-8");
}
