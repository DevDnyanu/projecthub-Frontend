import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Target, Zap, Globe, Star, TrendingUp,
  Briefcase, Heart, Shield, ArrowRight, CheckCircle2,
  Lightbulb, Handshake, Rocket,
} from "lucide-react";

/* ─── Scroll-in hook ─────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated counter ───────────────────────────────── */
function useCounter(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

/* ─── Stat Card ──────────────────────────────────────── */
const StatCard = ({
  icon: Icon, value, numericValue, suffix, label, delay, active,
}: {
  icon: React.ElementType;
  value?: string;
  numericValue?: number;
  suffix?: string;
  label: string;
  delay: number;
  active: boolean;
}) => {
  const count = useCounter(numericValue ?? 0, 1600, active && !!numericValue);
  const display = numericValue ? `${count.toLocaleString()}${suffix ?? ""}` : value;

  return (
    <div
      className="card-glow group relative flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8"
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="font-heading text-3xl font-bold text-foreground tabular-nums">{display}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

/* ─── Value Card ─────────────────────────────────────── */
const ValueCard = ({
  icon: Icon, title, desc, color, delay, visible,
}: {
  icon: React.ElementType; title: string; desc: string;
  color: string; delay: number; visible: boolean;
}) => (
  <div
    className={`group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card
      transition-all duration-700 hover:-translate-y-1 hover:shadow-lg hover:border-primary/25
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    style={{ transitionDelay: `${delay}s` }}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="font-heading font-semibold text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ─── Timeline step ──────────────────────────────────── */
const TimelineStep = ({
  year, title, desc, align, delay, visible,
}: {
  year: string; title: string; desc: string;
  align: "left" | "right"; delay: number; visible: boolean;
}) => (
  <div className={`relative flex items-center gap-0 ${align === "right" ? "flex-row-reverse" : ""}`}>
    {/* Content */}
    <div
      className={`w-full md:w-[calc(50%-2rem)] p-5 rounded-2xl border border-border bg-card transition-all duration-700
        hover:-translate-y-0.5 hover:shadow-md hover:border-primary/25
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        ${align === "right" ? "md:ml-auto" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary mb-2 uppercase tracking-widest">
        {year}
      </span>
      <p className="font-heading font-semibold text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>

    {/* Center dot — hidden on mobile */}
    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-background bg-primary/15 items-center justify-center z-10">
      <div className="w-3 h-3 rounded-full bg-primary" />
    </div>
  </div>
);

/* ─── Team card ──────────────────────────────────────── */
const TeamCard = ({
  name, role, initials, color, delay, visible,
}: {
  name: string; role: string; initials: string;
  color: string; delay: number; visible: boolean;
}) => (
  <div
    className={`group flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card
      transition-all duration-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 hover:border-primary/25
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    style={{ transitionDelay: `${delay}s` }}
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
      {initials}
    </div>
    <p className="font-heading font-semibold text-foreground">{name}</p>
    <p className="text-xs text-muted-foreground mt-1">{role}</p>
    <div className="flex gap-2 mt-4">
      {[Star, CheckCircle2].map((Icon, i) => (
        <div key={i} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
          <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
const About = () => {
  const { ref: heroRef,     visible: heroVisible     } = useInView(0.05);
  const { ref: statsRef,    visible: statsVisible    } = useInView(0.2);
  const { ref: storyRef,    visible: storyVisible    } = useInView(0.08);
  const { ref: valuesRef,   visible: valuesVisible   } = useInView(0.1);
  const { ref: teamRef,     visible: teamVisible     } = useInView(0.1);
  const { ref: ctaRef,      visible: ctaVisible      } = useInView(0.1);

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ──────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden">

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-20 right-0 w-64 h-64 rounded-full bg-accent/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Pill */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8 mb-6
              transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Heart className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Our Story</span>
          </div>

          {/* Headline */}
          <h1
            className={`font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6
              transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Building India's Premier{" "}
            <span className="text-gradient">Freelance</span>
            <br className="hidden sm:block" />
            Marketplace
          </h1>

          {/* Subtitle */}
          <p
            className={`mx-auto max-w-2xl text-muted-foreground text-lg leading-relaxed mb-8
              transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            ProjectHub was founded in 2024 with one clear goal — make it simple for businesses
            to find great talent and for freelancers to find great work.
            No middlemen. No hassle. Just results.
          </p>

          {/* CTA buttons */}
          <div
            className={`flex flex-wrap justify-center gap-3
              transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
            >
              Explore Projects <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 border-y border-border bg-secondary/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users,      numericValue: 10000, suffix: "+",  label: "Active Freelancers" },
              { icon: Briefcase,  numericValue: 25000, suffix: "+",  label: "Projects Posted"    },
              { icon: Globe,      numericValue: 200,   suffix: "+",  label: "Cities Covered"     },
              { icon: TrendingUp, numericValue: 94,    suffix: "%",  label: "Success Rate"       },
            ].map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.08} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY TIMELINE ────────────────────────────── */}
      <section ref={storyRef} className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 transition-all duration-700 ${storyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-3 uppercase tracking-widest">
              Timeline
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              How We Got Here
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              From a small idea to India's fastest-growing freelance platform.
            </p>
          </div>

          {/* Timeline container */}
          <div className="relative space-y-6">
            {/* Vertical line — desktop only */}
            <div className="hidden md:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

            {[
              { year: "Jan 2024", align: "left"  as const, title: "The Idea",        desc: "Two engineers frustrated with expensive freelance platforms decided to build something better for India." },
              { year: "Apr 2024", align: "right" as const, title: "First Build",     desc: "MVP launched with core project posting and bidding features. 50 early users signed up in week one." },
              { year: "Jul 2024", align: "left"  as const, title: "Rapid Growth",    desc: "Crossed 1,000 registered users and 500 live projects. Payment and rating systems added." },
              { year: "Nov 2024", align: "right" as const, title: "Scale Up",        desc: "Admin dashboard, real-time notifications, and Cloudinary-powered media uploads rolled out." },
              { year: "2025",     align: "left"  as const, title: "What's Next",     desc: "Mobile app, AI-powered project matching, and expanding into tier-2 and tier-3 cities across India." },
            ].map((step, i) => (
              <TimelineStep key={step.year} {...step} delay={i * 0.1} visible={storyVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────── */}
      <section ref={valuesRef} className="py-20 bg-secondary/20 border-y border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 transition-all duration-700 ${valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3 uppercase tracking-widest">
              Our Values
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              What We Stand For
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              These principles guide every decision we make, every feature we ship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Target,    title: "Mission First",      desc: "We exist to create real economic opportunity for every skilled professional in India.",                   color: "bg-primary/10 text-primary"       },
              { icon: Zap,       title: "Move Fast",          desc: "We ship quickly and iterate on real feedback — not what we think users want.",                            color: "bg-yellow-500/10 text-yellow-600" },
              { icon: Shield,    title: "Trust & Safety",     desc: "Verified profiles, secure payments, and transparent reviews build a marketplace everyone can rely on.",   color: "bg-emerald-500/10 text-emerald-600" },
              { icon: Lightbulb, title: "Quality Always",     desc: "We hold both project briefs and bids to the highest standard so the right people find each other.",       color: "bg-accent/10 text-accent"         },
              { icon: Handshake, title: "Fair for Everyone",  desc: "Low fees and transparent pricing mean freelancers keep more of what they earn.",                          color: "bg-blue-500/10 text-blue-600"     },
              { icon: Globe,     title: "Think Global",       desc: "Built in Pune, designed to connect talent and opportunity across every corner of India and beyond.",      color: "bg-purple-500/10 text-purple-600" },
            ].map((v, i) => (
              <ValueCard key={v.title} {...v} delay={i * 0.07} visible={valuesVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────── */}
      <section ref={teamRef} className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 transition-all duration-700 ${teamVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-3 uppercase tracking-widest">
              The Team
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              People Behind ProjectHub
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              A small, passionate team obsessed with building the best freelance experience in India.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Arjun Sharma",    role: "Co-founder & CEO",     initials: "AS", color: "bg-primary/15 text-primary"         },
              { name: "Priya Mehta",     role: "Co-founder & CTO",     initials: "PM", color: "bg-accent/15 text-accent"           },
              { name: "Rohan Desai",     role: "Head of Product",      initials: "RD", color: "bg-emerald-500/15 text-emerald-600" },
              { name: "Sneha Kulkarni",  role: "Head of Growth",       initials: "SK", color: "bg-purple-500/15 text-purple-600"   },
            ].map((m, i) => (
              <TeamCard key={m.name} {...m} delay={i * 0.08} visible={teamVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────── */}
      <section ref={ctaRef} className="py-20 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-accent/5 p-10 sm:p-14 text-center
              transition-all duration-700 ${ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            {/* Glow blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />
            </div>

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-5">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground text-base max-w-md mx-auto mb-8 leading-relaxed">
                Join thousands of freelancers and businesses already growing with ProjectHub.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cta-pulse"
                >
                  <Users className="w-4 h-4" />
                  Join for Free
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-border bg-card/80 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  Talk to Us <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
