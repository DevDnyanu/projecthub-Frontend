import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const openings = [
  { title: "Full Stack Engineer",         team: "Engineering",  location: "Pune / Remote", type: "Full-time" },
  { title: "Product Designer (UI/UX)",    team: "Design",       location: "Pune / Remote", type: "Full-time" },
  { title: "Growth Marketing Manager",    team: "Marketing",    location: "Remote",        type: "Full-time" },
  { title: "Community Manager",           team: "Operations",   location: "Pune",          type: "Full-time" },
  { title: "Customer Support Specialist", team: "Support",      location: "Remote",        type: "Part-time" },
];

const perks = [
  "Flexible remote-first culture",
  "Competitive salary & equity",
  "Health insurance (self + family)",
  "₹50,000/year learning budget",
  "Home office stipend",
  "Quarterly team offsites",
];

const Careers = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 space-y-14">
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          Careers
        </span>
        <h1 className="font-heading text-4xl font-bold text-foreground">Join the Team</h1>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          We're building India's most trusted freelance marketplace. If you're passionate about
          empowering professionals and love moving fast, we'd love to meet you.
        </p>
      </div>

      {/* Perks */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Why ProjectHub?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5 text-sm text-foreground">
              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
              {perk}
            </div>
          ))}
        </div>
      </div>

      {/* Open roles */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Open Roles</h2>
        <div className="space-y-3">
          {openings.map((role) => (
            <div
              key={role.title}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{role.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">{role.team}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{role.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{role.type}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => navigate("/contact")}>
                Apply <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* No role fit */}
      <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center space-y-3">
        <p className="font-semibold text-foreground">Don't see your role?</p>
        <p className="text-sm text-muted-foreground">We're always looking for exceptional people. Send us your resume and tell us how you'd contribute.</p>
        <Button variant="outline" onClick={() => navigate("/contact")}>Send Open Application</Button>
      </div>
    </div>
  );
};

export default Careers;
