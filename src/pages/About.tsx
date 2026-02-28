import { Users, Target, Zap, Globe, Star, TrendingUp } from "lucide-react";

const stats = [
  { label: "Freelancers",     value: "10,000+",  icon: Users      },
  { label: "Projects Posted", value: "25,000+",  icon: Briefcase  },
  { label: "Cities Covered",  value: "200+",     icon: Globe      },
  { label: "Success Rate",    value: "94%",      icon: TrendingUp },
];

import { Briefcase } from "lucide-react";

const team = [
  { name: "Dnyaneshwar Ambhore", role: "Founder & CEO",       initials: "DA" },
  { name: "Priya Sharma",        role: "Head of Product",     initials: "PS" },
  { name: "Rahul Mehta",         role: "Lead Engineer",       initials: "RM" },
  { name: "Sneha Patil",         role: "Community Manager",   initials: "SP" },
];

const values = [
  { icon: Target, title: "Mission First",   desc: "We exist to create economic opportunity for every freelancer in India." },
  { icon: Zap,    title: "Move Fast",       desc: "We ship features quickly and iterate based on real user feedback."       },
  { icon: Star,   title: "Quality Always",  desc: "We hold both projects and bids to the highest standard."               },
  { icon: Globe,  title: "Think Global",    desc: "Built in Pune, designed for the world."                                },
];

const About = () => (
  <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 space-y-20">

    {/* Hero */}
    <div className="text-center space-y-4">
      <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
        Our Story
      </span>
      <h1 className="font-heading text-4xl font-bold text-foreground leading-tight">
        Building India's Premier<br className="hidden sm:block" /> Freelance Marketplace
      </h1>
      <p className="mx-auto max-w-xl text-muted-foreground text-base leading-relaxed">
        ProjectHub was founded in 2024 with one goal: make it simple for businesses to
        find great talent, and for freelancers to find great work — no middlemen, no hassle.
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
          <Icon className="h-5 w-5 text-primary mx-auto" />
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>

    {/* Values */}
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-foreground text-center">What We Stand For</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {values.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Team */}
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-foreground text-center">Meet the Team</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {team.map(({ name, role, initials }) => (
          <div key={name} className="rounded-xl border border-border bg-card p-5 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
              <span className="text-lg font-bold text-primary">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default About;
