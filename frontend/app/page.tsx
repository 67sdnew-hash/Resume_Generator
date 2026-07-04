"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import ResultsPreview from "@/components/ResultsPreview";
import { emptyProfile, type Profile, type GenerateResponse } from "@/lib/types";
import { generateResume } from "@/lib/api";

type Stage = "form" | "job-description" | "loading" | "results" | "error";

export default function HomePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [jobDescription, setJobDescription] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    setStage("loading");
    setErrorMsg("");
    try {
      const response = await generateResume({
        profile,
        jobDescription,
        profileId: result?.profileId,
      });
      setResult(response);
      setStage("results");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">AI Resume &amp; Cover Letter Generator</h1>
        <p className="mt-2 text-sm text-gray-500">
          Fill in your profile once, then tailor it to any job description in seconds.
        </p>
      </header>

      {stage === "form" && (
        <ProfileForm
          profile={profile}
          onChange={setProfile}
          onSubmit={() => setStage("job-description")}
        />
      )}

      {stage === "job-description" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Paste the Target Job Description</h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            placeholder="Paste the full job posting here..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-gray-400">{jobDescription.length} characters (minimum 50)</p>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStage("form")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600"
            >
              ← Back to Profile
            </button>
            <button
              onClick={handleGenerate}
              disabled={jobDescription.trim().length < 50}
              className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Generate Tailored Resume
            </button>
          </div>
        </div>
      )}

      {stage === "loading" && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-4 text-sm text-gray-500">
            Tailoring your resume and writing your cover letter...
          </p>
        </div>
      )}

      {stage === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">Generation failed: {errorMsg}</p>
          <button
            onClick={() => setStage("job-description")}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {stage === "results" && result && (
        <div>
          <ResultsPreview
            profile={profile}
            output={result.data}
            generationId={result.generationId}
          />
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setStage("job-description")}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              ← Tailor for a different job
            </button>
            <button
              onClick={() => setStage("form")}
              className="text-sm font-medium text-gray-500 hover:underline"
            >
              Edit profile
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
