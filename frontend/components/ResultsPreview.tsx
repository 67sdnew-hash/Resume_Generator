"use client";

import React, { useEffect, useState } from "react";
import type { GenerationOutput, Profile } from "@/lib/types";
import { pdfDownloadUrl } from "@/lib/api";
import { 
  Download, Copy, RefreshCw, Check, Sparkles, FileText, 
  Layers, AlertTriangle, ArrowLeft, Send, CheckCircle2 
} from "lucide-react";

interface ResultsPreviewProps {
  profile: Profile;
  output: GenerationOutput;
  generationId: string;
  cannedFallback?: boolean;
  jobDescription?: string;
  onBackToJob: () => void;
  onBackToProfile: () => void;
}

export default function ResultsPreview({
  profile,
  output,
  generationId,
  cannedFallback,
  jobDescription = "",
  onBackToJob,
  onBackToProfile,
}: ResultsPreviewProps) {
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [activeTab, setActiveTab] = useState<"resume" | "letter">("resume");
  const [showToast, setShowToast] = useState<string | null>(null);

  // ATS metrics state
  const [atsScore, setAtsScore] = useState(0);
  const [keywordCoverage, setKeywordCoverage] = useState(0);
  const [skillsMatchScore, setSkillsMatchScore] = useState(0);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Trigger metrics animation on mount
  useEffect(() => {
    // 1. Keyword extraction from job description
    const jdWords = jobDescription.toLowerCase().match(/\b[a-z]{3,15}\b/g) || [];
    const resumeText = JSON.stringify({
      summary: output.summary,
      skills: output.prioritizedSkills,
      experience: output.optimizedExperience,
      education: profile.education
    }).toLowerCase();

    // Standard high-value keywords to look for
    const techKeywords = [
      "react", "typescript", "javascript", "python", "java", "c++", "go", "rust",
      "ruby", "rails", "node", "express", "next", "vue", "angular", "graphql", "rest",
      "sql", "postgres", "mongodb", "redis", "aws", "gcp", "azure", "docker", "kubernetes",
      "ci/cd", "git", "linux", "testing", "agile", "scrum", "product", "design", "figma"
    ];

    const jdKeywords = Array.from(new Set(jdWords.filter(w => techKeywords.includes(w))));
    
    // 2. Identify matches
    const matched = jdKeywords.filter(kw => resumeText.includes(kw));
    const missing = jdKeywords.filter(kw => !resumeText.includes(kw));

    setDetectedKeywords(matched);
    setMissingKeywords(missing);

    // 3. Compute Scores
    const coverageVal = jdKeywords.length > 0 
      ? Math.round((matched.length / jdKeywords.length) * 100) 
      : 80;
    
    const candidateSkills = [
      ...(output.prioritizedSkills.technical ?? []),
      ...(output.prioritizedSkills.soft ?? [])
    ].map(s => s.toLowerCase());

    const jdRequirementsMatched = candidateSkills.filter(s => 
      jobDescription.toLowerCase().includes(s)
    );
    
    const skillsScoreVal = candidateSkills.length > 0
      ? Math.min(100, Math.round((jdRequirementsMatched.length / Math.max(5, candidateSkills.length)) * 120))
      : 70;

    // ATS Score formula
    const finalAtsScore = Math.min(100, Math.round(
      (coverageVal * 0.4) + (skillsScoreVal * 0.4) + (output.summary ? 20 : 0)
    ));

    // Dynamic suggestions
    const generatedSuggestions: string[] = [];
    if (missing.length > 0) {
      generatedSuggestions.push(`Incorporate missing keywords: ${missing.slice(0, 3).join(", ")}`);
    }
    const hasNumbers = /\b\d+%\b|\b\d+\s*(?:million|thousand|k|m)\b|\b\d+\b/i.test(
      JSON.stringify(output.optimizedExperience)
    );
    if (!hasNumbers) {
      generatedSuggestions.push("Quantify achievements in your bullet points (e.g., adding percentages, revenue, or time saved).");
    }
    if (output.summary.length < 100) {
      generatedSuggestions.push("Expand your Professional Summary to highlight 2 more key achievements.");
    }
    if ((profile.contact.linkedin?.length ?? 0) === 0) {
      generatedSuggestions.push("Add a LinkedIn URL to your contact profile to build web credibility.");
    }
    if (generatedSuggestions.length === 0) {
      generatedSuggestions.push("Your resume is highly optimized! Ready to submit.");
    }

    setSuggestions(generatedSuggestions);

    // Animate the values rising
    const duration = 1200; // ms
    const steps = 60;
    const interval = duration / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      setAtsScore(Math.round((finalAtsScore / steps) * stepCount));
      setKeywordCoverage(Math.round((coverageVal / steps) * stepCount));
      setSkillsMatchScore(Math.round((skillsScoreVal / steps) * stepCount));

      if (stepCount >= steps) {
        setAtsScore(finalAtsScore);
        setKeywordCoverage(coverageVal);
        setSkillsMatchScore(skillsScoreVal);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [jobDescription, output, profile]);

  const copyToClipboard = (text: string, isResume: boolean) => {
    navigator.clipboard.writeText(text);
    if (isResume) {
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    } else {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
    triggerToast("Copied to clipboard!");
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Compile entire resume text for copy function
  const getResumeCopyText = () => {
    const contactLine = [profile.contact.fullName, profile.contact.email, profile.contact.phone, profile.contact.location]
      .filter(Boolean)
      .join(" | ");
    const experienceText = profile.experience.map((exp, i) => {
      const optimized = output.optimizedExperience.find(o => o.id === (exp.id ?? `exp_${i}`));
      const bullets = optimized?.optimizedBullets?.length ? optimized.optimizedBullets : exp.bullets;
      return `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})\n${bullets.map(b => `• ${b}`).join("\n")}`;
    }).join("\n\n");
    
    const educationText = profile.education.map(edu => 
      `${edu.degree} in ${edu.fieldOfStudy || "Field"} - ${edu.institution}`
    ).join("\n");

    const skillsLine = `Technical: ${output.prioritizedSkills.technical?.join(", ") ?? ""}\nSoft: ${output.prioritizedSkills.soft?.join(", ") ?? ""}`;

    return `${profile.contact.fullName}\n${contactLine}\n\nSUMMARY\n${output.summary}\n\nEXPERIENCE\n${experienceText}\n\nEDUCATION\n${educationText}\n\nSKILLS\n${skillsLine}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-text text-background text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl border border-border/10 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          {showToast}
        </div>
      )}

      {cannedFallback && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 px-4 py-3 text-xs text-secondary flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          The server generated a local canned response (development mode fallback).
        </div>
      )}

      {/* TOP: ATS Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Score Card */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row lg:flex-col items-center justify-between gap-6 shadow-xl border border-cardBorder">
          <div className="flex flex-col items-center md:items-start lg:items-center text-center md:text-left lg:text-center">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">ATS MATCH RATING</span>
            <h4 className="text-sm font-semibold text-text mt-1">AI Job Description Match</h4>
          </div>
          
          {/* Animated Score Ring */}
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-border"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-primary transition-all duration-300"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * atsScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold tracking-tight text-text">{atsScore}</span>
              <span className="text-xs text-muted block -mt-1">%</span>
            </div>
          </div>

          <div className="w-full flex justify-around border-t border-border/50 pt-4 text-center">
            <div>
              <span className="text-xs text-muted block">Coverage</span>
              <span className="text-sm font-bold text-text">{keywordCoverage}%</span>
            </div>
            <div className="border-r border-border/50 h-8" />
            <div>
              <span className="text-xs text-muted block">Skills Matched</span>
              <span className="text-sm font-bold text-text">{skillsMatchScore}%</span>
            </div>
          </div>
        </div>

        {/* Suggestion / AI Feedback Card */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between shadow-xl border border-cardBorder">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
              <h4 className="text-sm font-bold text-text uppercase tracking-wider">AI Optimization Feedback</h4>
            </div>
            
            <div className="mt-4 space-y-3.5">
              {suggestions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-text">
                  <div className="mt-1 p-0.5 rounded bg-primary/10 text-primary">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords badges */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <span className="text-xs font-semibold text-muted block mb-2">Target Keywords Detected:</span>
            <div className="flex flex-wrap gap-1.5">
              {detectedKeywords.length === 0 ? (
                <span className="text-xs text-muted italic">None detected</span>
              ) : (
                detectedKeywords.map((kw, i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                    {kw}
                  </span>
                ))
              )}
              {missingKeywords.slice(0, 3).map((kw, i) => (
                <span key={i} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 capitalize">
                  +{kw} (missing)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT LAYOUT: Resume vs Cover Letter with tab toggles for responsiveness */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Column: Tailored Resume */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-text flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tailored Resume Draft
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(getResumeCopyText(), true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface/80 dark:bg-background/80 hover:bg-border/60 border border-border text-muted hover:text-text transition-all duration-200"
              >
                {copiedResume ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Text
              </button>
              <a
                href={pdfDownloadUrl(generationId, "resume")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 hover:shadow-md transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            </div>
          </div>

          {/* Premium Paper Resume Layout */}
          <div className="bg-white text-zinc-950 p-8 md:p-12 rounded-3xl shadow-xl border border-zinc-200/80 max-w-full overflow-hidden text-left font-serif">
            {/* Header */}
            <div className="text-center border-b border-zinc-200 pb-5">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 font-sans">{profile.contact.fullName}</h2>
              <div className="mt-2 text-xs text-zinc-600 flex flex-wrap justify-center gap-y-1 gap-x-3 font-sans">
                {profile.contact.email && (
                  <a href={`mailto:${profile.contact.email}`} className="hover:text-text underline-offset-2 hover:underline">
                    Email
                  </a>
                )}
                {profile.contact.phone && <span>• {profile.contact.phone}</span>}
                {profile.contact.location && <span>• {profile.contact.location}</span>}
                {profile.contact.linkedin && (
                  <a href={profile.contact.linkedin} target="_blank" rel="noreferrer" className="hover:text-text underline-offset-2 hover:underline">
                    LinkedIn
                  </a>
                )}
                {profile.contact.portfolio && (
                  <a href={profile.contact.portfolio} target="_blank" rel="noreferrer" className="hover:text-text underline-offset-2 hover:underline">
                    Portfolio
                  </a>
                )}
                {profile.contact.github && (
                  <a href={profile.contact.github} target="_blank" rel="noreferrer" className="hover:text-text underline-offset-2 hover:underline">
                    GitHub
                  </a>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 font-sans">
                Professional Summary
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-800 text-justify">{output.summary}</p>
            </div>

            {/* Experience */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 font-sans">
                Experience
              </h3>
              <div className="mt-3 space-y-4">
                {profile.experience.map((exp, i) => {
                  const optimized = output.optimizedExperience.find(o => o.id === (exp.id ?? `exp_${i}`));
                  const bullets = optimized?.optimizedBullets?.length ? optimized.optimizedBullets : exp.bullets;
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex items-baseline justify-between font-sans">
                        <span className="font-bold text-zinc-900">{exp.title}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {exp.startDate} – {exp.endDate || "Present"}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-600 font-sans italic">
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      <ul className="mt-1.5 list-disc pl-4 space-y-1 text-zinc-800 text-justify">
                        {bullets.map((b, bi) => (
                          <li key={bi} className="pl-0.5 leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Education */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 font-sans">
                Education
              </h3>
              <div className="mt-3 space-y-2">
                {profile.education.map((edu, i) => (
                  <div key={i} className="text-xs flex justify-between">
                    <div>
                      <span className="font-bold text-zinc-900">{edu.degree}</span>
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                      <span className="text-zinc-600"> — {edu.institution}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-sans">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 font-sans">
                Skills
              </h3>
              <div className="mt-2.5 text-xs space-y-1 text-zinc-800">
                {output.prioritizedSkills.technical?.length ? (
                  <p>
                    <span className="font-bold text-zinc-900 font-sans">Technical: </span>
                    {output.prioritizedSkills.technical.join(", ")}
                  </p>
                ) : null}
                {output.prioritizedSkills.soft?.length ? (
                  <p>
                    <span className="font-bold text-zinc-900 font-sans">Soft: </span>
                    {output.prioritizedSkills.soft.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tailored Cover Letter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-text flex items-center gap-2">
              <Layers className="w-5 h-5 text-secondary" />
              Tailored Cover Letter
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(output.coverLetter, false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface/80 dark:bg-background/80 hover:bg-border/60 border border-border text-muted hover:text-text transition-all duration-200"
              >
                {copiedLetter ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Text
              </button>
              <a
                href={pdfDownloadUrl(generationId, "cover_letter")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-secondary text-white hover:bg-secondary/90 hover:shadow-md transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            </div>
          </div>

          {/* Premium Paper Cover Letter Layout */}
          <div className="bg-white text-zinc-950 p-8 md:p-12 rounded-3xl shadow-xl border border-zinc-200/80 max-w-full overflow-hidden text-left font-serif min-h-[600px]">
            {/* Header info */}
            <div className="text-left pb-4 border-b border-zinc-150">
              <h3 className="text-lg font-bold text-zinc-900 font-sans">{profile.contact.fullName}</h3>
              <p className="text-[11px] text-zinc-500 font-sans">
                {[profile.contact.email, profile.contact.phone, profile.contact.location].filter(Boolean).join("  •  ")}
              </p>
            </div>

            <div className="mt-8 space-y-4 text-xs leading-relaxed text-zinc-800 text-justify whitespace-pre-line">
              {output.coverLetter}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTIONS: Back, Regenerate, Improve, etc */}
      <div className="glass-panel rounded-3xl p-6 flex flex-wrap gap-4 items-center justify-between border border-cardBorder shadow-xl mt-8">
        <button
          onClick={onBackToProfile}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-border/30 text-muted hover:text-text transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Profile
        </button>

        <div className="flex gap-3">
          <button
            onClick={onBackToJob}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-surface/50 border border-border text-text hover:bg-border/20 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Tailor Different Job
          </button>
          
          <button
            onClick={onBackToJob}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200"
          >
            <Send className="w-4 h-4 animate-pulse" />
            Optimize Further
          </button>
        </div>
      </div>
    </div>
  );
}
