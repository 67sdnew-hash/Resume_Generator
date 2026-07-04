"use client";

import React, { useState } from "react";
import type { Profile } from "@/lib/types";
import { 
  User, Mail, Phone, MapPin, Globe, 
  Briefcase, GraduationCap, Plus, Trash2, X, Sparkles, 
  ArrowLeft, ArrowRight, Calendar, Award 
} from "lucide-react";

// Custom SVG brand icons since brand icons are not exported in latest lucide-react versions
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export interface ProfileFormProps {
  profile: Profile;
  onChange: (p: Profile) => void;
  onSubmit: () => void;
  step: number;
  setStep: (s: number) => void;
  totalSteps: number;
}

export default function ProfileForm({
  profile,
  onChange,
  onSubmit,
  step,
  setStep,
  totalSteps,
}: ProfileFormProps) {
  const update = (patch: Partial<Profile>) => onChange({ ...profile, ...patch });

  const next = () => setStep(Math.min(step + 1, totalSteps - 1));
  const back = () => setStep(Math.max(step - 1, 0));

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-xl border border-cardBorder transition-all duration-300">
      {/* Active step form body */}
      <div className="min-h-[350px]">
        {step === 0 && <ContactStep profile={profile} update={update} />}
        {step === 1 && <ExperienceStep profile={profile} update={update} />}
        {step === 2 && <EducationStep profile={profile} update={update} />}
        {step === 3 && <SkillsStep profile={profile} update={update} />}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-text hover:bg-border/30 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step < 3 ? (
          <button
            onClick={next}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200 group"
          >
            Next
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent text-white font-medium text-sm hover:shadow-lg hover:shadow-secondary/20 active:scale-[0.98] transition-all duration-200 group"
          >
            Continue to Job Description
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

/* Floating Input Field Component */
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon: React.ReactNode;
}

function PremiumField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group w-full">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
        focused ? "text-primary" : "text-muted/70 group-hover:text-muted"
      }`}>
        {icon}
      </div>
      <input
        type={type}
        value={value}
        placeholder={focused ? placeholder : ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface/40 dark:bg-background/40 pl-11 pr-4 pt-6 pb-2 text-sm text-text rounded-2xl border border-border/80 focus:border-primary focus:bg-surface/80 dark:focus:bg-background/80 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200"
      />
      <label className={`absolute left-11 pointer-events-none transition-all duration-200 ${
        active 
          ? "top-1.5 text-[10px] font-semibold text-primary" 
          : "top-1/2 -translate-y-1/2 text-sm text-muted"
      }`}>
        {label}
      </label>
    </div>
  );
}

/* Contact Details Step */
function ContactStep({
  profile,
  update,
}: {
  profile: Profile;
  update: (p: Partial<Profile>) => void;
}) {
  const c = profile.contact;
  const setContact = (patch: Partial<Profile["contact"]>) =>
    update({ contact: { ...c, ...patch } });

  const summaryLength = profile.summary?.length ?? 0;
  const maxSummary = 500;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-text flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Contact Information
        </h3>
        <p className="text-xs text-muted mt-1">
          Tell us how recruiters can reach you. Ensure links are formatted correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PremiumField label="Full Name" value={c.fullName ?? ""} onChange={(v) => setContact({ fullName: v })} icon={<User className="w-4 h-4" />} placeholder="John Doe" />
        <PremiumField label="Email Address" value={c.email ?? ""} onChange={(v) => setContact({ email: v })} type="email" icon={<Mail className="w-4 h-4" />} placeholder="john@example.com" />
        <PremiumField label="Phone Number" value={c.phone ?? ""} onChange={(v) => setContact({ phone: v })} icon={<Phone className="w-4 h-4" />} placeholder="+1 (555) 000-0000" />
        <PremiumField label="Location" value={c.location ?? ""} onChange={(v) => setContact({ location: v })} icon={<MapPin className="w-4 h-4" />} placeholder="San Francisco, CA" />
        <PremiumField label="LinkedIn Profile" value={c.linkedin ?? ""} onChange={(v) => setContact({ linkedin: v })} icon={<LinkedinIcon className="w-4 h-4" />} placeholder="linkedin.com/in/username" />
        <PremiumField label="Portfolio Website" value={c.portfolio ?? ""} onChange={(v) => setContact({ portfolio: v })} icon={<Globe className="w-4 h-4" />} placeholder="portfolio.com" />
        <div className="md:col-span-2">
          <PremiumField label="GitHub Profile" value={c.github ?? ""} onChange={(v) => setContact({ github: v })} icon={<GithubIcon className="w-4 h-4" />} placeholder="github.com/username" />
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
            Professional Summary (AI will tailor this for each job description)
          </label>
          <span className={`text-[10px] font-mono ${summaryLength > maxSummary ? "text-error" : "text-muted"}`}>
            {summaryLength}/{maxSummary}
          </span>
        </div>
        <div className="relative">
          <textarea
            value={profile.summary ?? ""}
            onChange={(e) => update({ summary: e.target.value.slice(0, maxSummary) })}
            rows={4}
            placeholder="A short overview of your background, experience, and what values you bring..."
            className="w-full bg-surface/40 dark:bg-background/40 px-4 py-3 text-sm text-text rounded-2xl border border-border/80 focus:border-primary focus:bg-surface/80 dark:focus:bg-background/80 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* Experience Step */
function ExperienceStep({
  profile,
  update,
}: {
  profile: Profile;
  update: (p: Partial<Profile>) => void;
}) {
  const setExp = (i: number, patch: Partial<Profile["experience"][number]>) => {
    const next = [...profile.experience];
    next[i] = { ...next[i], ...patch };
    update({ experience: next });
  };

  const addExp = () =>
    update({
      experience: [
        ...profile.experience,
        { company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] },
      ],
    });

  const removeExp = (i: number) =>
    update({ experience: profile.experience.filter((_, idx) => idx !== i) });

  const setBullet = (expIdx: number, bulletIdx: number, value: string) => {
    const exp = profile.experience[expIdx];
    const bullets = [...exp.bullets];
    bullets[bulletIdx] = value;
    setExp(expIdx, { bullets });
  };

  const addBullet = (expIdx: number) =>
    setExp(expIdx, { bullets: [...profile.experience[expIdx].bullets, ""] });

  const removeBullet = (expIdx: number, bulletIdx: number) =>
    setExp(expIdx, {
      bullets: profile.experience[expIdx].bullets.filter((_, i) => i !== bulletIdx),
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-text flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Work Experience
          </h3>
          <p className="text-xs text-muted mt-1">
            Add your past jobs. Use detailed bullets; the AI will optimize them.
          </p>
        </div>
        <button
          onClick={addExp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Role
        </button>
      </div>

      <div className="space-y-6">
        {profile.experience.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/80 bg-surface/20 text-center">
            <Briefcase className="w-8 h-8 text-muted/50 mb-2" />
            <p className="text-sm font-medium text-text">No roles added yet</p>
            <p className="text-xs text-muted mt-1 max-w-[240px]">
              Add your work history so the AI has material to work with.
            </p>
            <button
              onClick={addExp}
              className="mt-4 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/95 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Role
            </button>
          </div>
        ) : (
          profile.experience.map((exp, i) => (
            <div 
              key={i} 
              className="group/card relative bg-surface/30 dark:bg-background/20 p-5 md:p-6 rounded-2xl border border-border/80 hover:border-primary/30 hover:bg-surface/50 dark:hover:bg-background/40 hover:shadow-md transition-all duration-300"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-border text-muted uppercase">
                  Role {i + 1}
                </span>
                <button
                  onClick={() => removeExp(i)}
                  className="p-1 rounded-lg text-muted/60 hover:text-error hover:bg-error/10 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
                  title="Remove this role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <PremiumField label="Company" value={exp.company} onChange={(v) => setExp(i, { company: v })} icon={<Briefcase className="w-4 h-4" />} placeholder="Google" />
                <PremiumField label="Job Title" value={exp.title} onChange={(v) => setExp(i, { title: v })} icon={<User className="w-4 h-4" />} placeholder="Senior Software Engineer" />
                <PremiumField label="Location" value={exp.location ?? ""} onChange={(v) => setExp(i, { location: v })} icon={<MapPin className="w-4 h-4" />} placeholder="Remote / New York" />
                
                <div className="grid grid-cols-2 gap-3">
                  <PremiumField label="Start (YYYY-MM)" value={exp.startDate} onChange={(v) => setExp(i, { startDate: v })} icon={<Calendar className="w-4 h-4" />} placeholder="2022-01" />
                  <PremiumField label="End (or Present)" value={exp.endDate ?? ""} onChange={(v) => setExp(i, { endDate: v })} icon={<Calendar className="w-4 h-4" />} placeholder="Present" />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
                    Responsibility Bullet Points
                  </label>
                  <button
                    onClick={() => addBullet(i)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Bullet
                  </button>
                </div>

                <div className="space-y-3">
                  {exp.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex gap-2 items-start group/bullet">
                      <textarea
                        value={bullet}
                        onChange={(e) => setBullet(i, bi, e.target.value)}
                        rows={2}
                        placeholder="Led development of core features contributing to 20% growth..."
                        className="flex-1 bg-surface/30 dark:bg-background/30 px-3 py-2 text-sm text-text rounded-xl border border-border/60 focus:border-primary focus:bg-surface/60 dark:focus:bg-background/60 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200 resize-none"
                      />
                      {exp.bullets.length > 1 && (
                        <button
                          onClick={() => removeBullet(i, bi)}
                          className="mt-1 p-1 rounded-lg text-muted/50 hover:text-error hover:bg-error/10 opacity-0 group-hover/bullet:opacity-100 transition-all duration-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* Education Step */
function EducationStep({
  profile,
  update,
}: {
  profile: Profile;
  update: (p: Partial<Profile>) => void;
}) {
  const setEdu = (i: number, patch: Partial<Profile["education"][number]>) => {
    const next = [...profile.education];
    next[i] = { ...next[i], ...patch };
    update({ education: next });
  };

  const addEdu = () =>
    update({
      education: [
        ...profile.education,
        { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" },
      ],
    });

  const removeEdu = (i: number) =>
    update({ education: profile.education.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-text flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Education
          </h3>
          <p className="text-xs text-muted mt-1">
            Specify your academic history, degrees, and institutions.
          </p>
        </div>
        <button
          onClick={addEdu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Degree
        </button>
      </div>

      <div className="space-y-6">
        {profile.education.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/80 bg-surface/20 text-center">
            <GraduationCap className="w-8 h-8 text-muted/50 mb-2" />
            <p className="text-sm font-medium text-text">No education added yet</p>
            <p className="text-xs text-muted mt-1 max-w-[240px]">
              Add your degrees, certificates, or training history.
            </p>
            <button
              onClick={addEdu}
              className="mt-4 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/95 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Degree
            </button>
          </div>
        ) : (
          profile.education.map((edu, i) => (
            <div 
              key={i} 
              className="group/card relative bg-surface/30 dark:bg-background/20 p-5 md:p-6 rounded-2xl border border-border/80 hover:border-primary/30 hover:bg-surface/50 dark:hover:bg-background/40 hover:shadow-md transition-all duration-300"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-border text-muted uppercase">
                  Edu {i + 1}
                </span>
                <button
                  onClick={() => removeEdu(i)}
                  className="p-1 rounded-lg text-muted/60 hover:text-error hover:bg-error/10 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
                  title="Remove this entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <PremiumField label="Institution" value={edu.institution} onChange={(v) => setEdu(i, { institution: v })} icon={<GraduationCap className="w-4 h-4" />} placeholder="Stanford University" />
                <PremiumField label="Degree" value={edu.degree} onChange={(v) => setEdu(i, { degree: v })} icon={<Award className="w-4 h-4" />} placeholder="Bachelor of Science" />
                <PremiumField label="Field of Study" value={edu.fieldOfStudy ?? ""} onChange={(v) => setEdu(i, { fieldOfStudy: v })} icon={<Globe className="w-4 h-4" />} placeholder="Computer Science" />
                
                <div className="grid grid-cols-2 gap-3">
                  <PremiumField label="Start (YYYY-MM)" value={edu.startDate ?? ""} onChange={(v) => setEdu(i, { startDate: v })} icon={<Calendar className="w-4 h-4" />} placeholder="2018-09" />
                  <PremiumField label="End (or Present)" value={edu.endDate ?? ""} onChange={(v) => setEdu(i, { endDate: v })} icon={<Calendar className="w-4 h-4" />} placeholder="2022-06" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* Skills Step (Premium Interactive Pill Interface) */
function SkillsStep({
  profile,
  update,
}: {
  profile: Profile;
  update: (p: Partial<Profile>) => void;
}) {
  const getSkillList = (key: keyof Profile["skills"]) => profile.skills[key] || [];

  const handleRemoveSkill = (key: keyof Profile["skills"], index: number) => {
    const list = [...getSkillList(key)];
    list.splice(index, 1);
    update({
      skills: {
        ...profile.skills,
        [key]: list,
      },
    });
  };

  const handleAddSkill = (key: keyof Profile["skills"], skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const current = getSkillList(key);
    if (current.includes(trimmed)) return;
    update({
      skills: {
        ...profile.skills,
        [key]: [...current, trimmed],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-text flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Skills &amp; Expertise
        </h3>
        <p className="text-xs text-muted mt-1">
          Add your expertise. Type a skill and press Enter or use commas to separate them.
        </p>
      </div>

      <div className="space-y-5">
        <PremiumTagInput
          label="Technical Skills"
          skills={getSkillList("technical")}
          onRemove={(idx) => handleRemoveSkill("technical", idx)}
          onAdd={(skill) => handleAddSkill("technical", skill)}
          placeholder="React, TypeScript, Node.js, Python, AWS..."
          colorClass="bg-primary/10 text-primary border-primary/20"
        />

        <PremiumTagInput
          label="Soft Skills"
          skills={getSkillList("soft")}
          onRemove={(idx) => handleRemoveSkill("soft", idx)}
          onAdd={(skill) => handleAddSkill("soft", skill)}
          placeholder="Leadership, Public Speaking, Agile..."
          colorClass="bg-secondary/10 text-secondary border-secondary/20"
        />

        <PremiumTagInput
          label="Languages"
          skills={getSkillList("languages")}
          onRemove={(idx) => handleRemoveSkill("languages", idx)}
          onAdd={(skill) => handleAddSkill("languages", skill)}
          placeholder="English (Fluent), Spanish (Conversational)..."
          colorClass="bg-accent/10 text-accent border-accent/20"
        />

        <PremiumTagInput
          label="Certifications"
          skills={getSkillList("certifications")}
          onRemove={(idx) => handleRemoveSkill("certifications", idx)}
          onAdd={(skill) => handleAddSkill("certifications", skill)}
          placeholder="AWS Solutions Architect, PMP..."
          colorClass="bg-success/10 text-success border-success/20"
        />
      </div>
    </div>
  );
}

/* Premium Tag Input with interactive pill display */
function PremiumTagInput({
  label,
  skills,
  onRemove,
  onAdd,
  placeholder,
  colorClass,
}: {
  label: string;
  skills: string[];
  onRemove: (idx: number) => void;
  onAdd: (skill: string) => void;
  placeholder: string;
  colorClass: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const commitSkill = () => {
    if (inputValue.includes(",")) {
      inputValue.split(",").forEach((item) => {
        if (item.trim()) onAdd(item.trim());
      });
    } else {
      onAdd(inputValue.trim());
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitSkill();
    } else if (e.key === ",") {
      e.preventDefault();
      commitSkill();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted">{label}</label>
      
      <div className="min-h-[48px] p-2 bg-surface/30 dark:bg-background/30 rounded-2xl border border-border/80 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
        <div className="flex flex-wrap gap-1.5 items-center">
          {skills.map((skill, idx) => (
            <span 
              key={idx} 
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border shadow-sm ${colorClass}`}
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitSkill}
            placeholder={skills.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent border-0 py-1 px-2 text-xs text-text focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
