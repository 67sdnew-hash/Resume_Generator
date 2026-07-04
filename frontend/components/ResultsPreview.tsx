"use client";

import type { GenerationOutput, Profile } from "@/lib/types";
import { pdfDownloadUrl } from "@/lib/api";

export default function ResultsPreview({
  profile,
  output,
  generationId,
}: {
  profile: Profile;
  output: GenerationOutput;
  generationId: string;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <a
          href={pdfDownloadUrl(generationId, "resume")}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Download Resume PDF
        </a>
        <a
          href={pdfDownloadUrl(generationId, "cover_letter")}
          className="rounded-lg border border-brand-600 px-5 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Download Cover Letter PDF
        </a>
      </div>

      {/* Resume preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold">{profile.contact.fullName}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {[profile.contact.email, profile.contact.phone, profile.contact.location]
            .filter(Boolean)
            .join("  ·  ")}
        </p>

        <SectionTitle>Professional Summary</SectionTitle>
        <p className="text-sm leading-relaxed text-gray-800">{output.summary}</p>

        <SectionTitle>Experience</SectionTitle>
        <div className="space-y-5">
          {profile.experience.map((exp, i) => {
            const optimized = output.optimizedExperience.find(
              (o) => o.id === (exp.id ?? `exp_${i}`)
            );
            const bullets = optimized?.optimizedBullets?.length
              ? optimized.optimizedBullets
              : exp.bullets;
            return (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">
                    {exp.title} — {exp.company}
                  </p>
                  <p className="text-xs italic text-gray-500">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </p>
                </div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-800">
                  {bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <SectionTitle>Education</SectionTitle>
        <div className="space-y-2">
          {profile.education.map((edu, i) => (
            <div key={i}>
              <p className="font-semibold">
                {edu.degree}
                {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
              </p>
              <p className="text-sm text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </div>

        {(output.prioritizedSkills.technical?.length ||
          output.prioritizedSkills.soft?.length) && (
          <>
            <SectionTitle>Skills</SectionTitle>
            {output.prioritizedSkills.technical?.length ? (
              <p className="text-sm">
                <span className="font-semibold">Technical: </span>
                {output.prioritizedSkills.technical.join(", ")}
              </p>
            ) : null}
            {output.prioritizedSkills.soft?.length ? (
              <p className="text-sm">
                <span className="font-semibold">Additional: </span>
                {output.prioritizedSkills.soft.join(", ")}
              </p>
            ) : null}
          </>
        )}
      </div>

      {/* Cover letter preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Cover Letter</h3>
        <div className="space-y-3 text-sm leading-relaxed text-gray-800">
          {output.coverLetter
            .split("\n")
            .filter((p) => p.trim())
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-6 border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
      {children}
    </h3>
  );
}
