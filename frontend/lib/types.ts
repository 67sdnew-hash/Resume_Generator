export interface ContactInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
}

export interface ExperienceEntry {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  bullets: string[];
  optimizedBullets?: string[];
}

export interface EducationEntry {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications: string[];
}

export interface Profile {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: Skills;
}

export interface GenerationOutput {
  summary: string;
  optimizedExperience: { id: string; company?: string; optimizedBullets: string[] }[];
  prioritizedSkills: { technical?: string[]; soft?: string[] };
  coverLetter: string;
  matchNotes?: string;
}

export interface GenerateResponse {
  success: boolean;
  profileId: string;
  generationId: string;
  data: GenerationOutput;
  cannedFallback?: boolean;
}

export const emptyProfile: Profile = {
  contact: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    github: "",
  },

  summary: "",

  experience: [],

  education: [],

  skills: {
    technical: [],
    soft: [],
    languages: [],
    certifications: [],
  },
};
