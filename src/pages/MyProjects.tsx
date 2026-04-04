import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { mapProject } from "@/context/ProjectContext";
import { api } from "@/lib/api";
import { Project } from "@/types/project";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen, Gavel, Plus, Package,
  IndianRupee, CalendarDays, ArrowRight,
  Briefcase, Clock, CheckCircle2, XCircle, Loader2,
  TrendingUp, Users,
} from "lucide-react";

/* ─── Status config ──────────────────────────────────── */
const STATUS_CONFIG: Record<string, {
  label: string; dot: string; badge: string; strip: string;
}> = {
  pending:       { label: "Pending Approval", dot: "bg-yellow-500",    badge: "bg-yellow-500/10 text-yellow-600 border-yellow-500/25",    strip: "from-yellow-500/20 to-transparent"    },
  open:          { label: "Open",             dot: "bg-emerald-500",   badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25", strip: "from-emerald-500/20 to-transparent"   },
  "in-progress": { label: "In Progress",      dot: "bg-blue-500",      badge: "bg-blue-500/10 text-blue-600 border-blue-500/25",         strip: "from-blue-500/20 to-transparent"      },
  completed:     { label: "Completed",        dot: "bg-slate-400",     badge: "bg-muted text-muted-foreground border-border",            strip: "from-muted/60 to-transparent"         },
  cancelled:     { label: "Cancelled",        dot: "bg-destructive",   badge: "bg-destructive/10 text-destructive border-destructive/25",strip: "from-destructive/20 to-transparent"   },
};

const fallback = { label: "Unknown", dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground border-border", strip: "from-muted/40 to-transparent" };

/* ─── Skeleton card ──────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="rounded-2xl border border-border bg-card overflow-hidden card-enter"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="h-1 skeleton-shimmer" />
    <div className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-3 w-full rounded-md" />
      <Skeleton className="h-3 w-2/3 rounded-md" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
    </div>
  </div>
);

/* ─── Stat card ──────────────────────────────────────── */
const StatCard = ({
  icon: Icon, value, label, color, delay,
}: {
  icon: React.ElementType; value: number | string; label: string; color: string; delay: number;
}) => (
  <div
    className="card-enter flex items-center gap-4 px-5 py-4 rounded-2xl border border-border bg-card"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="font-heading text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);

/* ─── Project Card ───────────────────────────────────── */
const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const cfg = STATUS_CONFIG[project.status] ?? fallback;

  return (
    <Link to={`/project/${project.id}`} className="block group card-enter" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="relative h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_8px_30px_-8px_hsl(220_85%_58%/0.35)]">

        {/* Top gradient accent line on hover */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary via-violet-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Status color strip */}
        <div className={`h-1 w-full bg-gradient-to-r ${cfg.strip}`} />

        <div className="p-5 flex flex-col h-full">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-heading font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1 group-hover:text-primary transition-colors duration-200">
              {project.title}
            </h3>
            <Badge variant="outline" className={`shrink-0 text-[10px] capitalize border ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5 inline-block`} />
              {cfg.label}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
            {project.description}
          </p>

          {/* Skills */}
          {project.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {project.skills.slice(0, 3).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/8 text-primary border border-primary/15">
                  {s}
                </span>
              ))}
              {project.skills.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                  +{project.skills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <IndianRupee className="w-3 h-3 text-primary" />
                {project.budget.min.toLocaleString("en-IN")}–{project.budget.max.toLocaleString("en-IN")}
              </span>
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {project.deadline}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Gavel className="w-3 h-3" />
                {project.bids} bid{project.bids !== 1 ? "s" : ""}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─── Assigned Card ──────────────────────────────────── */
const AssignedCard = ({ project, index }: { project: Project; index: number }) => {
  const cfg = STATUS_CONFIG[project.status] ?? fallback;

  return (
    <Link to={`/project/${project.id}`} className="block group card-enter" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="relative h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_8px_30px_-8px_hsl(220_85%_58%/0.35)]">

        {/* Top gradient accent line on hover */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary via-violet-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        <div className={`h-1 w-full bg-gradient-to-r ${cfg.strip}`} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-heading font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1 group-hover:text-primary transition-colors duration-200">
              {project.title}
            </h3>
            <Badge variant="outline" className={`shrink-0 text-[10px] capitalize border ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5 inline-block`} />
              {cfg.label}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>

          {project.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {project.skills.slice(0, 3).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/8 text-primary border border-primary/15">
                  {s}
                </span>
              ))}
              {project.skills.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                  +{project.skills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <IndianRupee className="w-3 h-3 text-primary" />
                {project.budget.min.toLocaleString("en-IN")}–{project.budget.max.toLocaleString("en-IN")}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-muted-foreground/60">Client:</span>
              <span className="font-medium text-foreground">{project.seller.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─── Empty State ────────────────────────────────────── */
const EmptyState = ({
  icon: Icon, title, description, showCTA,
}: {
  icon: React.ElementType; title: string; description: string; showCTA?: boolean;
}) => (
  <div className="card-enter flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-5 relative">
      <div className="w-20 h-20 rounded-2xl bg-muted/60 flex items-center justify-center">
        <Icon className="w-9 h-9 text-muted-foreground/60" />
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-border/50 animate-pulse" />
    </div>
    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>
    {showCTA && (
      <Link to="/post-project" className="mt-6">
        <Button className="gap-2 cta-pulse">
          <Plus className="w-4 h-4" />
          Post Your First Project
        </Button>
      </Link>
    )}
  </div>
);

/* ─── Tab Button ─────────────────────────────────────── */
const TabBtn = ({
  active, onClick, icon: Icon, label, count,
}: {
  active: boolean; onClick: () => void; icon: React.ElementType; label: string; count: number;
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
      ${active
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center
      ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
      {count}
    </span>
  </button>
);

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
const MyProjects = () => {
  const [posted,   setPosted]   = useState<Project[]>([]);
  const [assigned, setAssigned] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab, setTab]           = useState<"posted" | "assigned">("posted");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, a] = await Promise.allSettled([
        api.get<unknown[]>("/users/me/posted"),
        api.get<unknown[]>("/users/me/assigned"),
      ]);
      if (p.status === "fulfilled") setPosted(p.value.map(mapProject));
      if (a.status === "fulfilled") setAssigned(a.value.map(mapProject));
      setLoading(false);
    })();
  }, []);

  /* derived stats */
  const openCount      = posted.filter((p) => p.status === "open").length;
  const inProgressCount = [...posted, ...assigned].filter((p) => p.status === "in-progress").length;
  const completedCount  = [...posted, ...assigned].filter((p) => p.status === "completed").length;
  const totalBids       = posted.reduce((s, p) => s + p.bids, 0);

  const activeList = tab === "posted" ? posted : assigned;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 card-enter">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track and manage all your projects in one place</p>
          </div>
          <Link to="/post-project">
            <Button className="gap-2 cta-pulse">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* ── Stats row ─────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
            <StatCard icon={FolderOpen}   value={posted.length}   label="Posted"     color="bg-primary/10 text-primary"         delay={0.05} />
            <StatCard icon={Briefcase}    value={assigned.length} label="Assigned"   color="bg-accent/10 text-accent"           delay={0.1}  />
            <StatCard icon={TrendingUp}   value={totalBids}       label="Total Bids" color="bg-emerald-500/10 text-emerald-600" delay={0.15} />
            <StatCard icon={CheckCircle2} value={completedCount}  label="Completed"  color="bg-muted text-muted-foreground"     delay={0.2}  />
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 card-enter" style={{ animationDelay: "0.08s" }}>
          <TabBtn active={tab === "posted"}   onClick={() => setTab("posted")}   icon={FolderOpen} label="Posted"   count={posted.length}   />
          <TabBtn active={tab === "assigned"} onClick={() => setTab("assigned")} icon={Gavel}      label="Assigned" count={assigned.length} />
        </div>

        {/* ── Content ───────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 0.08, 0.16, 0.24, 0.32, 0.40].map((d, i) => (
              <SkeletonCard key={i} delay={d} />
            ))}
          </div>
        ) : activeList.length > 0 ? (
          <div key={tab} className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${tab === "posted" ? "step-enter-fwd" : "step-enter-bwd"}`}>
            {tab === "posted"
              ? posted.map((p, i) => <ProjectCard  key={p.id} project={p} index={i} />)
              : assigned.map((p, i) => <AssignedCard key={p.id} project={p} index={i} />)
            }
          </div>
        ) : (
          <div key={`empty-${tab}`} className="step-enter-fwd">
            {tab === "posted" ? (
              <EmptyState
                icon={Package}
                title="No projects posted yet"
                description="Post your first project and start receiving bids from skilled experts."
                showCTA
              />
            ) : (
              <EmptyState
                icon={Gavel}
                title="No assigned projects yet"
                description="When a client accepts your bid, the project will appear here."
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyProjects;
