import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { mapProject } from "@/context/ProjectContext";
import { Project } from "@/types/project";
import ProjectCard from "@/components/ProjectCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Search, TrendingUp, Users, FolderOpen, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [results, setResults]         = useState<Project[]>([]);

  // Fetch all projects once on mount
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get<any[]>("/projects")
      .then((data) => {
        const mapped = data.map(mapProject);
        setAllProjects(mapped);
        setResults(mapped);
      })
      .catch(() => {
        setAllProjects([]);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-filter whenever search text, category, or base list changes
  useEffect(() => {
    let list = allProjects;

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();

      // Safe check: works on any value type, never throws
      const has = (val: unknown): boolean =>
        typeof val === "string" && val.toLowerCase().includes(term);

      const hasInArr = (arr: unknown): boolean =>
        Array.isArray(arr) && arr.some((s) => has(s));

      list = list.filter((p) =>
        has(p.title) ||
        has(p.description) ||
        has(p.category) ||
        has(p.subcategory) ||
        has(p.companyName) ||
        has(p.location) ||
        has(p.projectType) ||
        has(p.urgencyLevel) ||
        hasInArr(p.skills) ||
        hasInArr(p.posterSkills) ||
        has(p.seller?.name)
      );
    }

    setResults(list);
  }, [allProjects, search, selectedCategory]);

  const openCount = allProjects.filter((p) => p.status === "open").length;
  const totalBids = allProjects.reduce((sum, p) => sum + p.bids, 0);
  const isFiltered = !!(search || selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Find the perfect project
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse freelance projects across every category. Bid, win, and deliver.
        </p>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Card className="flex items-center gap-3 px-4 py-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Projects</p>
              <p className="font-heading text-lg font-bold text-foreground">{allProjects.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 px-4 py-3">
            <TrendingUp className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Open Projects</p>
              <p className="font-heading text-lg font-bold text-foreground">{openCount}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 px-4 py-3">
            <Users className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Total Bids</p>
              <p className="font-heading text-lg font-bold text-foreground">{totalBids}</p>
            </div>
          </Card>
        </div>

        {/* Search box */}
        <div className="relative mt-6 max-w-lg">
          {loading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            placeholder="Search by title, skill, description, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-11 bg-card border"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Results header */}
      {!loading && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isFiltered ? (
              <>
                Found <span className="font-medium text-foreground">{results.length}</span>{" "}
                project{results.length !== 1 ? "s" : ""}
                {search && (
                  <> for &quot;<span className="font-medium text-foreground">{search}</span>&quot;</>
                )}
              </>
            ) : (
              <>Showing <span className="font-medium text-foreground">{results.length}</span> projects</>
            )}
          </p>
          {isFiltered && (
            <button
              onClick={() => { setSearch(""); setSelectedCategory(""); }}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
          <p className="text-lg font-medium text-foreground">No projects found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? `No results for "${search}". Try different keywords.`
              : "No projects available yet."}
          </p>
          {isFiltered && (
            <button
              onClick={() => { setSearch(""); setSelectedCategory(""); }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
