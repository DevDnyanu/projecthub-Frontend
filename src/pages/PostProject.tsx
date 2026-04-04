import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X, Rocket, Paperclip, FileText, IndianRupee,
  User, CheckCircle2, ChevronRight, ChevronLeft,
  MapPin, Zap, CalendarDays, Loader2, Clock, Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/project";

/* ── Constants ── */
const FALLBACK_CATEGORIES = [
  { id: "web-dev",           name: "Web Development",         icon: "Globe",      count: 0 },
  { id: "mobile",            name: "Mobile Apps",              icon: "Smartphone", count: 0 },
  { id: "design",            name: "UI/UX & Design",           icon: "Palette",    count: 0 },
  { id: "writing",           name: "Content & Writing",        icon: "FileText",   count: 0 },
  { id: "marketing",         name: "Social Media & Marketing", icon: "TrendingUp", count: 0 },
  { id: "data",              name: "Data Science & AI",        icon: "BarChart3",  count: 0 },
  { id: "prog-tech",         name: "Programming & Tech",       icon: "Code2",      count: 0 },
  { id: "digital-marketing", name: "SEO & Performance",        icon: "Megaphone",  count: 0 },
  { id: "video",             name: "Video & Animation",        icon: "Video",      count: 0 },
  { id: "finance",           name: "Finance & Accounting",     icon: "DollarSign", count: 0 },
];

const SUBCATEGORIES: Record<string, string[]> = {
  "web-dev":           ["React / Next.js", "Vue / Nuxt.js", "Angular", "WordPress / CMS", "Full Stack", "Backend API", "E-Commerce", "Shopify", "Laravel / PHP", "Django / Python"],
  "mobile":            ["iOS / Swift", "Android / Kotlin", "React Native", "Flutter", "Progressive Web App", "Cross-Platform"],
  "design":            ["UI / UX Design", "Logo & Branding", "Graphic Design", "Illustration", "Motion Graphics", "3D Design", "Figma / Prototyping", "Print & Packaging"],
  "writing":           ["Blog & Articles", "Copywriting", "Technical Writing", "SEO Content", "Social Media Copy", "Email Copy", "Ghostwriting", "Product Descriptions"],
  "marketing":         ["Social Media Marketing", "Email Marketing", "Content Marketing", "Influencer Marketing", "Brand Strategy", "Community Management"],
  "data":              ["Data Analysis", "Machine Learning", "AI / NLP", "Data Visualisation", "Business Intelligence", "Web Scraping", "Database Design", "Prompt Engineering"],
  "prog-tech":         ["Python", "Node.js", "Java", "C++ / .NET", "DevOps / Cloud", "Blockchain / Web3", "Game Development", "Cybersecurity", "QA & Testing", "Embedded / IoT"],
  "digital-marketing": ["SEO", "Google Ads / PPC", "Performance Marketing", "Affiliate Marketing", "App Store Optimisation", "Analytics & Reporting"],
  "video":             ["Video Editing", "Explainer Videos", "Motion Graphics / Animation", "YouTube Production", "Reels & Short-form", "Podcast Editing", "Subtitles & Captions", "3D Animation"],
  "finance":           ["Bookkeeping", "Financial Modelling", "Tax Consulting", "CFO Services", "Fundraising / Pitch Deck", "Accounting & Audit", "Crypto / DeFi Finance"],
};

const STEPS = [
  { id: 1, title: "Project Basics",   desc: "Title, description & category",    icon: FileText     },
  { id: 2, title: "Skills & Budget",  desc: "Skills, budget & timeline",         icon: IndianRupee  },
  { id: 3, title: "About You",        desc: "Background, location & files",      icon: User         },
  { id: 4, title: "Review & Submit",  desc: "Final check before going live",     icon: Rocket       },
] as const;

/* ── helpers ── */
const SkillChip = ({
  label, onRemove, delay = 0,
}: { label: string; onRemove: () => void; delay?: number }) => (
  <span
    className="card-enter inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
    style={{ animationDelay: `${delay}s` }}
  >
    {label}
    <button type="button" onClick={onRemove} className="hover:text-destructive transition-colors">
      <X className="h-3 w-3" />
    </button>
  </span>
);

/* ══════════════════════════════════════════════════════════ */
const PostProject = () => {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { user }   = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── wizard state ── */
  const [step, setStep]       = useState(1);
  const [dir, setDir]         = useState<"fwd" | "bwd">("fwd");
  const [animKey, setAnimKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  /* ── form fields ── */
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [category, setCategory]         = useState("");
  const [subcategory, setSubcategory]   = useState("");

  const [skills, setSkills]             = useState<string[]>([]);
  const [skillInput, setSkillInput]     = useState("");
  const [projectType, setProjectType]   = useState("Fixed Price");
  const [budgetMin, setBudgetMin]       = useState("");
  const [budgetMax, setBudgetMax]       = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [deadline, setDeadline]         = useState("");

  const [posterSkills, setPosterSkills]         = useState<string[]>([]);
  const [posterSkillInput, setPosterSkillInput] = useState("");
  const [companyName, setCompanyName]           = useState("");
  const [location, setLocation]                 = useState("");
  const [remoteFriendly, setRemoteFriendly]     = useState(true);
  const [urgencyLevel, setUrgencyLevel]         = useState("Normal");
  const [attachments, setAttachments]           = useState<File[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Category[]>("/categories")
      .then((d) => setCategories(d.length > 0 ? d : FALLBACK_CATEGORIES))
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  /* ── helpers ── */
  const addSkill = (
    list: string[], setList: (v: string[]) => void,
    val: string,   setVal: (v: string) => void,
    errKey?: string,
  ) => {
    const t = val.trim();
    if (t && !list.includes(t)) {
      setList([...list, t]);
      setVal("");
      if (errKey) setErrors((p) => ({ ...p, [errKey]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files    = Array.from(e.target.files || []);
    const valid    = files.filter((f) => f.size <= 10 * 1024 * 1024);
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length) toast({ title: "File too large", description: "Max 10MB each.", variant: "destructive" });
    setAttachments([...attachments, ...valid].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── per-step validation ── */
  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (title.trim().length < 10)        e.title       = "Title must be at least 10 characters";
      if (description.trim().length < 100) e.description = "Description must be at least 100 characters";
      if (!category)                       e.category    = "Select a category";
      if (!subcategory)                    e.subcategory = "Select a subcategory";
    }
    if (s === 2) {
      if (skills.length === 0)                              e.skills      = "Add at least one skill";
      if (!budgetMin || Number(budgetMin) < 100)            e.budgetMin   = "Minimum budget is ₹100";
      if (!budgetMax || Number(budgetMax) < Number(budgetMin)) e.budgetMax = "Max must be ≥ min budget";
      if (!deliveryDays || Number(deliveryDays) < 1)        e.deliveryDays = "Enter delivery days (min 1)";
      if (!deadline)                                        e.deadline    = "Select a deadline";
    }
    if (s === 3) {
      if (!location.trim()) e.location = "Enter your city / location";
    }
    return e;
  };

  const goNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setDir("fwd");
    setAnimKey((k) => k + 1);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setDir("bwd");
    setAnimKey((k) => k + 1);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    /* run all validations */
    const all = { ...validateStep(1), ...validateStep(2), ...validateStep(3) };
    if (Object.keys(all).length) {
      setErrors(all);
      toast({ title: "Please fix all errors before submitting", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title",          title.trim());
      fd.append("description",    description.trim());
      fd.append("category",       category);
      fd.append("subcategory",    subcategory);
      fd.append("budgetMin",      budgetMin);
      fd.append("budgetMax",      budgetMax);
      fd.append("deliveryDays",   deliveryDays);
      fd.append("deadline",       deadline);
      fd.append("projectType",    projectType);
      fd.append("companyName",    companyName.trim());
      fd.append("location",       location.trim());
      fd.append("remoteFriendly", String(remoteFriendly));
      fd.append("urgencyLevel",   urgencyLevel);
      skills.forEach((s) => fd.append("skills", s));
      posterSkills.forEach((s) => fd.append("posterSkills", s));
      attachments.forEach((f) => fd.append("attachments", f));

      await api.postForm<unknown>("/projects", fd);
      setSubmitted(true);
      setTimeout(() => navigate("/my-projects"), 2200);
    } catch (err) {
      toast({
        title: "Failed to post project",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  const animClass = dir === "fwd" ? "step-enter-fwd" : "step-enter-bwd";
  const descLen   = description.trim().length;
  const progress  = ((step - 1) / (STEPS.length - 1)) * 100;

  /* ── SUCCESS STATE ── */
  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="success-bounce mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-green-500/30">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Project Submitted!</h2>
        <p className="text-muted-foreground">
          Your project is pending admin approval. You'll be notified once it goes live.
        </p>
        <p className="text-xs text-muted-foreground mt-3">Redirecting to My Projects…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* ── Hero header ── */}
      <div className="relative mb-8 overflow-hidden rounded-2xl hero-gradient shadow-lg shadow-primary/20"
        style={{ background: "linear-gradient(135deg, hsl(220,80%,50%), hsl(240,80%,60%), hsl(200,80%,50%))", backgroundSize: "200% 200%" }}>
        {/* Floating circles */}
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 opacity-15">
          {[40, 28, 18, 12].map((s, i) => (
            <div key={i} className="rounded-full bg-white" style={{ width: s, height: s }} />
          ))}
        </div>
        <div className="relative z-10 flex items-center gap-4 px-8 py-6">
          <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white leading-tight">Post a Project</h1>
            <p className="text-white/70 text-sm mt-0.5">Get proposals from top experts within hours</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-6 text-white/80 text-sm">
            <div className="text-center">
              <p className="font-bold text-white text-lg leading-none">Step {step}</p>
              <p className="text-[11px] mt-0.5">of {STEPS.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">

        {/* ═══════════════════════════════════════
            LEFT: Sticky step sidebar (desktop)
        ════════════════════════════════════════ */}
        <div className="hidden lg:block lg:sticky lg:top-24">

          {/* Step list */}
          <div className="rounded-2xl border border-border bg-card p-5 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Progress</p>
            <div className="space-y-0">
              {STEPS.map((s, idx) => {
                const Icon   = s.icon;
                const done   = step > s.id;
                const active = step === s.id;
                return (
                  <div key={s.id} className="relative">
                    <div className="flex items-start gap-3 pb-5">
                      {/* Circle indicator */}
                      <div className="relative shrink-0 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          done    ? "bg-green-500 shadow-md shadow-green-500/40"
                                 : active ? "bg-primary shadow-md shadow-primary/40 ring-4 ring-primary/20"
                                 : "bg-secondary border border-border"
                        }`}>
                          {done
                            ? <CheckCircle2 className="h-4 w-4 text-white" />
                            : <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-muted-foreground"}`} />
                          }
                        </div>
                        {/* Connector line */}
                        {idx < STEPS.length - 1 && (
                          <div className="mt-1 w-0.5 flex-1 rounded-full bg-border overflow-hidden" style={{ height: 28 }}>
                            <div className={`w-full rounded-full bg-green-500 transition-all duration-500 ${done ? "h-full" : "h-0"}`} />
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <div className="pt-1 min-w-0">
                        <p className={`text-sm font-bold leading-tight transition-colors ${
                          active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"
                        }`}>
                          {s.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live preview card */}
          {(title || category) && (
            <div className="card-enter rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Live Preview</p>
              {title && (
                <p className="font-bold text-foreground text-sm leading-snug mb-2 line-clamp-2">{title}</p>
              )}
              {category && (
                <span className="inline-block rounded-full bg-primary/15 border border-primary/25 px-2.5 py-0.5 text-[10px] font-semibold text-primary mb-2">
                  {categories.find((c) => c.id === category)?.name || category}
                  {subcategory && <> · {subcategory}</>}
                </span>
              )}
              {budgetMin && budgetMax && (
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-sm text-primary font-bold">₹</span>
                  <span className="font-extrabold text-primary text-base">{Number(budgetMin).toLocaleString("en-IN")}</span>
                  <span className="text-muted-foreground mx-1 text-xs">–</span>
                  <span className="font-extrabold text-primary text-base">{Number(budgetMax).toLocaleString("en-IN")}</span>
                </div>
              )}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {skills.slice(0, 3).map((sk) => (
                    <span key={sk} className="rounded-md bg-secondary border border-border px-1.5 py-0.5 text-[10px] text-foreground/70">{sk}</span>
                  ))}
                  {skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{skills.length - 3}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            RIGHT: Form card
        ════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">

          {/* Progress bar */}
          <div className="h-1 bg-border">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Mobile step indicator */}
          <div className="flex items-center gap-2 px-6 pt-4 pb-0 lg:hidden">
            {STEPS.map((s) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  done ? "bg-green-500" : active ? "bg-primary" : "bg-border"
                }`} />
              );
            })}
          </div>

          {/* Step content */}
          <div key={animKey} className={`px-6 py-6 ${animClass}`}>

            {/* Step header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className={`h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {step}
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-foreground">{STEPS[step - 1].title}</p>
                  <p className="text-xs text-muted-foreground">{STEPS[step - 1].desc}</p>
                </div>
              </div>
            </div>

            {/* ── STEP 1: Project Basics ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Project Title <span className="text-destructive">*</span>
                    <span className="text-muted-foreground font-normal ml-1">(min 10 characters)</span>
                  </Label>
                  <Input
                    placeholder="e.g. Build a React e-commerce dashboard with Stripe payments"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                    className={`h-11 ${errors.title ? "border-destructive" : ""}`}
                  />
                  <Err field="title" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Description <span className="text-destructive">*</span>
                      <span className="text-muted-foreground font-normal ml-1">(min 100 characters)</span>
                    </Label>
                    <span className={`text-xs tabular-nums font-medium ${descLen < 100 ? "text-destructive" : "text-muted-foreground"}`}>
                      {descLen} / 100
                    </span>
                  </div>
                  <Textarea
                    placeholder="Describe your project in detail: goals, deliverables, technical requirements, timeline expectations…"
                    rows={6}
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                    className={`resize-none ${errors.description ? "border-destructive" : ""}`}
                  />
                  {descLen < 100 && (
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (descLen / 100) * 100)}%` }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{100 - descLen} more characters needed</p>
                    </div>
                  )}
                  <Err field="description" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category <span className="text-destructive">*</span></Label>
                    <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(""); setErrors((p) => ({ ...p, category: "", subcategory: "" })); }}>
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Err field="category" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Subcategory <span className="text-destructive">*</span></Label>
                    <Select
                      value={subcategory}
                      onValueChange={(v) => { setSubcategory(v); setErrors((p) => ({ ...p, subcategory: "" })); }}
                      disabled={!category}
                    >
                      <SelectTrigger className={errors.subcategory ? "border-destructive" : ""}>
                        <SelectValue placeholder={category ? "Select subcategory" : "Pick category first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(SUBCATEGORIES[category] || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Err field="subcategory" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Skills & Budget ── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Skills */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Required Skills <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Type a skill and press Enter…"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skills, setSkills, skillInput, setSkillInput, "skills"))}
                      className={`flex-1 ${errors.skills ? "border-destructive" : ""}`}
                    />
                    <Button type="button" variant="secondary" size="sm" className="shrink-0 px-4"
                      onClick={() => addSkill(skills, setSkills, skillInput, setSkillInput, "skills")}>
                      Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((s, i) => (
                        <SkillChip key={s} label={s} delay={i * 0.04} onRemove={() => setSkills(skills.filter((x) => x !== s))} />
                      ))}
                    </div>
                  )}
                  <Err field="skills" />
                </div>

                {/* Project type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Project Type</Label>
                  <div className="flex gap-3">
                    {["Fixed Price", "Hourly"].map((t) => (
                      <button
                        key={t} type="button"
                        onClick={() => setProjectType(t)}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200 ${
                          projectType === t
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/30 scale-[1.02]"
                            : "bg-card border-border text-foreground/70 hover:border-primary/30"
                        }`}
                      >
                        {t === "Fixed Price" ? "🔒 Fixed Price" : "⏱ Hourly"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="rounded-2xl border-2 border-dashed border-primary/25 bg-primary/4 p-4 space-y-3">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide">Budget Range (₹)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Min Budget <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm select-none">₹</span>
                        <Input type="number" min={100} placeholder="50000"
                          value={budgetMin}
                          onChange={(e) => { setBudgetMin(e.target.value); setErrors((p) => ({ ...p, budgetMin: "" })); }}
                          className={`pl-7 font-bold text-primary ${errors.budgetMin ? "border-destructive" : "border-primary/25"}`}
                        />
                      </div>
                      <Err field="budgetMin" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Max Budget <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm select-none">₹</span>
                        <Input type="number" min={100} placeholder="200000"
                          value={budgetMax}
                          onChange={(e) => { setBudgetMax(e.target.value); setErrors((p) => ({ ...p, budgetMax: "" })); }}
                          className={`pl-7 font-bold text-primary ${errors.budgetMax ? "border-destructive" : "border-primary/25"}`}
                        />
                      </div>
                      <Err field="budgetMax" />
                    </div>
                  </div>
                  {budgetMin && budgetMax && Number(budgetMax) >= Number(budgetMin) && (
                    <div className="card-enter flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
                      <IndianRupee className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-extrabold text-primary">
                        ₹{Number(budgetMin).toLocaleString("en-IN")} – ₹{Number(budgetMax).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delivery + Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Delivery Days <span className="text-destructive">*</span></Label>
                    <Input type="number" min={1} placeholder="e.g. 30"
                      value={deliveryDays}
                      onChange={(e) => { setDeliveryDays(e.target.value); setErrors((p) => ({ ...p, deliveryDays: "" })); }}
                      className={errors.deliveryDays ? "border-destructive" : ""}
                    />
                    <Err field="deliveryDays" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Deadline <span className="text-destructive">*</span></Label>
                    <Input type="date"
                      value={deadline}
                      onChange={(e) => { setDeadline(e.target.value); setErrors((p) => ({ ...p, deadline: "" })); }}
                      className={errors.deadline ? "border-destructive" : ""}
                    />
                    <Err field="deadline" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: About You ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Company / Organisation <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input placeholder="e.g. Acme Corp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Your Skills / Expertise <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={posterSkillInput}
                      onChange={(e) => setPosterSkillInput(e.target.value)}
                      placeholder="e.g. Product Management…"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(posterSkills, setPosterSkills, posterSkillInput, setPosterSkillInput))}
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" size="sm" className="shrink-0 px-4"
                      onClick={() => addSkill(posterSkills, setPosterSkills, posterSkillInput, setPosterSkillInput)}>
                      Add
                    </Button>
                  </div>
                  {posterSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {posterSkills.map((s, i) => (
                        <SkillChip key={s} label={s} delay={i * 0.04} onRemove={() => setPosterSkills(posterSkills.filter((x) => x !== s))} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Urgency selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Urgency Level</Label>
                  <div className="flex gap-3">
                    {[
                      { val: "Normal",   label: "Normal",   color: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400",   active: "bg-slate-600 text-white border-slate-600"   },
                      { val: "Urgent",   label: "⚡ Urgent",  color: "bg-orange-500/10 border-orange-500/30 text-orange-600", active: "bg-orange-500 text-white border-orange-500" },
                      { val: "Critical", label: "🔥 Critical",color: "bg-red-500/10 border-red-500/30 text-red-600",         active: "bg-red-600 text-white border-red-600"        },
                    ].map((u) => (
                      <button key={u.val} type="button" onClick={() => setUrgencyLevel(u.val)}
                        className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all duration-200 ${
                          urgencyLevel === u.val ? u.active + " shadow-md scale-[1.03]" : u.color + " hover:-translate-y-0.5"
                        }`}>
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Location (City) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Mumbai, Pune, Bangalore…"
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: "" })); }}
                      className={`pl-9 ${errors.location ? "border-destructive" : ""}`}
                    />
                  </div>
                  <Err field="location" />
                </div>

                {/* Remote toggle */}
                <div className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all cursor-pointer ${
                  remoteFriendly ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                }`} onClick={() => setRemoteFriendly((p) => !p)}>
                  <Checkbox
                    id="remote"
                    checked={remoteFriendly}
                    onCheckedChange={(v) => setRemoteFriendly(Boolean(v))}
                    className="pointer-events-none"
                  />
                  <div>
                    <Label htmlFor="remote" className={`cursor-pointer font-semibold text-sm ${remoteFriendly ? "text-primary" : "text-foreground"}`}>
                      Remote Friendly
                    </Label>
                    <p className="text-xs text-muted-foreground">Experts from anywhere can apply</p>
                  </div>
                  {remoteFriendly && (
                    <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">ON</span>
                  )}
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Attachments <span className="text-muted-foreground font-normal">(optional, max 5 files, 10MB each)</span>
                  </Label>
                  <div
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-6 cursor-pointer hover:border-primary/40 hover:bg-primary/3 transition-all duration-200 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Paperclip className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Click to attach images or PDFs
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">{attachments.length}/5 files added</p>
                  </div>
                  <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                  {attachments.length > 0 && (
                    <div className="space-y-1.5">
                      {attachments.map((f, i) => (
                        <div key={i} className="card-enter flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate text-foreground text-xs">{f.name}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {(f.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                          <button type="button" onClick={() => setAttachments(attachments.filter((_, j) => j !== i))} className="ml-2 hover:text-destructive transition-colors shrink-0">
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Submit ── */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Review your project before it goes for admin approval.
                </p>

                {/* Project summary card */}
                <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/6 to-primary/2 p-5 space-y-4">
                  {/* Title */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Title</p>
                    <p className="font-heading font-bold text-foreground text-base leading-snug">{title}</p>
                  </div>

                  {/* Category + subcategory */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/12 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {categories.find((c) => c.id === category)?.name || category}
                    </span>
                    {subcategory && (
                      <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-xs font-medium text-foreground/70">
                        {subcategory}
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{description}</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-card border border-border p-3 text-center">
                      <IndianRupee className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="font-extrabold text-primary text-sm leading-none">
                        ₹{Number(budgetMin).toLocaleString("en-IN")}–{Number(budgetMax).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1">Budget</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border p-3 text-center">
                      <Clock className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                      <p className="font-extrabold text-foreground text-sm leading-none">{deliveryDays} days</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1">Delivery</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border p-3 text-center">
                      <CalendarDays className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                      <p className="font-extrabold text-foreground text-xs leading-none">{deadline}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1">Deadline</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border p-3 text-center">
                      <Zap className={`h-4 w-4 mx-auto mb-1 ${urgencyLevel === "Critical" ? "text-red-500" : urgencyLevel === "Urgent" ? "text-orange-500" : "text-slate-400"}`} />
                      <p className="font-extrabold text-foreground text-sm leading-none">{urgencyLevel}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1">Urgency</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((s) => (
                          <span key={s} className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location + remote */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {location}
                    </span>
                    {remoteFriendly && (
                      <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-green-600">
                        Remote OK
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" /> {projectType}
                    </span>
                    {companyName && (
                      <span className="text-muted-foreground text-xs">{companyName}</span>
                    )}
                  </div>

                  {attachments.length > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      {attachments.length} attachment{attachments.length > 1 ? "s" : ""} attached
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                  Your project will be reviewed by admin before going live. This usually takes a few hours.
                </div>
              </div>
            )}

          </div>

          {/* ── Footer navigation ── */}
          <div className="border-t border-border bg-muted/20 px-6 py-4 flex items-center justify-between gap-3">
            <Button
              type="button" variant="ghost"
              onClick={step === 1 ? () => navigate(-1) : goBack}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              {step === 1 ? "Cancel" : <><ChevronLeft className="h-4 w-4" /> Back</>}
            </Button>

            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id} className={`rounded-full transition-all duration-300 ${
                  step === s.id ? "h-2 w-6 bg-primary"
                                : step > s.id ? "h-2 w-2 bg-green-500"
                                : "h-2 w-2 bg-border"
                }`} />
              ))}
            </div>

            {step < 4 ? (
              <Button type="button" onClick={goNext} className="gap-1.5 min-w-[100px]">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2 min-w-[180px] cta-pulse"
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                  : <><Rocket className="h-4 w-4" /> Submit for Review</>
                }
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PostProject;
