import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { X, Send, Gavel } from "lucide-react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onBidSubmitted: () => void;
}

const BidModal = ({ isOpen, onClose, projectId, onBidSubmitted }: BidModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // YOUR DETAILS
  const [fullName, setFullName]               = useState(user?.name || "");
  const [email, setEmail]                     = useState(user?.email || "");
  const [skills, setSkills]                   = useState<string[]>([]);
  const [skillInput, setSkillInput]           = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [bio, setBio]                         = useState("");
  const [portfolioUrl, setPortfolioUrl]       = useState("");
  const [linkedinUrl, setLinkedinUrl]         = useState("");

  // BID DETAILS
  const [amount, setAmount]           = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [availability, setAvailability] = useState("");
  const [coverLetter, setCoverLetter]   = useState("");

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) {
      setSkills((prev) => [...prev, t]);
      setSkillInput("");
      setErrors((e) => ({ ...e, skills: "" }));
    }
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!fullName.trim())                              errs.fullName          = "Full name is required";
    if (!email.trim())                                 errs.email             = "Email is required";
    if (skills.length === 0)                           errs.skills            = "Add at least one skill";
    if (!experienceLevel)                              errs.experienceLevel   = "Select your experience level";
    if (!yearsOfExperience || Number(yearsOfExperience) < 0)
                                                       errs.yearsOfExperience = "Enter valid years of experience";
    if (!amount || Number(amount) < 1)                 errs.amount            = "Enter a valid bid amount (min ₹1)";
    if (!deliveryDays || Number(deliveryDays) < 1)     errs.deliveryDays      = "Enter delivery days (min 1)";
    if (!availability)                                 errs.availability      = "Select your availability";
    if (coverLetter.trim().length < 50)                errs.coverLetter       = `Cover letter needs ${50 - coverLetter.trim().length} more characters`;
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
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

      toast({
        title: "Bid submitted!",
        description: "Your bid is pending admin approval before the client can review it.",
      });
      onBidSubmitted();
      handleClose();
    } catch (err) {
      toast({
        title: "Failed to submit bid",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setFullName(user?.name || ""); setEmail(user?.email || "");
    setSkills([]); setSkillInput(""); setExperienceLevel(""); setYearsOfExperience("");
    setBio(""); setPortfolioUrl(""); setLinkedinUrl("");
    setAmount(""); setDeliveryDays(""); setCoverLetter(""); setAvailability("");
    onClose();
  };

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Bid on Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* ── YOUR DETAILS ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <span className="inline-block w-1 h-4 rounded-full bg-primary shrink-0" />
              <p className="text-sm font-semibold text-foreground">Your Details</p>
              <span className="text-xs text-muted-foreground">(confirm before bidding)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                />
                <Err field="fullName" />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                />
                <Err field="email" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Skills <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. React, Python…"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSkill}>Add</Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {skills.map((sk) => (
                    <Badge key={sk} variant="secondary" className="gap-1 pr-1">
                      {sk}
                      <button type="button" onClick={() => setSkills((p) => p.filter((s) => s !== sk))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Err field="skills" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Experience Level <span className="text-destructive">*</span></Label>
                <Select value={experienceLevel} onValueChange={(v) => { setExperienceLevel(v); setErrors((p) => ({ ...p, experienceLevel: "" })); }}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {["Junior", "Mid-Level", "Senior", "Expert"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Err field="experienceLevel" />
              </div>
              <div className="space-y-1.5">
                <Label>Years of Experience <span className="text-destructive">*</span></Label>
                <Input
                  type="number" min={0} max={50} placeholder="e.g. 3"
                  value={yearsOfExperience}
                  onChange={(e) => { setYearsOfExperience(e.target.value); setErrors((p) => ({ ...p, yearsOfExperience: "" })); }}
                />
                <Err field="yearsOfExperience" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Short Bio <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                placeholder="Briefly describe yourself…"
                rows={2}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Portfolio URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input type="url" placeholder="https://yourportfolio.com" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>LinkedIn URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input type="url" placeholder="https://linkedin.com/in/…" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── BID DETAILS ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <span className="inline-block w-1 h-4 rounded-full bg-primary shrink-0" />
              <p className="text-sm font-semibold text-foreground">Bid Details</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Bid Amount (₹) <span className="text-destructive">*</span></Label>
                <Input
                  type="number" min={1} placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })); }}
                />
                <Err field="amount" />
              </div>
              <div className="space-y-1.5">
                <Label>Delivery (days) <span className="text-destructive">*</span></Label>
                <Input
                  type="number" min={1} placeholder="e.g. 30"
                  value={deliveryDays}
                  onChange={(e) => { setDeliveryDays(e.target.value); setErrors((p) => ({ ...p, deliveryDays: "" })); }}
                />
                <Err field="deliveryDays" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Availability <span className="text-destructive">*</span></Label>
              <Select value={availability} onValueChange={(v) => { setAvailability(v); setErrors((p) => ({ ...p, availability: "" })); }}>
                <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>
                <SelectContent>
                  {["Full-Time", "Part-Time", "Weekends Only"].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Err field="availability" />
            </div>

            <div className="space-y-1.5">
              <Label>Cover Letter <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Describe why you're the best fit for this project… (min 50 characters)"
                rows={5}
                maxLength={1000}
                value={coverLetter}
                onChange={(e) => { setCoverLetter(e.target.value); setErrors((p) => ({ ...p, coverLetter: "" })); }}
              />
              <p className={`text-xs text-right ${coverLetter.trim().length < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                {coverLetter.trim().length}/1000 {coverLetter.trim().length < 50 && `(${50 - coverLetter.trim().length} more needed)`}
              </p>
              <Err field="coverLetter" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t border-border">
            <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit Bid"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
