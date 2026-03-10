import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { Clock, Users, IndianRupee, MapPin, Zap, Star, CalendarDays, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statusConfig: Record<string, {
  label: string; dot: string; textCls: string;
  headerBg: string; borderCls: string;
}> = {
  open:          { label: "Open",        dot: "bg-emerald-500 shadow-emerald-500/50",  textCls: "text-emerald-600 dark:text-emerald-400", headerBg: "bg-emerald-500/8  dark:bg-emerald-500/10", borderCls: "border-emerald-400/60 hover:border-emerald-500" },
  "in-progress": { label: "In Progress", dot: "bg-amber-500  shadow-amber-500/50",    textCls: "text-amber-600  dark:text-amber-400",   headerBg: "bg-amber-500/8    dark:bg-amber-500/10",   borderCls: "border-amber-400/60  hover:border-amber-500"  },
  completed:     { label: "Completed",   dot: "bg-slate-400  shadow-slate-400/50",    textCls: "text-slate-500",                         headerBg: "bg-slate-500/6",                           borderCls: "border-slate-300    hover:border-slate-400"   },
  cancelled:     { label: "Cancelled",   dot: "bg-red-500    shadow-red-500/50",      textCls: "text-red-500",                           headerBg: "bg-red-500/8",                             borderCls: "border-red-400/60   hover:border-red-500"     },
  pending:       { label: "Pending",     dot: "bg-primary    shadow-primary/50",      textCls: "text-primary",                           headerBg: "bg-primary/6",                             borderCls: "border-primary/40   hover:border-primary"     },
};

/* parse "X days ago" / "just now" from the createdAt string to show NEW badge */
const isNew = (createdAt: string) => {
  const s = createdAt.toLowerCase();
  return s.includes("hour") || s.includes("just") || s.includes("min");
};

const ProjectCard = ({ project }: { project: Project }) => {
  const cfg = statusConfig[project.status] ?? statusConfig.open;
  const initials = project.seller.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const showNew  = isNew(project.createdAt);

  return (
    <Link to={`/project/${project.id}`} className="block group h-full">
      <div className={`
        relative flex flex-col h-full rounded-2xl border bg-card
        ${cfg.borderCls}
        shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10
        group-hover:-translate-y-1.5 group-hover:bg-card
        transition-all duration-250 ease-out overflow-hidden
      `}>

        {/* ── HEADER STRIP ── */}
        <div className={`flex items-center justify-between px-4 py-2.5 ${cfg.headerBg} border-b border-border/40`}>
          {/* Status */}
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${cfg.textCls}`}>
            <span className={`h-2 w-2 rounded-full shadow-sm ${cfg.dot}`} />
            {cfg.label}
          </span>

          <div className="flex items-center gap-2">
            {/* Urgent */}
            {project.urgencyLevel === "urgent" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500">
                <Zap className="h-2.5 w-2.5" /> Urgent
              </span>
            )}
            {/* New badge */}
            {showNew && (
              <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                NEW
              </span>
            )}
            {/* Time */}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {project.createdAt}
            </span>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex flex-col flex-1 px-4 pt-3.5 pb-3 gap-2.5">

          {/* Title + arrow icon */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-[0.97rem] font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {project.title}
            </h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
          </div>

          {/* Description */}
          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Location / Remote */}
          {(project.location || project.remoteFriendly) && (
            <div className="flex items-center gap-2 flex-wrap">
              {project.location && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {project.location}
                </span>
              )}
              {project.remoteFriendly && (
                <span className="rounded-full border border-primary/25 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary/80">
                  Remote OK
                </span>
              )}
            </div>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {project.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-border bg-secondary/70 px-2.5 py-0.5 text-[11px] font-medium text-foreground/75"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 3 && (
              <span className="rounded-lg border border-border bg-secondary/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{project.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="px-4 py-3 border-t border-border/50 bg-muted/25">

          {/* Budget row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-4 w-4 text-primary font-bold" />
              <span className="text-base font-extrabold text-primary leading-none">
                {project.budget.min.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-muted-foreground mx-1">–</span>
              <span className="text-base font-extrabold text-primary leading-none">
                {project.budget.max.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Bids count pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              <Users className="h-3 w-3" />
              {project.bids} {project.bids === 1 ? "bid" : "bids"}
            </span>
          </div>

          {/* Seller row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-6 w-6 shrink-0 ring-1 ring-border">
                <AvatarImage src={project.seller.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[12px] font-medium text-foreground/70 truncate max-w-[100px]">
                {project.seller.name}
              </span>
              {project.seller.rating > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  {project.seller.rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Deadline */}
            {project.deadline && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                <CalendarDays className="h-3 w-3" />
                {project.deadline}
              </span>
            )}
          </div>
        </div>

      </div>
    </Link>
  );
};

export default ProjectCard;
