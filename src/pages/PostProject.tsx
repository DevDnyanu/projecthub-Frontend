import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Rocket, /*CheckCircle2, XCircle,*/ Paperclip, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/project";

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

const PostProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Section 1 ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [projectType, setProjectType] = useState("Fixed Price");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [deadline, setDeadline] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  // ── Section 2 ──
  const [posterSkills, setPosterSkills] = useState<string[]>([]);
  const [posterSkillInput, setPosterSkillInput] = useState("");
  const [companyName, setCompanyName] = useState("");

  // ── Section 3 ──
  const [location, setLocation] = useState("");
  const [remoteFriendly, setRemoteFriendly] = useState(true);
  const [urgencyLevel, setUrgencyLevel] = useState("Normal");

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    api.get<Category[]>("/categories")
      .then((data) => setCategories(data.length > 0 ? data : FALLBACK_CATEGORIES))
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  const addSkill = (list: string[], setList: (v: string[]) => void, val: string, setVal: (v: string) => void) => {
    const t = val.trim();
    if (t && !list.includes(t)) { setList([...list, t]); setVal(""); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) toast({ title: "File too large", description: "Max file size is 10MB each.", variant: "destructive" });
    const combined = [...attachments, ...valid].slice(0, 5);
    setAttachments(combined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // const handleResendVerification = async () => {
  //   if (!user?.email) return;
  //   setResendingEmail(true);
  //   try {
  //     await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/resend-verification`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email: user.email }),
  //     });
  //     toast({ title: "Verification email sent!", description: "Please check your inbox." });
  //   } catch {
  //     toast({ title: "Failed to send", variant: "destructive" });
  //   } finally {
  //     setResendingEmail(false);
  //   }
  // };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (title.trim().length < 10)   errs.title       = "Title must be at least 10 characters";
    if (description.trim().length < 100) errs.description = "Description must be at least 100 characters";
    if (!category)                  errs.category    = "Select a category";
    if (!subcategory)               errs.subcategory = "Select a subcategory";
    if (skills.length === 0)        errs.skills      = "Add at least one required skill";
    if (!budgetMin || Number(budgetMin) < 100) errs.budgetMin = "Minimum budget is ₹100";
    if (!budgetMax || Number(budgetMax) < Number(budgetMin)) errs.budgetMax = "Max budget must be ≥ min budget";
    if (!deliveryDays || Number(deliveryDays) < 1) errs.deliveryDays = "Enter delivery days (min 1)";
    if (!deadline)                  errs.deadline    = "Select a deadline";
    // if (!user?.isEmailVerified)     errs.email       = "Your email must be verified to post a project";
    if (!location.trim())           errs.location    = "Enter your city / location";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast({ title: "Please fix the errors below", variant: "destructive" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title",           title.trim());
      fd.append("description",     description.trim());
      fd.append("category",        category);
      fd.append("subcategory",     subcategory);
      fd.append("budgetMin",       budgetMin);
      fd.append("budgetMax",       budgetMax);
      fd.append("deliveryDays",    deliveryDays);
      fd.append("deadline",        deadline);
      fd.append("projectType",     projectType);
      fd.append("companyName",     companyName.trim());
      fd.append("location",        location.trim());
      fd.append("remoteFriendly",  String(remoteFriendly));
      fd.append("urgencyLevel",    urgencyLevel);
      skills.forEach((s) => fd.append("skills", s));
      posterSkills.forEach((s) => fd.append("posterSkills", s));
      attachments.forEach((f) => fd.append("attachments", f));

      await api.postForm<unknown>("/projects", fd);

      toast({
        title: "Project submitted for review!",
        description: "Your project is pending admin approval before going live.",
      });
      navigate("/my-projects");
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

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Rocket className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Post a Project</h1>
          <p className="text-muted-foreground">Fill all sections to submit your project for review.</p>
        </div>
      </div>

      {/* Summary error banner */}
      {hasErrors && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Please fix the following errors:</p>
            <ul className="mt-1 list-disc list-inside text-xs text-destructive space-y-0.5">
              {Object.values(errors).map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Project Details ── */}
        <Card className="p-6 space-y-5 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded-full bg-primary shrink-0" />
            Section 1 — Project Details
          </h2>

          <div className="space-y-2">
            <Label>Project Title <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. Build a React e-commerce dashboard (min 10 chars)"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
            />
            <ErrorMsg field="title" />
          </div>

          <div className="space-y-2">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Describe your project in detail… (min 100 characters)"
              rows={5}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
            />
            <p className={`text-xs text-right ${description.trim().length < 100 ? "text-destructive" : "text-muted-foreground"}`}>
              {description.trim().length} chars {description.trim().length < 100 && `(${100 - description.trim().length} more needed)`}
            </p>
            <ErrorMsg field="description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(""); setErrors((p) => ({ ...p, category: "", subcategory: "" })); }}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <ErrorMsg field="category" />
            </div>

            <div className="space-y-2">
              <Label>Subcategory <span className="text-destructive">*</span></Label>
              <Select value={subcategory} onValueChange={(v) => { setSubcategory(v); setErrors((p) => ({ ...p, subcategory: "" })); }} disabled={!category}>
                <SelectTrigger><SelectValue placeholder={category ? "Select subcategory" : "Pick category first"} /></SelectTrigger>
                <SelectContent>
                  {(SUBCATEGORIES[category] || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <ErrorMsg field="subcategory" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Skills <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill…"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skills, setSkills, skillInput, setSkillInput))}
              />
              <Button type="button" variant="secondary" onClick={() => addSkill(skills, setSkills, skillInput, setSkillInput)}>Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
            <ErrorMsg field="skills" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Type <span className="text-destructive">*</span></Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Urgency <span className="text-destructive">*</span></Label>
              <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Budget (₹) <span className="text-destructive">*</span></Label>
              <Input type="number" min={100} placeholder="e.g. 50000"
                value={budgetMin}
                onChange={(e) => { setBudgetMin(e.target.value); setErrors((p) => ({ ...p, budgetMin: "" })); }} />
              <ErrorMsg field="budgetMin" />
            </div>
            <div className="space-y-2">
              <Label>Max Budget (₹) <span className="text-destructive">*</span></Label>
              <Input type="number" min={100} placeholder="e.g. 200000"
                value={budgetMax}
                onChange={(e) => { setBudgetMax(e.target.value); setErrors((p) => ({ ...p, budgetMax: "" })); }} />
              <ErrorMsg field="budgetMax" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Days <span className="text-destructive">*</span></Label>
              <Input type="number" min={1} placeholder="e.g. 30"
                value={deliveryDays}
                onChange={(e) => { setDeliveryDays(e.target.value); setErrors((p) => ({ ...p, deliveryDays: "" })); }} />
              <ErrorMsg field="deliveryDays" />
            </div>
            <div className="space-y-2">
              <Label>Deadline <span className="text-destructive">*</span></Label>
              <Input type="date"
                value={deadline}
                onChange={(e) => { setDeadline(e.target.value); setErrors((p) => ({ ...p, deadline: "" })); }} />
              <ErrorMsg field="deadline" />
            </div>
          </div>

          {/* File attachments */}
          <div className="space-y-2">
            <Label>Attachments <span className="text-muted-foreground text-xs">(optional, max 5 files, 10MB each)</span></Label>
            <div
              className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border px-4 py-3 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to attach images or PDFs</span>
            </div>
            <input
              ref={fileInputRef} type="file" multiple className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="truncate text-foreground">{f.name}</span>
                    <button type="button" onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ── Section 2: Poster Verification ── */}
        <Card className="p-6 space-y-5 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded-full bg-primary shrink-0" />
            Section 2 — About You
          </h2>

          {/* Email status — disabled for now, re-enable when email service is configured */}
          {/* <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-2">Email Verification Status</p>
            {user?.isEmailVerified ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Verified — {user.email}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm">Not verified — {user?.email}</span>
                </div>
                <p className="text-xs text-destructive">Your email must be verified to post a project.</p>
                <Button size="sm" variant="outline" onClick={handleResendVerification} disabled={resendingEmail}>
                  {resendingEmail ? "Sending…" : "Verify Email"}
                </Button>
                <ErrorMsg field="email" />
              </div>
            )}
          </div> */}

          <div className="space-y-2">
            <Label>Your Skills / Expertise <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <div className="flex gap-2">
              <Input
                value={posterSkillInput}
                onChange={(e) => setPosterSkillInput(e.target.value)}
                placeholder="e.g. Product Management…"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(posterSkills, setPosterSkills, posterSkillInput, setPosterSkillInput))}
              />
              <Button type="button" variant="secondary" onClick={() => addSkill(posterSkills, setPosterSkills, posterSkillInput, setPosterSkillInput)}>Add</Button>
            </div>
            {posterSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {posterSkills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">
                    {s}
                    <button type="button" onClick={() => setPosterSkills(posterSkills.filter((x) => x !== s))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Company / Organisation Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        </Card>

        {/* ── Section 3: Visibility Settings ── */}
        <Card className="p-6 space-y-5 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded-full bg-primary shrink-0" />
            Section 3 — Project Visibility
          </h2>

          <div className="space-y-2">
            <Label>Location (City) <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. Mumbai, Pune, Bangalore…"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: "" })); }}
            />
            <p className="text-xs text-muted-foreground">Used for hyperlocal matching with freelancers.</p>
            <ErrorMsg field="location" />
          </div>

          <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
            <Checkbox
              id="remote"
              checked={remoteFriendly}
              onCheckedChange={(v) => setRemoteFriendly(Boolean(v))}
            />
            <div>
              <Label htmlFor="remote" className="cursor-pointer font-medium">Remote Friendly</Label>
              <p className="text-xs text-muted-foreground">Freelancers from anywhere can apply</p>
            </div>
          </div>
        </Card>

        <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
          <Rocket className="h-4 w-4" />
          {submitting ? "Submitting…" : "Submit Project for Review"}
        </Button>
        {/* {!user?.isEmailVerified && (
          <p className="text-center text-xs text-destructive">Verify your email first to post a project.</p>
        )} */}
      </form>
    </div>
  );
};

export default PostProject;
