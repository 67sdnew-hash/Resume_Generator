import type { GenerateResponse, Profile } from "./types";

// FIX: Hardcoded for local development to avoid Vite/Next.js environment variable crashes
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function generateResume(params: {
  profile: Profile;
  jobDescription: string;
  profileId?: string;
}): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const body = await res.json();

  if (!res.ok) {
    const message =
      body?.details?.fieldErrors
        ? JSON.stringify(body.details.fieldErrors)
        : body?.error ?? "Generation failed";
    throw new Error(message);
  }

  return body as GenerateResponse;
}

export function pdfDownloadUrl(generationId: string, type: "resume" | "cover_letter") {
  return `${API_BASE_URL}/api/generate-pdf/${generationId}?type=${type}`;
}