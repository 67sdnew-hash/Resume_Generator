import type { GenerateResponse, Profile } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// exported sanitizer so tests or other modules can reuse it
export function sanitizeProfileForSend(p: Profile): Profile {
  const experience = (p.experience || [])
    .map((e) => ({
      ...e,
      company: e.company?.trim() ?? "",
      title: e.title?.trim() ?? "",
      startDate: e.startDate?.trim() ?? "",
      endDate: e.endDate?.trim() ?? "",
      location: e.location?.trim() ?? "",
      bullets: (e.bullets || []).map((b) => b.trim()).filter(Boolean),
    }))
    .filter((e) => e.company.length > 0 && e.title.length > 0 && e.startDate.length > 0 && e.bullets.length > 0);

  const education = (p.education || [])
    .map((ed) => ({
      ...ed,
      institution: ed.institution?.trim() ?? "",
      degree: ed.degree?.trim() ?? "",
      fieldOfStudy: ed.fieldOfStudy?.trim() ?? "",
      startDate: ed.startDate?.trim() ?? "",
      endDate: ed.endDate?.trim() ?? "",
    }))
    .filter((ed) => ed.institution.length > 0 && ed.degree.length > 0);

  const c = p.contact || ({} as Profile["contact"]);
  const contact = {
    fullName: c.fullName?.trim() || undefined,
    email: c.email?.trim() || undefined,
    phone: c.phone?.trim() || undefined,
    location: c.location?.trim() || undefined,
    linkedin: c.linkedin?.trim() || undefined,
    portfolio: c.portfolio?.trim() || undefined,
    github: c.github?.trim() || undefined,
  };

  return {
    ...p,
    contact,
    experience,
    education,
    skills: {
      technical: (p.skills?.technical || []).map((s) => s.trim()).filter(Boolean),
      soft: (p.skills?.soft || []).map((s) => s.trim()).filter(Boolean),
      languages: (p.skills?.languages || []).map((s) => s.trim()).filter(Boolean),
      certifications: (p.skills?.certifications || []).map((s) => s.trim()).filter(Boolean),
    },
  };
}

export async function generateResume(params: {
  profile: Profile;
  jobDescription: string;
  profileId?: string;
}): Promise<GenerateResponse> {
  const cleaned = { ...params, profile: sanitizeProfileForSend(params.profile) };

  const res = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleaned),
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
