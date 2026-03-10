import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  X, Send, Gavel, User, IndianRupee, Loader2,
  ChevronRight, ChevronLeft, CheckCircle2, FileText,
} from "lucide-react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onBidSubmitted: () => void;
}

const STEPS = [
  { id: 1, title: "Your Profile",  desc: "Who are you?",       icon: User         },
  { id: 2, title: "Bid Details",   desc: "Name your price",    icon: IndianRupee  },
  { id: 3, title: "Cover Letter",  desc: "Make your pitch",    icon: FileText     },
] as const;

const BidModal = ({ isOpen, onClose, projectId, onBidSubmitted }: BidModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep]         = useState(1);
  const [dir, setDir]           = useState<"fwd" | "bwd">("fwd");
  const [animKey, setAnimKey]   = useState(0);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  /* ── Step 1 ── */
  const [fullName, setFullName]                   = useState(user?.name || "");
  const [email, setEmail]                         = useState(user?.email || "");
  const [skills, setSkills]                       = useState<string[]>([]);
  const [skillInput, setSkillInput]               = useState("");
  const [experienceLevel, setExperienceLevel]     = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [bio, setBio]                             = useState("");

  /* ── Step 2 ── */
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl]   = useState("");
  const [amount, setAmount]             = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [availability, setAvailability] = useState("");

  /* ── Step 3 ── */
  const [coverLetter, setCoverLetter] = useState("");

  /* ── helpers ── */
  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) {
      setSkills((p) => [...p, t]);
      setSkillInput("");
      setErrors((e) => ({ ...e, skills: "" }));
    }
  };

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!fullName.trim())                             e.fullName          = "Required";
      if (!email.trim())                                e.email             = "Required";
      if (skills.length === 0)                          e.skills            = "Add at least one skill";
      if (!experienceLevel)                             e.experienceLevel   = "Required";
      if (!yearsOfExperience || Number(yearsOfExperience) < 0)
                                                        e.yearsOfExperience = "Required";
    }
    if (s === 2) {
      if (!amount || Number(amount) < 1)                e.amount       = "Min ₹1";
      if (!deliveryDays || Number(deliveryDays) < 1)    e.deliveryDays = "Min 1 day";
      if (!availability)                                e.availability = "Required";
    }
    if (s === 3) {
      if (coverLetter.trim().length < 50)               e.coverLetter  = `${50 - coverLetter.trim().length} more characters needed`;
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
  };

  const goBack = () => {
    setErrors({});
    setDir("bwd");
    setAnimKey((k) => k + 1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(3);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.patch("/users/me/profile", {
        skills, experienceLevel,
        yearsOfExperience: Number(yearsOfExperience),
        bio, portfolioUrl, linkedinUrl, availability,
      });
      await api.post(`/projects/${projectId}/bids`, {
        amount: Number(amount),
        deliveryDays: Number(deliveryDays),
        coverLetter: coverLetter.trim(),
        skills, experienceLevel,
        yearsOfExperience: Number(yearsOfExperience),
        bio, portfolioUrl, linkedinUrl, availability,
      });
      setSubmitted(true);
      setTimeout(() => { onBidSubmitted(); handleClose(); }, 2000);
    } catch (err) {
      toast({
        title: "Failed to submit proposal",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setStep(1); setDir("fwd"); setAnimKey(0); setSubmitted(false);
    setFullName(user?.name || ""); setEmail(user?.email || "");
    setSkills([]); setSkillInput(""); setExperienceLevel(""); setYearsOfExperience("");
    setBio(""); setPortfolioUrl(""); setLinkedinUrl("");
    setAmount(""); setDeliveryDays(""); setCoverLetter(""); setAvailability("");
    onClose();
  };

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  const coverLen = coverLetter.trim().length;
  const coverPct = Math.min(100, (coverLen / 50) * 100);
  const animClass = dir === "fwd" ? "step-enter-fwd" : "step-enter-bwd";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-2xl">

        {/* ══ SUCCESS STATE ══ */}
        {submitted && (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="success-bounce h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Proposal Sent!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your proposal is pending admin review. The client will be notified once approved.
            </p>
          </div>
        )}

        {!submitted && (
          <>
            {/* ══ STICKY HEADER ══ */}
            <div className="bg-card border-b border-border px-6 pt-5 pb-4">
              {/* Title row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Gavel className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-foreground leading-tight">Submit a Proposal</p>
                  <p className="text-xs text-muted-foreground">
                    Step {step} of {STEPS.length} — {STEPS[step - 1].title}
                  </p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-3">
                {STEPS.map((s, idx) => {
                  const Icon  = s.icon;
                  const done  = step > s.id;
                  const active = step === s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-2 flex-1">
                      <div className={`relative h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        done    ? "bg-green-500 shadow-md shadow-green-500/40 text-white"
                               : active ? "bg-primary shadow-md shadow-primary/40 text-white ring-4 ring-primary/20"
                               : "bg-secondary text-muted-foreground"
                      }`}>
                        {done
                          ? <CheckCircle2 className="h-4 w-4" />
                          : <Icon className="h-3.5 w-3.5" />
                        }
                      </div>
                      <div className="hidden sm:block flex-shrink-0">
                        <p className={`text-[11px] font-bold leading-tight transition-colors ${
                          active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"
                        }`}>{s.title}</p>
                        <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 mx-1 h-0.5 rounded-full bg-border overflow-hidden">
                          <div className={`h-full bg-green-500 rounded-full transition-all duration-500 ${done ? "w-full" : "w-0"}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overall progress bar */}
              <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* ══ STEP CONTENT ══ */}
            <div className="px-6 py-5 overflow-y-auto max-h-[52vh] min-h-[300px]">
              <div key={animKey} className={animClass}>

                {/* ── STEP 1: Profile ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="mb-1">
                      <p className="font-heading text-sm font-bold text-foreground">Profile Information</p>
                      <p className="text-xs text-muted-foreground">Your identity and expertise</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                          className={errors.fullName ? "border-destructive" : ""}
                        />
                        <Err field="fullName" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Email <span className="text-destructive">*</span></Label>
                        <Input
                          type="email" placeholder="your@email.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        <Err field="email" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Skills <span className="text-destructive">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Type a skill, press Enter…"
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                          className={`flex-1 ${errors.skills ? "border-destructive" : ""}`}
                        />
                        <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={addSkill}>Add</Button>
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skills.map((sk, i) => (
                            <span
                              key={sk}
                              className="card-enter inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                              style={{ animationDelay: `${i * 0.04}s` }}
                            >
                              {sk}
                              <button
                                type="button"
                                onClick={() => setSkills((p) => p.filter((s) => s !== sk))}
                                className="hover:text-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <Err field="skills" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Experience Level <span className="text-destructive">*</span></Label>
                        <Select value={experienceLevel} onValueChange={(v) => { setExperienceLevel(v); setErrors((p) => ({ ...p, experienceLevel: "" })); }}>
                          <SelectTrigger className={errors.experienceLevel ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Junior", "Mid-Level", "Senior", "Expert"].map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Err field="experienceLevel" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Years Experience <span className="text-destructive">*</span></Label>
                        <Input
                          type="number" min={0} max={50} placeholder="e.g. 3"
                          value={yearsOfExperience}
                          onChange={(e) => { setYearsOfExperience(e.target.value); setErrors((p) => ({ ...p, yearsOfExperience: "" })); }}
                          className={errors.yearsOfExperience ? "border-destructive" : ""}
                        />
                        <Err field="yearsOfExperience" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Short Bio <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Textarea
                        placeholder="Briefly describe your background…"
                        rows={2} maxLength={500}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Bid Details ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="mb-1">
                      <p className="font-heading text-sm font-bold text-foreground">Bid Details</p>
                      <p className="text-xs text-muted-foreground">Set your price, timeline, and links</p>
                    </div>

                    {/* Bid amount box */}
                    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Bid Amount <span className="text-destructive">*</span></Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm select-none">₹</span>
                            <Input
                              type="number" min={1} placeholder="50000"
                              value={amount}
                              onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })); }}
                              className={`pl-7 font-bold text-primary ${errors.amount ? "border-destructive" : "border-primary/25"}`}
                            />
                          </div>
                          <Err field="amount" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Delivery Days <span className="text-destructive">*</span></Label>
                          <Input
                            type="number" min={1} placeholder="30"
                            value={deliveryDays}
                            onChange={(e) => { setDeliveryDays(e.target.value); setErrors((p) => ({ ...p, deliveryDays: "" })); }}
                            className={`${errors.deliveryDays ? "border-destructive" : "border-primary/25"}`}
                          />
                          <Err field="deliveryDays" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Availability <span className="text-destructive">*</span></Label>
                          <Select value={availability} onValueChange={(v) => { setAvailability(v); setErrors((p) => ({ ...p, availability: "" })); }}>
                            <SelectTrigger className={`${errors.availability ? "border-destructive" : "border-primary/25"}`}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Full-Time", "Part-Time", "Weekends Only"].map((a) => (
                                <SelectItem key={a} value={a}>{a}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Err field="availability" />
                        </div>
                      </div>

                      {/* Live bid preview */}
                      {amount && deliveryDays && (
                        <div className="card-enter flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5">
                          <IndianRupee className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-extrabold text-primary text-base leading-none">
                            ₹{Number(amount).toLocaleString("en-IN")}
                          </span>
                          <span className="text-muted-foreground text-xs">·</span>
                          <span className="text-sm font-semibold text-foreground">{deliveryDays} days</span>
                          {availability && (
                            <>
                              <span className="text-muted-foreground text-xs">·</span>
                              <span className="text-xs text-muted-foreground">{availability}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Optional links */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Portfolio URL <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input type="url" placeholder="https://yourportfolio.com" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          LinkedIn URL <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input type="url" placeholder="https://linkedin.com/in/…" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Cover Letter ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="mb-1">
                      <p className="font-heading text-sm font-bold text-foreground">Cover Letter</p>
                      <p className="text-xs text-muted-foreground">Be specific — explain your approach and why you're the best fit</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">Your Message <span className="text-destructive">*</span></Label>
                        <span className={`text-xs tabular-nums font-medium ${coverLen < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                          {coverLen} / 1000
                        </span>
                      </div>
                      <Textarea
                        placeholder="Why are you the best fit? Mention your relevant experience, your approach to the project, tools you'd use, and why you're excited about this work… (minimum 50 characters)"
                        rows={7} maxLength={1000}
                        value={coverLetter}
                        onChange={(e) => { setCoverLetter(e.target.value); setErrors((p) => ({ ...p, coverLetter: "" })); }}
                        className={`resize-none ${errors.coverLetter ? "border-destructive" : ""}`}
                      />
                      {/* Min-chars progress bar */}
                      {coverLen < 50 && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${coverPct}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">{50 - coverLen} more characters to meet minimum</p>
                        </div>
                      )}
                      <Err field="coverLetter" />
                    </div>

                    {/* Proposal summary card — only when all data filled */}
                    {amount && deliveryDays && skills.length > 0 && (
                      <div className="card-enter rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 p-4">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Proposal Summary</p>
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          <div className="rounded-xl bg-card border border-border py-2.5 px-1">
                            <p className="font-heading text-lg font-extrabold text-primary leading-none">
                              ₹{Number(amount).toLocaleString("en-IN")}
                            </p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1">Bid</p>
                          </div>
                          <div className="rounded-xl bg-card border border-border py-2.5 px-1">
                            <p className="font-heading text-lg font-extrabold text-foreground leading-none">{deliveryDays}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1">Days</p>
                          </div>
                          <div className="rounded-xl bg-card border border-border py-2.5 px-1">
                            <p className="font-heading text-sm font-extrabold text-foreground leading-none">{experienceLevel || "—"}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1">Level</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skills.slice(0, 5).map((sk) => (
                            <span key={sk} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {sk}
                            </span>
                          ))}
                          {skills.length > 5 && (
                            <span className="text-[10px] text-muted-foreground self-center">+{skills.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* ══ STICKY FOOTER ══ */}
            <div className="border-t border-border bg-muted/20 px-6 py-4 flex items-center justify-between gap-3">
              {/* Back / Cancel */}
              <Button
                variant="ghost"
                onClick={step === 1 ? handleClose : goBack}
                disabled={submitting}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                {step === 1 ? "Cancel" : <><ChevronLeft className="h-4 w-4" /> Back</>}
              </Button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`rounded-full transition-all duration-300 ${
                      step === s.id ? "h-2 w-6 bg-primary"
                                    : step > s.id ? "h-2 w-2 bg-green-500"
                                    : "h-2 w-2 bg-border"
                    }`}
                  />
                ))}
              </div>

              {/* Next / Submit */}
              {step < 3 ? (
                <Button onClick={goNext} className="gap-1.5 min-w-[100px]">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-2 min-w-[150px] cta-pulse"
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                    : <><Send className="h-4 w-4" /> Submit Proposal</>
                  }
                </Button>
              )}
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
