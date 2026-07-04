import { z } from "zod";

/**
 * ---- INPUT: Candidate profile submitted from the frontend ----
 */
export const ExperienceEntrySchema = z.object({
  id: z.string().optional(),
  company: z.string().optional().default(""),
  title: z.string().optional().default(""),
  location: z.string().optional(),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  bullets: z.array(z.string()).optional().default([]),
});

export const EducationEntrySchema = z.object({
  id: z.string().optional(),
  institution: z.string().optional().default(""),
  degree: z.string().optional().default(""),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional(),
});

export const SkillsSchema = z.object({
  technical: z.array(z.string()).optional().default([]),
  soft: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
});

export const ContactSchema = z.object({
  fullName: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  github: z.string().optional(),
});

export const ProfileSchema = z.object({
  contact: ContactSchema.optional().default({}),
  summary: z.string().optional(),
  experience: z.array(ExperienceEntrySchema).optional().default([]),
  education: z.array(EducationEntrySchema).optional().default([]),
  skills: SkillsSchema.optional().default({}),
  projects: z.array(z.any()).optional(),
});

export const GenerateRequestSchema = z.object({
  profile: ProfileSchema,
  jobDescription: z.string().optional().default(""),
  profileId: z.string().optional(),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * ---- OUTPUT: Validated shape of whatever the LLM tool call returns ----
 */
export const OptimizedExperienceSchema = z.object({
  id: z.string().optional().default("exp_0"),
  company: z.string().optional(),
  optimizedBullets: z.array(z.string()).optional().default([]),
});

export const GenerationOutputSchema = z.object({
  summary: z.string().optional().default(""),
  optimizedExperience: z.array(OptimizedExperienceSchema).optional().default([]),
  prioritizedSkills: z.object({
    technical: z.array(z.string()).optional(),
    soft: z.array(z.string()).optional(),
  }).optional(),
  coverLetter: z.string().optional().default(""),
  matchNotes: z.string().optional(),
});

export type GenerationOutput = z.infer<typeof GenerationOutputSchema>;