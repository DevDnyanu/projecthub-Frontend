import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Target, Zap, Globe, TrendingUp,
  Briefcase, Shield, ArrowRight, CheckCircle2,
  Lightbulb, Handshake, Rocket, Linkedin, MapPin,
  Sparkles, Award, Flame, Code2, BarChart3, Server, Telescope,
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
  icon: Icon, numericValue, suffix, label, delay, active, color,
}: {
  icon: React.ElementType;
  numericValue: number;
  suffix?: string;
  label: string;
  delay: number;
  active: boolean;
  color: { iconColor: string; glowColor: string; borderColor: string };
}) => {
  const count = useCounter(numericValue, 2000, active);
  return (
    <div
      className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md
        transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20"
      style={{ transitionDelay: `${delay}s`, boxShadow: `0 0 0 0 transparent` }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 60px -10px ${color.glowColor}`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white/10 border ${color.borderColor} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 ${color.iconColor}`} />
      </div>
      <p className="font-heading text-4xl font-extrabold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm font-medium text-slate-400 mt-1.5">{label}</p>
    </div>
  );
};

/* ─── Value Card ─────────────────────────────────────── */
const ValueCard = ({
  icon: Icon, title, desc, color, delay, visible,
}: {
  icon: React.ElementType; title: string; desc: string;
  color: { icon: string; bg: string; border: string; glow: string; label: string };
  delay: number; visible: boolean;
}) => (
  <div
    className={`group relative flex flex-col gap-4 p-6 rounded-2xl border ${color.border} bg-card overflow-hidden
      transition-all duration-700 hover:-translate-y-1.5 hover:shadow-xl ${color.glow}
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    style={{ transitionDelay: `${delay}s` }}
  >
    {/* Subtle bg glow on hover */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color.bg} rounded-2xl`} />

    <div className="relative flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color.bg} border ${color.border} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <Icon className={`w-5 h-5 ${color.icon}`} />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${color.border} ${color.bg} ${color.icon}`}>
        {color.label}
      </span>
    </div>
    <div className="relative">
      <p className="font-heading font-bold text-foreground mb-1.5">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ─── Timeline step ──────────────────────────────────── */
const TimelineStep = ({
  year, title, desc, align, delay, visible, color, icon: Icon, stat, statLabel, step,
}: {
  year: string; title: string; desc: string;
  align: "left" | "right"; delay: number; visible: boolean;
  color: { pill: string; dot: string; dotBg: string; border: string; glow: string; iconBg: string; iconText: string };
  icon: React.ElementType;
  stat?: string; statLabel?: string; step: number;
}) => (
  <div className={`relative flex items-center ${align === "right" ? "flex-row-reverse" : ""}`}>

    {/* Card */}
    <div
      className={`group w-full md:w-[calc(50%-2.5rem)] rounded-2xl border ${color.border} bg-card overflow-hidden
        transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl ${color.glow}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
        ${align === "right" ? "md:ml-auto" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {/* Card top color bar */}
      <div className={`h-1 w-full ${color.dot}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.iconBg} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-4 h-4 ${color.iconText}`} />
            </div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${color.pill}`}>
              {year}
            </span>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground/40 tabular-nums">0{step}</span>
        </div>

        <p className="font-heading font-bold text-foreground mb-1.5">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>

        {/* Metric chip */}
        {stat && (
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${color.iconBg} border ${color.border}`}>
            <TrendingUp className={`w-3 h-3 ${color.iconText}`} />
            <span className={color.iconText}>{stat}</span>
            <span className="text-muted-foreground">{statLabel}</span>
          </div>
        )}
      </div>
    </div>

    {/* Center dot with pulse — desktop only */}
    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 items-center justify-center">
      <span className={`absolute w-10 h-10 rounded-full ${color.dotBg} animate-ping opacity-20`} />
      <div className={`relative w-10 h-10 rounded-full border-4 border-background ${color.dot} flex items-center justify-center shadow-xl`}>
        <span className="text-[10px] font-extrabold text-white">0{step}</span>
      </div>
    </div>
  </div>
);

/* ─── Team card ──────────────────────────────────────── */
const TeamCard = ({
  name, role, initials, location, gradient, glowColor, tags, stats, delay, visible,
}: {
  name: string; role: string; initials: string; location: string;
  gradient: string; glowColor: string; tags: string[]; stats: { label: string; value: string }[];
  delay: number; visible: boolean;
}) => (
  <div
    className={`group flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md
      transition-all duration-700 hover:-translate-y-3 hover:border-white/20
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    style={{ transitionDelay: `${delay}s`, boxShadow: "0 0 0 0 transparent",
      transition: "transform 0.4s ease, box-shadow 0.4s ease, opacity 0.7s ease, translate 0.7s ease, border-color 0.4s ease" }}
    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 30px 60px -10px ${glowColor}`)}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")}
  >
    {/* ── Gradient header with initials ── */}
    <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
      {/* Floating blobs inside header */}
      <div className="aurora-3 absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/15 blur-xl" />
      <div className="aurora-1 absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-lg" />
      <div className="aurora-2 absolute top-2 right-8 w-12 h-12 rounded-full bg-white/20 blur-md" />

      {/* Large initials */}
      <span className="relative z-10 font-heading font-black text-5xl text-white/90 select-none"
        style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
        {initials}
      </span>

      {/* Verified badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-300">Verified</span>
      </div>
    </div>

    {/* ── Content ── */}
    <div className="flex flex-col flex-1 p-5">
      {/* Name + Role */}
      <div className="mb-3">
        <p className="font-heading font-bold text-white text-lg leading-tight">{name}</p>
        <p className="text-xs font-semibold text-sky-300 mt-0.5">{role}</p>
        <div className="flex items-center gap-1 mt-1.5 text-slate-500">
          <MapPin className="w-3 h-3" />
          <span className="text-[11px]">{location}</span>
        </div>
      </div>

      {/* Skill tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-white/8 border border-white/10 text-[10px] font-medium text-slate-300">
            {tag}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/8 mt-auto">
        {stats.map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="font-bold text-white text-sm">{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* LinkedIn */}
      <a href="#" className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10
        hover:bg-blue-500/15 hover:border-blue-400/30 transition-all duration-300 group/ln">
        <Linkedin className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] font-semibold text-slate-400 group-hover/ln:text-blue-300 transition-colors">View Profile</span>
      </a>
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

      {/* ══ HERO — Floating Cards Animation ════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0f]">

        {/* ── Floating Photo Cards ── */}
        <div className="pointer-events-none absolute inset-0">

          {/* Card 1 — left */}
          <div className="float-a absolute -left-6 top-[15%] w-52 h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ animationDelay: "0s" }}>
            <div className="w-full h-full bg-gradient-to-br from-sky-500/60 via-blue-600/50 to-indigo-700/60" />
          </div>

          {/* Card 2 — top center */}
          <div className="float-c absolute left-[35%] -top-10 w-48 h-60 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ animationDelay: "1s" }}>
            <div className="w-full h-full bg-gradient-to-br from-violet-500/60 via-purple-600/50 to-pink-600/60" />
          </div>

          {/* Card 3 — right */}
          <div className="float-b absolute -right-6 top-[18%] w-52 h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ animationDelay: "1.8s" }}>
            <div className="w-full h-full bg-gradient-to-br from-emerald-500/60 via-teal-600/50 to-cyan-600/60" />
          </div>

          {/* ── Decorative colored blocks — bigger sizes ── */}
          <div className="float-c absolute left-[16%] top-[55%] w-16 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/50" style={{ animationDelay: "0.5s" }} />
          <div className="float-a absolute left-[40%] bottom-[12%] w-14 h-14 rounded-2xl bg-primary/80 shadow-xl shadow-primary/40" style={{ animationDelay: "2.5s" }} />
          <div className="float-e absolute right-[22%] top-[22%] w-20 h-20 rounded-3xl bg-primary/70 shadow-xl shadow-primary/40" style={{ animationDelay: "1.2s" }} />
          <div className="float-d absolute right-[14%] bottom-[20%] w-16 h-16 rounded-2xl bg-primary/60 shadow-xl shadow-primary/30" style={{ animationDelay: "0.3s" }} />

          <div className="float-b absolute left-[55%] top-[10%] w-14 h-14 rounded-2xl bg-amber-400/90 shadow-xl shadow-amber-400/40" style={{ animationDelay: "1.8s" }} />
          <div className="float-a absolute left-[60%] bottom-[10%] w-12 h-12 rounded-2xl bg-amber-300/80 shadow-lg shadow-amber-300/30" style={{ animationDelay: "3.5s" }} />
          <div className="float-c absolute left-[8%] bottom-[22%] w-14 h-14 rounded-2xl bg-emerald-400/80 shadow-xl shadow-emerald-400/30" style={{ animationDelay: "2.2s" }} />

          <div className="float-e absolute right-[40%] bottom-[18%] w-12 h-12 rounded-2xl bg-violet-500/80 shadow-xl shadow-violet-500/40" style={{ animationDelay: "0.7s" }} />
          <div className="float-d absolute left-[26%] top-[20%] w-10 h-10 rounded-xl bg-sky-400/70 shadow-lg shadow-sky-400/30" style={{ animationDelay: "4s" }} />
        </div>

        {/* Center radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-primary/8 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-32 text-center flex flex-col items-center">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-md mb-8
            transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-[0.15em]">Our Story — Since 2024</span>
          </div>

          {/* Headline */}
          <h1 className={`font-heading font-black text-white leading-[1.08] mb-6 text-5xl sm:text-6xl lg:text-7xl
            transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Building the World's<br />
            <span className="text-aurora">Premier Expert</span><br />
            Marketplace
          </h1>

          {/* Subtitle */}
          <p className={`mx-auto max-w-xl text-slate-400 text-lg leading-relaxed mb-10
            transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            Founded in 2024 — connecting world-class talent with great businesses.
            No middlemen. No hassle. Just results.
          </p>

          {/* Trust chips */}
          <div style={{ transitionDelay: "280ms" }} className={`flex flex-wrap justify-center gap-3 mb-10
            transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {[
              { icon: Shield,       label: "Verified Experts",   cls: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
              { icon: Award,        label: "Quality Guaranteed", cls: "border-violet-400/30 bg-violet-400/10 text-violet-300" },
              { icon: CheckCircle2, label: "Secure Payments",    cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
            ].map(({ icon: I, label, cls }) => (
              <div key={label} className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border backdrop-blur-sm text-xs font-semibold ${cls}`}>
                <I className="w-3.5 h-3.5" />{label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ transitionDelay: "360ms" }} className={`flex flex-wrap justify-center gap-4
            transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <Link to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-200 cta-pulse">
              Explore Projects <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/8 backdrop-blur-sm text-sm font-bold text-white hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200">
              How It Works
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-white/25 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/50" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ══ STATS — HD image bg ═════════════════════════ */}
      <section ref={statsRef} className="relative py-20 overflow-hidden">

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">
            Numbers that speak for themselves
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users,      numericValue: 10000, suffix: "+", label: "Active Experts",    color: { iconColor: "text-sky-400",     glowColor: "rgba(56,189,248,0.25)",  borderColor: "border-sky-500/30"     } },
              { icon: Briefcase,  numericValue: 25000, suffix: "+", label: "Projects Posted",   color: { iconColor: "text-violet-400",  glowColor: "rgba(139,92,246,0.25)",  borderColor: "border-violet-500/30"  } },
              { icon: Globe,      numericValue: 50,    suffix: "+", label: "Countries Reached", color: { iconColor: "text-emerald-400", glowColor: "rgba(52,211,153,0.25)",  borderColor: "border-emerald-500/30" } },
              { icon: TrendingUp, numericValue: 94,    suffix: "%", label: "Success Rate",      color: { iconColor: "text-amber-400",   glowColor: "rgba(251,191,36,0.25)",  borderColor: "border-amber-500/30"   } },
            ].map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.1} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ MISSION SPLIT ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">

          {/* Left — HD Image */}
          <div className="relative min-h-[320px] lg:min-h-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=90"
              alt="Professional workspace"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ animation: "slowZoom 18s ease-in-out infinite alternate" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-slate-950/20 to-slate-950/60 lg:to-background" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent lg:hidden" />
          </div>

          {/* Right — Mission content */}
          <div className="flex items-center bg-background px-8 py-14 lg:px-14">
            <div className="max-w-lg">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-5 uppercase tracking-widest">
                Our Mission
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-5">
                Work should work<br />
                <span className="text-gradient">for everyone.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We believe talent has no borders. Whether you're a business looking for the perfect expert
                or a professional looking for your next big project — ProjectHub removes every obstacle between you and great work.
              </p>

              <ul className="space-y-4">
                {[
                  { icon: Target,    text: "Connect businesses with world-class experts in minutes"     },
                  { icon: Shield,    text: "100% payment protection on every single project"            },
                  { icon: Globe,     text: "A truly global platform — 50+ countries and growing"        },
                  { icon: TrendingUp,text: "94% project success rate across all categories"             },
                ].map(({ icon: I, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <I className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY TIMELINE ────────────────────────────── */}
      <section ref={storyRef} className="relative py-20 overflow-hidden">
        {/* Subtle background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${storyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-3 uppercase tracking-widest">
              Timeline
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              How We Got Here
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              From a small idea to a global platform connecting talent with opportunity.
            </p>
          </div>

          {/* Timeline container */}
          <div className="relative space-y-8">
            {/* Rainbow vertical line — desktop only */}
            <div className="hidden md:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5"
              style={{ background: "linear-gradient(to bottom, #38bdf8, #8b5cf6, #10b981, #f59e0b, #f43f5e)" }} />

            {[
              {
                step: 1, year: "Jan 2024", align: "left"  as const, icon: Flame,
                title: "The Idea",
                desc: "Two engineers frustrated with expensive, outdated work platforms decided to build something better — for everyone.",
                stat: "Day 1", statLabel: "— vision locked in",
                color: { pill: "bg-sky-500/15 text-sky-500", dot: "bg-sky-500", dotBg: "bg-sky-400", border: "border-sky-500/25", glow: "hover:shadow-sky-500/20", iconBg: "bg-sky-500/10", iconText: "text-sky-500" },
              },
              {
                step: 2, year: "Apr 2024", align: "right" as const, icon: Code2,
                title: "First Build",
                desc: "MVP launched with core project posting and bidding features. 50 early users signed up in week one.",
                stat: "50+", statLabel: "users in week one",
                color: { pill: "bg-violet-500/15 text-violet-500", dot: "bg-violet-500", dotBg: "bg-violet-400", border: "border-violet-500/25", glow: "hover:shadow-violet-500/20", iconBg: "bg-violet-500/10", iconText: "text-violet-500" },
              },
              {
                step: 3, year: "Jul 2024", align: "left"  as const, icon: BarChart3,
                title: "Rapid Growth",
                desc: "Crossed 1,000 registered users and 500 live projects. Payment and rating systems added.",
                stat: "1,000+", statLabel: "registered users",
                color: { pill: "bg-emerald-500/15 text-emerald-600", dot: "bg-emerald-500", dotBg: "bg-emerald-400", border: "border-emerald-500/25", glow: "hover:shadow-emerald-500/20", iconBg: "bg-emerald-500/10", iconText: "text-emerald-600" },
              },
              {
                step: 4, year: "Nov 2024", align: "right" as const, icon: Server,
                title: "Scale Up",
                desc: "Admin dashboard, real-time notifications, and Cloudinary-powered media uploads rolled out.",
                stat: "10K+", statLabel: "active users",
                color: { pill: "bg-amber-500/15 text-amber-600", dot: "bg-amber-500", dotBg: "bg-amber-400", border: "border-amber-500/25", glow: "hover:shadow-amber-500/20", iconBg: "bg-amber-500/10", iconText: "text-amber-600" },
              },
              {
                step: 5, year: "2025", align: "left"  as const, icon: Telescope,
                title: "What's Next",
                desc: "Mobile app, AI-powered project matching, and expanding into new global markets and emerging economies.",
                stat: "50+", statLabel: "countries targeted",
                color: { pill: "bg-rose-500/15 text-rose-500", dot: "bg-rose-500", dotBg: "bg-rose-400", border: "border-rose-500/25", glow: "hover:shadow-rose-500/20", iconBg: "bg-rose-500/10", iconText: "text-rose-500" },
              },
            ].map((step, i) => (
              <TimelineStep key={step.year} {...step} delay={i * 0.12} visible={storyVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────── */}
      <section ref={valuesRef} className="relative py-20 border-y border-border overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 bg-secondary/20" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Target,    title: "Mission First",
                desc: "We exist to create real economic opportunity for every skilled professional, anywhere in the world.",
                color: { icon: "text-sky-500",     bg: "bg-sky-500/8",     border: "border-sky-500/20",     glow: "hover:shadow-sky-500/12",     label: "Core" },
              },
              {
                icon: Zap,       title: "Move Fast",
                desc: "We ship quickly and iterate on real feedback — not what we think users want.",
                color: { icon: "text-amber-500",   bg: "bg-amber-500/8",   border: "border-amber-500/20",   glow: "hover:shadow-amber-500/12",   label: "Speed" },
              },
              {
                icon: Shield,    title: "Trust & Safety",
                desc: "Verified profiles, secure payments, and transparent reviews build a marketplace everyone can rely on.",
                color: { icon: "text-emerald-500", bg: "bg-emerald-500/8", border: "border-emerald-500/20", glow: "hover:shadow-emerald-500/12", label: "Safety" },
              },
              {
                icon: Lightbulb, title: "Quality Always",
                desc: "We hold both project briefs and bids to the highest standard so the right people find each other.",
                color: { icon: "text-violet-500",  bg: "bg-violet-500/8",  border: "border-violet-500/20",  glow: "hover:shadow-violet-500/12",  label: "Excellence" },
              },
              {
                icon: Handshake, title: "Fair for Everyone",
                desc: "Low fees and transparent pricing mean professionals keep more of what they earn.",
                color: { icon: "text-blue-500",    bg: "bg-blue-500/8",    border: "border-blue-500/20",    glow: "hover:shadow-blue-500/12",    label: "Fairness" },
              },
              {
                icon: Globe,     title: "Think Global",
                desc: "Designed to connect talent and opportunity across every corner of the world — no boundaries.",
                color: { icon: "text-rose-500",    bg: "bg-rose-500/8",    border: "border-rose-500/20",    glow: "hover:shadow-rose-500/12",    label: "Global" },
              },
            ].map((v, i) => (
              <ValueCard key={v.title} {...v} delay={i * 0.07} visible={valuesVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────── */}
      <section ref={teamRef} className="relative py-24 overflow-hidden bg-[#0a0a0f]">

        {/* Aurora glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora-1 absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="aurora-2 absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-3xl" />
          <div className="aurora-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-sky-400/5 blur-3xl" />
        </div>

        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className={`text-center mb-14 transition-all duration-700 ${teamVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/15 mb-4 uppercase tracking-widest">
              The Team
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-4">
              People Behind<br />
              <span className="text-aurora">ProjectHub</span>
            </h2>
            <p className="text-slate-400 max-w-md mx-auto text-base leading-relaxed">
              A passionate team obsessed with building the best professional work experience globally.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Arjun Sharma", role: "Co-founder & CEO", initials: "AS", location: "San Francisco, US",
                gradient: "from-sky-500 via-primary to-blue-700",
                glowColor: "rgba(56,189,248,0.35)",
                tags: ["Strategy", "Vision", "Leadership"],
                stats: [{ label: "Exp", value: "8yr" }, { label: "Projects", value: "200+" }, { label: "Rating", value: "5.0" }],
              },
              {
                name: "Priya Mehta", role: "Co-founder & CTO", initials: "PM", location: "London, UK",
                gradient: "from-violet-600 via-purple-600 to-indigo-700",
                glowColor: "rgba(139,92,246,0.35)",
                tags: ["Engineering", "Architecture", "AI/ML"],
                stats: [{ label: "Exp", value: "10yr" }, { label: "Systems", value: "50+" }, { label: "Rating", value: "5.0" }],
              },
              {
                name: "Rohan Desai", role: "Head of Product", initials: "RD", location: "Berlin, Germany",
                gradient: "from-emerald-500 via-teal-500 to-cyan-600",
                glowColor: "rgba(52,211,153,0.35)",
                tags: ["Product", "UX", "Analytics"],
                stats: [{ label: "Exp", value: "7yr" }, { label: "Launched", value: "30+" }, { label: "Rating", value: "4.9" }],
              },
              {
                name: "Sneha Kulkarni", role: "Head of Growth", initials: "SK", location: "Singapore",
                gradient: "from-amber-500 via-orange-500 to-rose-500",
                glowColor: "rgba(251,146,60,0.35)",
                tags: ["Growth", "Marketing", "GTM"],
                stats: [{ label: "Exp", value: "6yr" }, { label: "Campaigns", value: "100+" }, { label: "Rating", value: "5.0" }],
              },
            ].map((member, i) => (
              <TeamCard key={member.name} {...member} delay={i * 0.1} visible={teamVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────── */}
      <section ref={ctaRef} className="py-20 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-3xl border border-primary/20 p-10 sm:p-14 text-center
              transition-all duration-700 ${ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            {/* HD background image */}
            <img
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=85"
              alt="Success"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-sky-600/70 to-violet-700/60" />

            {/* Glow blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/8 blur-2xl" />
            </div>

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-5">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
                Ready to get started?
              </h2>
              <p className="text-white/75 text-base max-w-md mx-auto mb-8 leading-relaxed">
                Join thousands of experts and businesses already growing with ProjectHub.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-primary text-sm font-bold hover:bg-white/90 hover:shadow-xl transition-all duration-200">
                  <Users className="w-4 h-4" />
                  Join for Free
                </Link>
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-sm font-bold text-white hover:bg-white/20 transition-all duration-200">
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
