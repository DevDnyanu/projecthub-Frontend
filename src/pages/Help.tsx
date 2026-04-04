import { useState } from "react";
import { ChevronDown, Search, Briefcase, CreditCard, Shield, Gavel, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const FAQS: { category: string; icon: React.ElementType; items: { q: string; a: string }[] }[] = [
  {
    category: "Getting Started",
    icon: User,
    items: [
      { q: "How do I create an account?",          a: "Click 'Sign In' in the top navbar and choose 'Create account'. Fill in your name, email and password. You'll receive a verification email to activate your account." },
      { q: "Is ProjectHub free to use?",           a: "Yes! Creating an account and browsing projects is completely free. We only charge a small service fee when a project is successfully completed." },
      { q: "Can I be both a client and expert?", a: "Absolutely. One account lets you post projects as a client and bid on projects as an expert. Your role is determined by what you're doing, not your account type." },
    ],
  },
  {
    category: "Posting Projects",
    icon: Briefcase,
    items: [
      { q: "How do I post a project?",           a: "Log in, click 'Post a Project' from the navbar or homepage. Fill in the 3-section form (Project Details, About You, Visibility) and submit. Projects go live after admin approval." },
      { q: "How long does approval take?",       a: "Projects are typically reviewed within 2–4 hours during business hours. You'll see the status in 'My Projects' dashboard." },
      { q: "Can I edit a project after posting?", a: "You can contact support to request edits to a pending project. Once live, minor edits may be available from your dashboard." },
    ],
  },
  {
    category: "Bidding & Hiring",
    icon: Gavel,
    items: [
      { q: "How do I place a bid?",              a: "Open any project and click 'Place a Bid'. Fill in your amount, delivery days, and a detailed cover letter (min 50 characters). Bids require admin approval before the client can see them." },
      { q: "Can I withdraw my bid?",             a: "Yes, you can withdraw a pending bid from your My Projects dashboard before it's accepted by the client." },
      { q: "How does bid acceptance work?",      a: "Once admin approves your bid, the project owner can accept or reject it. If accepted, the project moves to In Progress status and you can start working." },
    ],
  },
  {
    category: "Payments & Safety",
    icon: CreditCard,
    items: [
      { q: "How do payments work?",              a: "ProjectHub uses a milestone-based payment system. Clients fund milestones upfront, and funds are released to experts upon milestone completion." },
      { q: "Is my payment information safe?",    a: "Yes. All payment data is encrypted and processed through RBI-compliant payment gateways. We never store raw card data." },
      { q: "What if there's a dispute?",         a: "Contact our support team and we'll mediate. We have a clear dispute resolution process and always aim for a fair outcome for both parties." },
    ],
  },
  {
    category: "Trust & Safety",
    icon: Shield,
    items: [
      { q: "How are freelancers verified?",      a: "All users go through email verification. Premium verified badges are available after identity verification and portfolio review." },
      { q: "How do I report a user?",            a: "Click the 'Report' button on any user profile or project. Our trust & safety team reviews all reports within 24 hours." },
      { q: "What is the rating system?",         a: "After a project is completed, clients rate the expert (1–5 stars). Ratings are public and help build trust across the platform." },
    ],
  },
];

const Faq = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
};

const Help = () => {
  const [query, setQuery] = useState("");

  const filtered = FAQS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !query ||
        item.q.toLowerCase().includes(query.toLowerCase()) ||
        item.a.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          Help Center
        </span>
        <h1 className="font-heading text-4xl font-bold text-foreground">How can we help?</h1>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles…"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FAQ sections */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results for "{query}".</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try different keywords or{" "}
            <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
          </p>
        </div>
      ) : (
        filtered.map(({ category, icon: Icon, items }) => (
          <div key={category} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-4 bg-secondary/30">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">{category}</h2>
            </div>
            <div className="px-5">
              {items.map((item) => (
                <Faq key={item.q} {...item} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Still need help */}
      <div className="rounded-xl border border-border bg-primary/5 p-6 text-center space-y-3">
        <p className="font-semibold text-foreground">Still need help?</p>
        <p className="text-sm text-muted-foreground">Our support team is available Mon–Fri, 9am–6pm IST.</p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default Help;
