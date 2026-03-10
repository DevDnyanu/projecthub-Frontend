import {
  useState, useEffect, useRef, useCallback,
  type TouchEvent as RTouchEvent,
} from "react";
import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft, ChevronRight, IndianRupee,
  Clock, Users, MapPin, Zap, Star,
  CalendarDays, ArrowUpRight, Pause, Play,
} from "lucide-react";

/* ─── Status config (matches ProjectCard) ────────────── */
const STATUS = {
  open:          { label: "Open",        dot: "bg-emerald-500", text: "text-emerald-500", strip: "from-emerald-500/30 via-emerald-500/10 to-transparent" },
  "in-progress": { label: "In Progress", dot: "bg-amber-500",   text: "text-amber-500",   strip: "from-amber-500/30  via-amber-500/10  to-transparent" },
  completed:     { label: "Completed",   dot: "bg-slate-400",   text: "text-slate-400",   strip: "from-slate-400/25  via-slate-400/8   to-transparent" },
  cancelled:     { label: "Cancelled",   dot: "bg-red-500",     text: "text-red-500",     strip: "from-red-500/30    via-red-500/10    to-transparent" },
  pending:       { label: "Pending",     dot: "bg-primary",     text: "text-primary",     strip: "from-primary/30    via-primary/10    to-transparent" },
} as Record<string, { label: string; dot: string; text: string; strip: string }>;

const fallbackStatus = STATUS["open"];
const isNew = (s: string) => s.toLowerCase().includes("hour") || s.toLowerCase().includes("just") || s.toLowerCase().includes("min");

const AUTO_INTERVAL = 5000; // ms

/* ══════════════════════════════════════════════════════
   SLIDESHOW
══════════════════════════════════════════════════════ */
interface Props { projects: Project[] }

export default function ProjectSlideshow({ projects }: Props) {
  const [index,    setIndex]   = useState(0);
  const [prev,     setPrev]    = useState<number | null>(null);
  const [dir,      setDir]     = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [paused,   setPaused]  = useState(false);
  const [progress, setProgress] = useState(0);

  /* touch */
  const touchStartX = useRef<number | null>(null);
  const progressRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef      = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const total = projects.length;
  if (total === 0) return null;

  /* ── Navigate ─────────────────────────────────────── */
  const navigate = useCallback((next: number, direction: "next" | "prev") => {
    if (animating) return;
    setPrev(index);
    setDir(direction);
    setIndex(next);
    setAnimating(true);
    setTimeout(() => { setAnimating(false); setPrev(null); }, 600);
    setProgress(0);
  }, [animating, index]);

  const goNext = useCallback(() => navigate((index + 1) % total, "next"), [navigate, index, total]);
  const goPrev = useCallback(() => navigate((index - 1 + total) % total, "prev"), [navigate, index, total]);
  const goTo   = useCallback((i: number) => navigate(i, i > index ? "next" : "prev"), [navigate, index]);

  /* ── Auto-advance + progress bar ─────────────────── */
  useEffect(() => {
    if (paused) { setProgress(0); return; }
    const tick = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { return p; }
        return p + (tick / AUTO_INTERVAL) * 100;
      });
    }, tick);
    autoRef.current = setTimeout(goNext, AUTO_INTERVAL);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (autoRef.current)     clearTimeout(autoRef.current);
    };
  }, [index, paused, goNext]);

  /* ── Keyboard ─────────────────────────────────────── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goNext, goPrev]);

  /* ── Touch / swipe ───────────────────────────────── */
  const onTouchStart = (e: RTouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: RTouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
  };

  /* ── Derive cards to render ───────────────────────── */
  const prevIdx  = (index - 1 + total) % total;
  const nextIdx  = (index + 1) % total;
  const project  = projects[index];
  const cfg      = STATUS[project.status] ?? fallbackStatus;
  const initials = project.seller.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  /* ── Enter animation class ────────────────────────── */
  const enterCls = dir === "next" ? "slide-enter-next" : "slide-enter-prev";
  const exitCls  = dir === "next" ? "slide-exit-next"  : "slide-exit-prev";

  return (
    <div className="relative select-none">

      {/* ── Section label ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-primary block" />
          <h2 className="font-heading text-base font-bold text-foreground">Featured Projects</h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{total}</span>
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* ── Track ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Side peek cards — desktop only */}
        <div className="hidden lg:flex absolute inset-y-0 left-0 w-[220px] z-10 items-center pointer-events-none">
          <div className="w-full opacity-30 scale-[0.88] origin-right -translate-x-4 transition-all duration-500 blur-[1px]">
            <SlimCard project={projects[prevIdx]} />
          </div>
        </div>
        <div className="hidden lg:flex absolute inset-y-0 right-0 w-[220px] z-10 items-center pointer-events-none">
          <div className="w-full opacity-30 scale-[0.88] origin-left translate-x-4 transition-all duration-500 blur-[1px]">
            <SlimCard project={projects[nextIdx]} />
          </div>
        </div>

        {/* Main card area */}
        <div className="lg:px-[200px]">

          {/* Outgoing card */}
          {prev !== null && (
            <div key={`exit-${prev}`} className={`absolute inset-0 lg:px-[200px] z-10 pointer-events-none ${exitCls}`}>
              <FullCard project={projects[prev]} />
            </div>
          )}

          {/* Active card */}
          <div key={`enter-${index}`} className={`relative z-20 ${animating ? enterCls : ""}`}>
            <Link to={`/project/${project.id}`} className="block group">
              <div className={`
                relative rounded-3xl border bg-card overflow-hidden
                shadow-xl shadow-primary/8 transition-all duration-300
                hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-0.5
                border-border hover:border-primary/30
              `}>

                {/* Gradient header */}
                <div className={`relative h-28 sm:h-36 bg-gradient-to-br ${cfg.strip} overflow-hidden`}>
                  {/* Decorative blobs */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 blur-lg" />

                  {/* Top row */}
                  <div className="absolute top-0 inset-x-0 px-5 pt-4 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${cfg.text}`}>
                      <span className={`w-2 h-2 rounded-full shadow-sm ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {project.urgencyLevel === "urgent" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                          <Zap className="w-2.5 h-2.5" /> Urgent
                        </span>
                      )}
                      {isNew(project.createdAt) && (
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-primary/40">
                          NEW
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-foreground/50">
                        <Clock className="w-3 h-3" /> {project.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 inset-x-0 px-5 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors duration-200">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 mt-1" />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 pt-4 pb-4 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Location + remote */}
                  {(project.location || project.remoteFriendly) && (
                    <div className="flex items-center gap-3 flex-wrap">
                      {project.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" /> {project.location}
                        </span>
                      )}
                      {project.remoteFriendly && (
                        <span className="rounded-full border border-primary/25 bg-primary/8 px-2.5 py-0.5 text-[10px] font-semibold text-primary/80">
                          Remote OK
                        </span>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.slice(0, 5).map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-lg border border-border bg-secondary/60 text-[11px] font-medium text-foreground/75">
                        {s}
                      </span>
                    ))}
                    {project.skills.length > 5 && (
                      <span className="px-2.5 py-0.5 rounded-lg border border-border bg-secondary/60 text-[11px] font-medium text-muted-foreground">
                        +{project.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-4 flex-wrap">
                  {/* Budget */}
                  <div className="flex items-baseline gap-0.5">
                    <IndianRupee className="w-4 h-4 text-primary font-bold" />
                    <span className="text-lg font-extrabold text-primary leading-none">
                      {project.budget.min.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground mx-1">–</span>
                    <span className="text-lg font-extrabold text-primary leading-none">
                      {project.budget.max.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Bids */}
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                      <Users className="w-3 h-3" /> {project.bids} {project.bids === 1 ? "bid" : "bids"}
                    </span>

                    {/* Seller */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 ring-1 ring-border">
                        <AvatarImage src={project.seller.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-foreground/70 max-w-[90px] truncate">{project.seller.name}</span>
                      {project.seller.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {project.seller.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Deadline */}
                    {project.deadline && (
                      <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="w-3 h-3" /> {project.deadline}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Progress bar ──────────────────────────────── */}
      <div className="mt-4 h-0.5 w-full bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-none"
          style={{ width: `${paused ? 0 : progress}%`, transition: paused ? "none" : "width 50ms linear" }}
        />
      </div>

      {/* ── Controls row ──────────────────────────────── */}
      <div className="flex items-center justify-between mt-3">

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? "bg-primary w-6 h-2"
                  : "bg-border hover:bg-primary/40 w-2 h-2"
              }`}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="flex w-8 h-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-center">
            {index + 1} / {total}
          </span>
          <button
            onClick={goNext}
            aria-label="Next"
            className="flex w-8 h-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-105"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Full card for exit animation ──────────────────── */
function FullCard({ project }: { project: Project }) {
  const cfg = STATUS[project.status] ?? fallbackStatus;
  return (
    <div className={`rounded-3xl border border-border bg-card overflow-hidden h-full`}>
      <div className={`h-28 sm:h-36 bg-gradient-to-br ${cfg.strip}`} />
      <div className="px-5 py-4">
        <p className="font-heading font-bold text-foreground line-clamp-2">{project.title}</p>
      </div>
    </div>
  );
}

/* ─── Side peek slim card ────────────────────────────── */
function SlimCard({ project }: { project: Project }) {
  const cfg = STATUS[project.status] ?? fallbackStatus;
  const initials = project.seller.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className={`h-16 bg-gradient-to-br ${cfg.strip} px-3 pt-3`}>
        <span className={`text-[10px] font-bold uppercase ${cfg.text} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
      <div className="px-3 py-3 space-y-2">
        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{project.title}</p>
        <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
          <IndianRupee className="w-2.5 h-2.5" />
          {project.budget.min.toLocaleString("en-IN")}–{project.budget.max.toLocaleString("en-IN")}
        </div>
        <div className="flex items-center gap-1.5">
          <Avatar className="w-4 h-4">
            <AvatarImage src={project.seller.avatar} />
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground truncate">{project.seller.name}</span>
        </div>
      </div>
    </div>
  );
}
