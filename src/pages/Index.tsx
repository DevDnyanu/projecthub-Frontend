import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { mapProject } from "@/context/ProjectContext";
import { Project } from "@/types/project";
import { useAuth } from "@/context/AuthContext";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";
import CategoryFilter from "@/components/CategoryFilter";
import {
  Search, TrendingUp, Users, FolderOpen, X, Loader2,
  Briefcase, ShieldCheck, Star, Clock, ArrowRight, Sparkles,
  IndianRupee, Gavel, Lock,
} from "lucide-react";

/* ── Popular search tags ── */
const POPULAR = [
  "React Developer", "UI/UX Design", "Logo Design",
  "WordPress", "Python", "Content Writing", "SEO",
];

/* ── Trust avatars (initials fallback) ── */
const TRUST_AVATARS = ["RK", "AS", "MP", "NJ", "VS"];

const Index = () => {
  const navigate                      = useNavigate();
  const { isLoggedIn }                = useAuth();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [selectedCategory, setSelectedCategory]       = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [results, setResults] = useState<Project[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get<any[]>("/projects")
      .then((data) => {
        const mapped = data.map(mapProject);
        setAllProjects(mapped);
        setResults(mapped);
      })
      .catch(() => { setAllProjects([]); setResults([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = allProjects;
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    if (selectedSubcategory) {
      const sub = selectedSubcategory.toLowerCase();
      list = list.filter((p) =>
        p.subcategory?.toLowerCase().includes(sub) ||
        p.skills.some((s) => s.toLowerCase().includes(sub))
      );
    }
    if (search.trim()) {
      const term     = search.trim().toLowerCase();
      const has      = (val: unknown): boolean => typeof val === "string" && val.toLowerCase().includes(term);
      const hasInArr = (arr: unknown): boolean => Array.isArray(arr) && arr.some((s) => has(s));
      list = list.filter((p) =>
        has(p.title)       || has(p.description)  || has(p.category)    ||
        has(p.subcategory) || has(p.companyName)   || has(p.location)    ||
        has(p.projectType) || has(p.urgencyLevel)  ||
        hasInArr(p.skills) || hasInArr(p.posterSkills) ||
        has(p.seller?.name)
      );
    }
    setResults(list);
  }, [allProjects, search, selectedCategory, selectedSubcategory]);

  const openCount  = allProjects.filter((p) => p.status === "open").length;
  const totalBids  = allProjects.reduce((sum, p) => sum + p.bids, 0);
  const isFiltered = !!(search || selectedCategory || selectedSubcategory);
  const clearAll   = () => { setSearch(""); setSelectedCategory(""); setSelectedSubcategory(""); };

  return (
    <div className="min-h-screen bg-background">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">

        {/* Background — layered gradient + mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-primary/95 to-slate-900" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 40%),
              radial-gradient(circle at 60% 80%, #0ea5e9 0%, transparent 35%)
            `,
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-10 sm:py-12 lg:py-16 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7">


            {/* Headline */}
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.1]">
              Connect with
              <br />
              <span className="text-white">Global Experts.</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                Build anything.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
              Work with the world's most trusted professionals across every domain. Start your project with confidence.
            </p>

            {/* Search bar */}
            <div className="mt-8 w-full max-w-2xl">
              <div className="flex items-center gap-0 rounded-2xl bg-white p-1.5 shadow-2xl shadow-black/30 ring-1 ring-white/20">
                <div className="relative flex-1">
                  {loading
                    ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
                    : <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  }
                  <input
                    type="text"
                    placeholder="Search for skills, projects, or technologies…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent py-3 pl-12 pr-10 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-900"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button className="btn-glow shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-primary/40 hover:bg-primary/90 active:scale-95 transition-all duration-200">
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>

              {/* Popular searches */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">Popular:</span>
                {POPULAR.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearch(tag)}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-150"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-white leading-none">
                    {loading ? "—" : allProjects.length.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-white/50 mt-0.5">Total Projects</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 backdrop-blur-sm px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-white leading-none">
                    {loading ? "—" : openCount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-400/70 mt-0.5">Open Now</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border border-sky-500/25 bg-sky-500/10 backdrop-blur-sm px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20">
                  <Users className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-white leading-none">
                    {loading ? "—" : totalBids.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-sky-400/70 mt-0.5">Active Bids</p>
                </div>
              </div>
            </div>
          </div>{/* /LEFT COLUMN */}

          {/* ── RIGHT COLUMN — Latest open projects ── */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                  Latest Open Projects
                </p>
              </div>
              <button
                onClick={() => document.getElementById("browse-section")?.scrollIntoView({ behavior: "smooth" })}
                className="text-[11px] text-white/50 hover:text-white transition-colors flex items-center gap-1 border border-white/15 bg-white/8 rounded-full px-2.5 py-1 hover:bg-white/15"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md p-5 animate-pulse">
                  <div className="h-4 bg-white/15 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-white/10 rounded w-full mb-2" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              ))
            ) : (
              allProjects
                .filter((p) => p.status === "open")
                .slice(0, 2)
                .map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      if (!isLoggedIn) { navigate("/login"); return; }
                      navigate(`/project/${project.id}`);
                    }}
                    className="group w-full text-left rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 hover:bg-white/18 hover:border-white/30 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <p className="font-semibold text-white text-sm leading-snug line-clamp-1">
                        {project.title}
                      </p>
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Open
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-white/60 line-clamp-1 mb-3 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Skills */}
                    {project.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.skills.slice(0, 2).map((s) => (
                          <span key={s} className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] text-white/75 font-medium">
                            {s}
                          </span>
                        ))}
                        {project.skills.length > 2 && (
                          <span className="rounded-full bg-white/8 border border-white/10 px-2 py-0.5 text-[10px] text-white/40">+{project.skills.length - 2} more</span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[12px] font-bold text-white">
                          <IndianRupee className="h-3 w-3" />
                          {project.budget.min.toLocaleString("en-IN")}–{project.budget.max.toLocaleString("en-IN")}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-white/45">
                          <Gavel className="h-3 w-3" />
                          {project.bids} bids
                        </span>
                      </div>
                      {!isLoggedIn ? (
                        <span className="flex items-center gap-1 text-[11px] text-white/40 border border-white/15 rounded-full px-2 py-0.5">
                          <Lock className="h-3 w-3" /> Login
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-white/70 group-hover:text-white transition-colors">
                          View <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </button>
                ))
            )}

            {/* CTA */}
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/login")}
                className="mt-1 w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-[13px] font-semibold text-white/70 hover:bg-white/15 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Lock className="h-3.5 w-3.5" />
                Sign in to access all projects
              </button>
            )}
          </div>

          </div>{/* /grid */}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════ */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-3.5">
            {[
              { icon: ShieldCheck, text: "Verified experts only",      color: "text-emerald-500", bg: "bg-emerald-500/8" },
              { icon: Clock,       text: "Projects delivered on time", color: "text-sky-500",     bg: "bg-sky-500/8"     },
              { icon: Star,        text: "4.9 / 5 average rating",     color: "text-amber-500",   bg: "bg-amber-500/8"   },
              { icon: Sparkles,    text: "100% payment protection",    color: "text-violet-500",  bg: "bg-violet-500/8"  },
            ].map(({ icon: Icon, text, color, bg }) => (
              <div key={text} className={`flex items-center gap-2 rounded-full ${bg} border border-border px-3 py-1.5`}>
                <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                <span className="text-[12px] font-medium text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BROWSE SECTION
      ══════════════════════════════════════════════ */}
      <section id="browse-section" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Browse Opportunities</p>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {isFiltered
                ? `${results.length} project${results.length !== 1 ? "s" : ""} found`
                : "All Open Projects"}
            </h2>
            {!isFiltered && !loading && (
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {results.length} projects across all categories
              </p>
            )}
          </div>
          {isFiltered && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={(id) => { setSelectedCategory(id); setSelectedSubcategory(""); }}
            selectedSubcategory={selectedSubcategory}
            onSubcategorySelect={setSelectedSubcategory}
          />
        </div>

        {/* Active filter chips */}
        {isFiltered && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-xs font-semibold text-primary">
                "{search}"
                <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-xs font-semibold text-primary">
                {selectedCategory}
                <button onClick={() => { setSelectedCategory(""); setSelectedSubcategory(""); }}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedSubcategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-xs font-semibold text-primary">
                {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory("")}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="skeleton-shimmer h-9 w-full" />
                <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
                  <div className="skeleton-shimmer h-4 w-3/4 rounded-md" />
                  <div className="skeleton-shimmer h-3 w-full rounded-md" />
                  <div className="skeleton-shimmer h-3 w-5/6 rounded-md" />
                  <div className="flex gap-1.5 mt-1">
                    <div className="skeleton-shimmer h-5 w-16 rounded-lg" />
                    <div className="skeleton-shimmer h-5 w-20 rounded-lg" />
                    <div className="skeleton-shimmer h-5 w-14 rounded-lg" />
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
                  <div className="skeleton-shimmer h-5 w-24 rounded-md" />
                  <div className="skeleton-shimmer h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((project, i) => (
              <ScrollReveal key={project.id} from="up" delay={(i % 3) * 0.08} threshold={0.08}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted border border-border shadow-sm">
              <Briefcase className="h-9 w-9 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No projects found</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
              {search
                ? `We couldn't find any projects matching "${search}". Try broader keywords or a different category.`
                : selectedSubcategory
                ? `No projects in "${selectedSubcategory}" at the moment. Try a different subcategory.`
                : "No projects match your current filters."}
            </p>
            {isFiltered && (
              <button
                onClick={clearAll}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && results.length > 0 && (
          <div className="mt-14 relative rounded-2xl overflow-hidden border border-primary/20 px-8 py-10 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/5 to-sky-500/8" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest mb-3">
                <Sparkles className="h-3 w-3" /> Ready to grow?
              </span>
              <h3 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                Don't see the right project?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Post your requirements and let qualified experts come to you. Takes less than 2 minutes.
              </p>
              <a
                href="/post-project"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all duration-150 hover:-translate-y-0.5"
              >
                Post a Project <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
