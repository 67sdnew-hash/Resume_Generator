"use client";

import React, { useState, useEffect } from "react";
import ProfileForm from "@/components/ProfileForm";
import ResultsPreview from "@/components/ResultsPreview";
import { emptyProfile, type Profile, type GenerateResponse } from "@/lib/types";
import { generateResume } from "@/lib/api";
import { 
  Sparkles, Layers, Search, Bell, Sun, Moon, 
  ChevronRight, User, Briefcase, GraduationCap, 
  Award, FileText, Clipboard, Trash2, Upload, 
  Info, Menu, X, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle 
} from "lucide-react";

type Stage = "form" | "job-description" | "loading" | "results" | "error";

const SIDEBAR_STEPS = [
  { label: "Profile", icon: <User className="w-4 h-4" /> },
  { label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
  { label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
  { label: "Skills", icon: <Award className="w-4 h-4" /> },
  { label: "Job Description", icon: <FileText className="w-4 h-4" /> },
  { label: "Generate & Optimize", icon: <Sparkles className="w-4 h-4" /> },
];

export default function HomePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [jobDescription, setJobDescription] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0); // 0-3: ProfileForm steps, 4: Job Description, 5: Generate & Optimize
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [started, setStarted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // Responsive drawer states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"resume" | "letter" | "ats">("resume");

  // Loading animation message checklist
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Sync theme state with DOM class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  // Paste from clipboard helper
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJobDescription(text);
    } catch (_) {
      alert("Failed to read clipboard content. Please paste manually.");
    }
  };

  // Mock PDF parsing for Job Description
  const mockImportPdf = () => {
    const samples = [
      `Frontend Developer (React / TypeScript)\n\nQualifications:\n- 3+ years experience with React, Next.js, and TypeScript.\n- Experience with Tailwind CSS and responsive design.\n- Ability to work with REST/GraphQL APIs.\n- Strong communication and teamwork skills.`,
      `Full Stack Engineer\n\nRequirements:\n- Proficient in Python, Django/FastAPI and React.\n- Hands-on experience with AWS, PostgreSQL, and Docker.\n- Experience working in an Agile/Scrum environment.\n- Passion for building robust and scalable microservices.`
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setJobDescription(picked);
  };

  // Handles AI Loading State Checkmarks
  useEffect(() => {
    if (stage !== "loading") {
      setLoadingStep(0);
      setLoadingProgress(0);
      return;
    }

    const intervalMsg = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 4));
    }, 2200);

    const intervalProgress = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= 100) return 100;
        return p + 1;
      });
    }, 110);

    return () => {
      clearInterval(intervalMsg);
      clearInterval(intervalProgress);
    };
  }, [stage]);

  const handleGenerate = async () => {
    setStep(5);
    setStage("loading");
    setErrorMsg("");
    try {
      const response = await generateResume({
        profile,
        jobDescription,
        profileId: result?.profileId,
      });
      // Pause slightly at 100% for smooth transition
      setTimeout(() => {
        setResult(response);
        setStage("results");
      }, 800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  };

  // Start workspace
  const handleStart = () => {
    setStarted(true);
    setStep(0);
    setStage("form");
  };

  const handleStepClick = (idx: number) => {
    setStep(idx);
    setSidebarOpen(false);
    if (idx <= 3) {
      setStage("form");
    } else if (idx === 4) {
      setStage("job-description");
    } else if (idx === 5) {
      if (result) {
        setStage("results");
      } else {
        setStage("job-description"); // Redirect to JD if no result generated yet
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-text overflow-hidden transition-colors duration-300">
      
      {/* BACKGROUND DECORATIONS (Abstract blobs and grid overlay) */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-[0.9]" />
      <div className="absolute inset-0 bg-noise-texture pointer-events-none z-0" />
      
      {/* Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-float-1 z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-secondary/8 rounded-full blur-[140px] pointer-events-none animate-float-2 z-0" />
      <div className="absolute top-[40%] left-[60%] w-[40%] h-[40%] bg-accent/8 rounded-full blur-[110px] pointer-events-none animate-float-3 z-0" />

      {/* TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/60 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto max-w-[1600px] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {started && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-border bg-surface/50 text-muted hover:text-text transition"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div 
              onClick={() => { setStarted(false); setStep(0); }} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent p-[2px] shadow-md group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
                ResumeAI
              </span>
            </div>
          </div>

          {/* Search bar, toggle theme, notifications, avatar */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface/40 hover:bg-surface/70 w-64 text-muted text-xs cursor-text transition-all duration-200">
              <Search className="w-3.5 h-3.5" />
              <span>Search documentation...</span>
              <span className="ml-auto bg-border/60 px-1.5 py-0.5 rounded font-mono text-[10px]">⌘K</span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border bg-surface/40 hover:bg-border text-muted hover:text-text transition-all duration-200"
              title="Toggle Light/Dark Theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button className="p-2.5 rounded-xl border border-border bg-surface/40 hover:bg-border text-muted hover:text-text transition-all duration-200 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            </button>

            <div className="h-8 border-r border-border/80" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] shadow-sm">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-muted" />
                </div>
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-text">Dev Local</span>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO / LANDING PAGE */}
      {!started && (
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 py-20 md:py-32 flex flex-col items-center text-center animate-fade-in">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by Gemini 2.5 Pro
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-text leading-[1.08] max-w-4xl">
            Build <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">ATS-Optimized</span> Resumes with AI
          </h1>
          
          <p className="mt-6 text-base sm:text-xl text-muted max-w-2xl leading-relaxed">
            Create professional resumes and tailored cover letters matched to any job description in seconds. Stop guessing what recruiters want.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-white font-semibold text-base shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
            >
              Generate Resume
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-7 py-4 rounded-2xl border border-border bg-surface/50 text-text font-semibold text-base hover:bg-border/40 transition-all duration-200"
            >
              View Templates
            </button>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE LAYOUT */}
      {started && (
        <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* LEFT: Step navigation (Drawer on Mobile, Sidebar on Desktop) */}
            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Navigation container */}
            <aside className={`
              fixed lg:sticky top-24 left-0 h-[calc(100vh-120px)] lg:h-auto z-50 lg:z-10
              w-72 lg:w-auto p-6 lg:p-0 bg-surface lg:bg-transparent border-r lg:border-0 border-border
              transition-transform duration-300 lg:transform-none lg:block
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
              <div className="flex lg:hidden items-center justify-between mb-6 pb-4 border-b border-border">
                <span className="font-bold text-sm text-muted uppercase tracking-wider">Navigation</span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-muted hover:bg-border"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {SIDEBAR_STEPS.map((s, idx) => {
                  const isActive = step === idx;
                  const isCompleted = step > idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleStepClick(idx)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200
                        ${isActive 
                          ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary text-text shadow-sm" 
                          : isCompleted 
                            ? "text-primary hover:bg-border/30" 
                            : "text-muted hover:bg-border/20"
                        }
                      `}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? "bg-primary/20 text-primary" : "bg-border text-muted"}`}>
                        {s.icon}
                      </div>
                      <span className="flex-1 text-left">{idx + 1}. {s.label}</span>
                      {isCompleted && <span className="text-[10px] font-bold text-primary uppercase">Done</span>}
                      {isActive && <span className="w-1.5 h-1.5 bg-secondary rounded-full" />}
                    </button>
                  );
                })}
              </div>

              {/* Quick progress indicator */}
              <div className="mt-8 p-4 rounded-2xl bg-surface/40 border border-border/80 text-xs text-muted">
                <div className="flex justify-between font-semibold text-[10px] uppercase tracking-wider text-text">
                  <span>Profile Progress</span>
                  <span>{Math.round(((step + 1) / SIDEBAR_STEPS.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${((step + 1) / SIDEBAR_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </aside>

            {/* CENTER: Form Inputs or Loading Screen or Results Preview */}
            <main className={`
              lg:col-span-2 space-y-6
              ${stage === "results" ? "lg:col-span-3" : ""}
            `}>
              
              {/* Stages router */}
              {stage === "form" && (
                <ProfileForm
                  profile={profile}
                  onChange={setProfile}
                  onSubmit={() => { setStep(4); setStage("job-description"); }}
                  step={step}
                  setStep={setStep}
                  totalSteps={SIDEBAR_STEPS.length}
                />
              )}

              {stage === "job-description" && (
                <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-xl border border-cardBorder animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-text flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Target Job Description
                      </h3>
                      <p className="text-xs text-muted mt-1">
                        Paste the full job posting to let the AI optimize your resume bullets.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={pasteFromClipboard}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border text-muted hover:text-text transition"
                        title="Paste text from your clipboard"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        Paste
                      </button>
                      <button
                        onClick={mockImportPdf}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border text-muted hover:text-text transition"
                        title="Load a sample job description"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Sample JD
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={14}
                      placeholder="Paste the full job title, requirements, and responsibilities here..."
                      className="w-full bg-surface/40 dark:bg-background/40 px-4 py-3 text-sm text-text rounded-2xl border border-border/80 focus:border-primary focus:bg-surface/80 dark:focus:bg-background/80 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200 resize-none font-sans"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className={`font-mono font-semibold ${jobDescription.trim().length < 50 ? "text-error" : "text-success"}`}>
                      {jobDescription.length} characters {jobDescription.trim().length < 50 ? "(minimum 50 required)" : "(looks good!)"}
                    </span>
                    <button 
                      onClick={() => setJobDescription("")}
                      className="text-muted hover:text-error transition font-semibold"
                    >
                      Clear Editor
                    </button>
                  </div>

                  {/* Navigation footer */}
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => { setStep(3); setStage("form"); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-text hover:bg-border/30 transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Skills
                    </button>

                    <button
                      onClick={handleGenerate}
                      disabled={jobDescription.trim().length < 50}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-40 disabled:hover:shadow-none transition-all duration-200 group"
                    >
                      Generate Tailored Resume &amp; Letter
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {stage === "loading" && (
                <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-xl border border-cardBorder flex flex-col items-center justify-center text-center animate-fade-in min-h-[450px]">
                  
                  {/* Glowing Particles */}
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="absolute inset-2 bg-gradient-to-tr from-primary via-secondary to-accent rounded-full animate-spin p-1">
                      <div className="w-full h-full bg-surface rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-text">Optimizing with Gemini AI</h3>
                  <p className="text-sm text-muted mt-2 max-w-sm">
                    Our AI model is building your professional, tailored profile. This will take just a moment.
                  </p>

                  {/* Progressive Loading Messages */}
                  <div className="mt-8 w-full max-w-sm bg-surface/50 dark:bg-background/50 rounded-2xl border border-border p-5 text-left space-y-3.5">
                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      {loadingStep >= 0 ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <div className="w-4 h-4 rounded-full border-2 border-border" />}
                      <span className={loadingStep >= 0 ? "text-text" : "text-muted"}>Understanding job description requirements</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      {loadingStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <div className="w-4 h-4 rounded-full border-2 border-border" />}
                      <span className={loadingStep >= 1 ? "text-text" : "text-muted"}>Aligning matching professional skills</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      {loadingStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <div className="w-4 h-4 rounded-full border-2 border-border" />}
                      <span className={loadingStep >= 2 ? "text-text" : "text-muted"}>Optimizing experience bullet points</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      {loadingStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <div className="w-4 h-4 rounded-full border-2 border-border" />}
                      <span className={loadingStep >= 3 ? "text-text" : "text-muted"}>Drafting cover letter and checking ATS match</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-sm mt-8">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted mb-1">
                      <span>Analyzing profile</span>
                      <span>{loadingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {stage === "error" && (
                <div className="glass-panel rounded-3xl p-8 border border-error/20 bg-error/5 text-center flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Generation failed</h3>
                  <p className="text-sm text-muted mt-2 max-w-md">{errorMsg}</p>
                  <button
                    onClick={() => { setStep(4); setStage("job-description"); }}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 active:scale-[0.98] transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {stage === "results" && result && (
                <ResultsPreview
                  profile={profile}
                  output={result.data}
                  generationId={result.generationId}
                  cannedFallback={result.cannedFallback}
                  jobDescription={jobDescription}
                  onBackToJob={() => { setStep(4); setStage("job-description"); }}
                  onBackToProfile={() => { setStep(0); setStage("form"); }}
                />
              )}
            </main>

            {/* RIGHT: Live Preview (Only shown when not displaying full dashboard results) */}
            {stage !== "results" && (
              <aside className="lg:col-span-1 sticky top-24 space-y-4">
                
                {/* Desktop Tabs Header */}
                <div className="flex border-b border-border/80">
                  <button
                    onClick={() => setActivePreviewTab("resume")}
                    className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                      activePreviewTab === "resume" ? "border-b-2 border-primary text-primary" : "text-muted hover:text-text"
                    }`}
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => setActivePreviewTab("letter")}
                    className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                      activePreviewTab === "letter" ? "border-b-2 border-secondary text-secondary" : "text-muted hover:text-text"
                    }`}
                  >
                    Letter
                  </button>
                  <button
                    onClick={() => setActivePreviewTab("ats")}
                    className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                      activePreviewTab === "ats" ? "border-b-2 border-accent text-accent" : "text-muted hover:text-text"
                    }`}
                  >
                    ATS Preview
                  </button>
                </div>

                {/* Tab Content Cards */}
                <div className="glass-panel rounded-3xl p-5 shadow-lg border border-cardBorder max-h-[600px] overflow-y-auto text-left font-serif text-[10px] leading-relaxed text-text">
                  
                  {activePreviewTab === "resume" && (
                    <div className="space-y-4 font-sans">
                      <div className="text-center border-b border-border pb-3">
                        <span className="text-sm font-extrabold block">{profile.contact.fullName || "Your Full Name"}</span>
                        <div className="text-[9px] text-muted mt-1 space-x-1">
                          <span>{profile.contact.email || "email@example.com"}</span>
                          <span>•</span>
                          <span>{profile.contact.phone || "(555) 000-0000"}</span>
                        </div>
                      </div>

                      {profile.summary && (
                        <div>
                          <span className="text-[9px] font-bold text-primary uppercase block border-b border-border/50 pb-0.5">Summary</span>
                          <p className="text-[9px] text-muted mt-1">{profile.summary}</p>
                        </div>
                      )}

                      {profile.experience.length > 0 && (
                        <div>
                          <span className="text-[9px] font-bold text-primary uppercase block border-b border-border/50 pb-0.5">Experience</span>
                          <div className="mt-1 space-y-2">
                            {profile.experience.map((exp, i) => (
                              <div key={i}>
                                <div className="flex justify-between font-semibold">
                                  <span>{exp.title || "Job Title"}</span>
                                  <span className="text-muted text-[8px]">{exp.startDate} - {exp.endDate || "Present"}</span>
                                </div>
                                <div className="text-muted italic">{exp.company || "Company"}</div>
                                <ul className="list-disc pl-3 text-[8px] text-muted space-y-0.5 mt-0.5">
                                  {exp.bullets.map((b, idx) => b && <li key={idx}>{b}</li>)}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile.education.length > 0 && (
                        <div>
                          <span className="text-[9px] font-bold text-primary uppercase block border-b border-border/50 pb-0.5">Education</span>
                          <div className="mt-1 space-y-1">
                            {profile.education.map((edu, i) => (
                              <div key={i} className="flex justify-between">
                                <span>{edu.degree || "Degree"} at {edu.institution || "Institution"}</span>
                                <span className="text-muted text-[8px]">{edu.startDate} - {edu.endDate}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(profile.skills.technical.length > 0 || profile.skills.soft.length > 0) && (
                        <div>
                          <span className="text-[9px] font-bold text-primary uppercase block border-b border-border/50 pb-0.5">Skills</span>
                          <div className="mt-1 text-[8px] text-muted">
                            {profile.skills.technical.length > 0 && <div><strong>Tech:</strong> {profile.skills.technical.join(", ")}</div>}
                            {profile.skills.soft.length > 0 && <div className="mt-0.5"><strong>Soft:</strong> {profile.skills.soft.join(", ")}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activePreviewTab === "letter" && (
                    <div className="text-center py-10 font-sans">
                      <Layers className="w-8 h-8 text-muted/50 mx-auto mb-2" />
                      <span className="font-bold text-xs block text-text">No Cover Letter Yet</span>
                      <p className="text-[10px] text-muted mt-1 max-w-[180px] mx-auto leading-relaxed">
                        Your optimized cover letter will be generated by AI in step 6.
                      </p>
                    </div>
                  )}

                  {activePreviewTab === "ats" && (
                    <div className="space-y-4 font-sans text-center py-6">
                      <Info className="w-8 h-8 text-primary mx-auto mb-1" />
                      <span className="font-bold text-xs block text-text">Real-Time ATS Estimator</span>
                      
                      {jobDescription ? (
                        <div className="text-left space-y-3 bg-surface/50 p-3 rounded-xl border border-border">
                          <span className="text-[9px] font-bold text-muted uppercase">Analysis Status:</span>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-text">Keywords Detected:</span>
                            <span className="font-bold text-primary">Active</span>
                          </div>
                          <p className="text-[8px] text-muted leading-relaxed">
                            We will compile and score your final matches once AI optimization starts in step 6.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted max-w-[180px] mx-auto leading-relaxed">
                          Paste a job description in step 5 to estimate keyword matches and ATS ratings.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
