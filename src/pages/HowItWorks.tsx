import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, FileText, Gavel, CheckCircle, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const clientSteps = [
  { icon: FileText,     title: "Post Your Project",    desc: "Describe what you need, set your budget, and submit. Projects go live after a quick admin review (usually 2–4 hours)." },
  { icon: Gavel,        title: "Review Bids",          desc: "Freelancers submit detailed proposals. Each bid is admin-vetted before you see it, so you only review quality applicants." },
  { icon: CheckCircle,  title: "Hire & Collaborate",   desc: "Accept the best bid, work with your freelancer, and mark the project complete when delivered to your satisfaction." },
  { icon: Star,         title: "Rate & Review",        desc: "Leave a rating for your freelancer. Honest reviews help build a trusted community for everyone." },
];

const freelancerSteps = [
  { icon: Search,       title: "Browse Open Projects", desc: "Explore hundreds of live projects filtered by category, skills, and budget. Find work that matches your expertise." },
  { icon: FileText,     title: "Submit a Bid",         desc: "Write a compelling cover letter, set your rate and timeline. Admin reviews all bids to maintain quality standards." },
  { icon: CheckCircle,  title: "Get Hired & Deliver",  desc: "Once the client accepts your bid, start working. Use the built-in dashboard to track progress and communicate." },
  { icon: Star,         title: "Build Your Reputation", desc: "Earn ratings and reviews. A strong track record means better visibility and higher-paying projects." },
];

const StepCard = ({ step, icon: Icon, title, desc }: { step: number; icon: React.ElementType; title: string; desc: string }) => (
  <div className="relative flex items-start gap-4">
    <div className="flex flex-col items-center shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
        {step}
      </div>
      {step < 4 && <div className="mt-2 w-0.5 flex-1 h-12 bg-border" />}
    </div>
    <div className="rounded-xl border border-border bg-card p-5 flex-1 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          How It Works
        </span>
        <h1 className="font-heading text-4xl font-bold text-foreground">Simple. Transparent. Effective.</h1>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          ProjectHub removes the friction from freelancing. Here's how we make it work for both clients and freelancers.
        </p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* For clients */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground">For Clients</h2>
          </div>
          {clientSteps.map((s, i) => (
            <StepCard key={s.title} step={i + 1} {...s} />
          ))}
          <Button className="gap-2 mt-2" onClick={() => navigate(isLoggedIn ? "/post-project" : "/login")}>
            Post a Project <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* For freelancers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <h2 className="font-heading text-xl font-bold text-foreground">For Freelancers</h2>
          </div>
          {freelancerSteps.map((s, i) => (
            <StepCard key={s.title} step={i + 1} {...s} />
          ))}
          <Button variant="outline" className="gap-2 mt-2" onClick={() => navigate(isLoggedIn ? "/" : "/login")}>
            Browse Projects <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-foreground">Ready to get started?</h2>
        <p className="text-muted-foreground">Join thousands of professionals already using ProjectHub.</p>
        <Button size="lg" className="gap-2" onClick={() => navigate(isLoggedIn ? "/" : "/login")}>
          {isLoggedIn ? "Browse Projects" : "Create Free Account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default HowItWorks;
