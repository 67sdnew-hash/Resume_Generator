import { z } from "zod";

/**
 * ---- INPUT: Candidate profile submitted from the frontend ----
 * Mirrors schemas/profile.schema.json. Keep these in sync manually,
 * or generate one from the other with a tool like `json-schema-to-zod`
 * once the shape stabilizes.
 */
export const ExperienceEntrySchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  bullets: z.array(z.string()).min(1, "At least one bullet point is required"),
});

export const EducationEntrySchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional(),
});

export const SkillsSchema = z.object({
  technical: z.array(z.string()).optional(),
  soft: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

export const ContactSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  github: z.string().url().optional(),
});

export const ProfileSchema = z.object({
  contact: ContactSchema,
  summary: z.string().optional(),
  experience: z.array(ExperienceEntrySchema).min(1),
  education: z.array(EducationEntrySchema),
  skills: SkillsSchema,
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        link: z.string().url().optional(),
      })
    )
    .optional(),
});

export const GenerateRequestSchema = z.object({
  profile: ProfileSchema,
  jobDescription: z.string().min(50, "Job description too short — paste the full posting"),
  profileId: z.string().optional(), // present on repeat generations against a saved profile
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * ---- OUTPUT: Validated shape of whatever the LLM tool call returns ----
 * Re-validate the LLM's output against this before it ever touches your
 * DB or the PDF renderer. A model can technically satisfy the tool schema
 * and still return something semantically broken (empty arrays, etc.).
 */
export const OptimizedExperienceSchema = z.object({
  id: z.string(),
  company: z.string().optional(),
  optimizedBullets: z.array(z.string()).min(1),
});

export const GenerationOutputSchema = z.object({
  summary: z.string().min(1),
  optimizedExperience: z.array(OptimizedExperienceSchema).min(1),
  prioritizedSkills: z.object({
    technical: z.array(z.string()).optional(),
    soft: z.array(z.string()).optional(),
  }),
  coverLetter: z.string().min(1),
  matchNotes: z.string().optional(),
});

export type GenerationOutput = z.infer<typeof GenerationOutputSchema>;
