"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

const STEPS = ["Contact", "Experience", "Education", "Skills"] as const;

export default function ProfileForm({
  profile,
  onChange,
  onSubmit,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  onSubmit: () => void;
}) {
  const [step, setStep] = useState(0);

  const update = (patch: Partial<Profile>) => onChange({ ...profile, ...patch });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Step indicator */}
      <div className="mb-6 flex gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
              i === step
                ? "bg-brand-600 text-white"
                : i < step
                ? "bg-brand-100 text-brand-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 && <ContactStep profile={profile} update={update} />}
      {step === 1 && <ExperienceStep profile={profile} update={update} />}
      {step === 2 && <EducationStep profile={profile} update={update} />}
      {step === 3 && <SkillsStep profile={profile} update={update} />}

      <div className="mt-6 flex justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-30"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Continue to Job Description →
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}

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

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Full Name" value={c.fullName} onChange={(v) => setContact({ fullName: v })} />
      <Field label="Email" value={c.email} onChange={(v) => setContact({ email: v })} type="email" />
      <Field label="Phone" value={c.phone ?? ""} onChange={(v) => setContact({ phone: v })} />
      <Field label="Location" value={c.location ?? ""} onChange={(v) => setContact({ location: v })} />
      <Field label="LinkedIn URL" value={c.linkedin ?? ""} onChange={(v) => setContact({ linkedin: v })} />
      <Field label="Portfolio URL" value={c.portfolio ?? ""} onChange={(v) => setContact({ portfolio: v })} />
      <div className="col-span-2">
        <span className="mb-1 block text-xs font-medium text-gray-600">Professional Summary (optional — AI will tailor this)</span>
        <textarea
          value={profile.summary ?? ""}
          onChange={(e) => update({ summary: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
    </div>
  );
}

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
      {profile.experience.map((exp, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Role {i + 1}</span>
            {profile.experience.length > 1 && (
              <button
                onClick={() => removeExp(i)}
                className="text-xs font-medium text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company" value={exp.company} onChange={(v) => setExp(i, { company: v })} />
            <Field label="Job Title" value={exp.title} onChange={(v) => setExp(i, { title: v })} />
            <Field label="Location" value={exp.location ?? ""} onChange={(v) => setExp(i, { location: v })} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start (YYYY-MM)" value={exp.startDate} onChange={(v) => setExp(i, { startDate: v })} />
              <Field label="End (or Present)" value={exp.endDate ?? ""} onChange={(v) => setExp(i, { endDate: v })} />
            </div>
          </div>

          <div className="mt-4">
            <span className="mb-2 block text-xs font-medium text-gray-600">
              Bullet points (raw — the AI will tailor these per job)
            </span>
            <div className="space-y-2">
              {exp.bullets.map((b, bi) => (
                <div key={bi} className="flex gap-2">
                  <textarea
                    value={b}
                    onChange={(e) => setBullet(i, bi, e.target.value)}
                    rows={2}
                    placeholder="Describe what you did and the impact"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  {exp.bullets.length > 1 && (
                    <button
                      onClick={() => removeBullet(i, bi)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => addBullet(i)}
              className="mt-2 text-xs font-medium text-brand-600 hover:underline"
            >
              + Add bullet point
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addExp}
        className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-brand-400 hover:text-brand-600"
      >
        + Add another role
      </button>
    </div>
  );
}

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
    <div className="space-y-4">
      {profile.education.map((edu, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Education {i + 1}</span>
            {profile.education.length > 1 && (
              <button
                onClick={() => removeEdu(i)}
                className="text-xs font-medium text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Institution" value={edu.institution} onChange={(v) => setEdu(i, { institution: v })} />
            <Field label="Degree" value={edu.degree} onChange={(v) => setEdu(i, { degree: v })} />
            <Field label="Field of Study" value={edu.fieldOfStudy ?? ""} onChange={(v) => setEdu(i, { fieldOfStudy: v })} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start" value={edu.startDate ?? ""} onChange={(v) => setEdu(i, { startDate: v })} />
              <Field label="End" value={edu.endDate ?? ""} onChange={(v) => setEdu(i, { endDate: v })} />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addEdu}
        className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-brand-400 hover:text-brand-600"
      >
        + Add another degree
      </button>
    </div>
  );
}

function SkillsStep({
  profile,
  update,
}: {
  profile: Profile;
  update: (p: Partial<Profile>) => void;
}) {
  const setSkillList = (key: keyof Profile["skills"], value: string) =>
    update({
      skills: {
        ...profile.skills,
        [key]: value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    });

  return (
    <div className="space-y-4">
      <TagInput
        label="Technical Skills (comma-separated)"
        value={profile.skills.technical.join(", ")}
        onChange={(v) => setSkillList("technical", v)}
        placeholder="React, TypeScript, PostgreSQL, AWS"
      />
      <TagInput
        label="Soft Skills (comma-separated)"
        value={profile.skills.soft.join(", ")}
        onChange={(v) => setSkillList("soft", v)}
        placeholder="Leadership, Cross-functional collaboration"
      />
      <TagInput
        label="Languages (comma-separated)"
        value={profile.skills.languages.join(", ")}
        onChange={(v) => setSkillList("languages", v)}
        placeholder="English (native), Spanish (conversational)"
      />
      <TagInput
        label="Certifications (comma-separated)"
        value={profile.skills.certifications.join(", ")}
        onChange={(v) => setSkillList("certifications", v)}
        placeholder="AWS Certified Solutions Architect"
      />
    </div>
  );
}

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}
