import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { mapProject } from "@/context/ProjectContext";
import { api } from "@/lib/api";
import { Project } from "@/types/project";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Gavel, Plus, Package, IndianRupee, CalendarDays, ArrowRight } from "lucide-react";

const statusStyles: Record<string, string> = {
  pending:       "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  open:          "bg-green-500/10 text-green-600 border-green-500/20",
  "in-progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed:     "bg-muted text-muted-foreground border-border",
  cancelled:     "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabel: Record<string, string> = {
  pending:       "Pending Approval",
  open:          "Open",
  "in-progress": "In Progress",
  completed:     "Completed",
  cancelled:     "Cancelled",
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  showCTA,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  showCTA?: boolean;
}) => (
  <Card className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    {showCTA && (
      <Link to="/post-project" className="mt-4">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Post Your First Project
        </Button>
      </Link>
    )}
  </Card>
);

/* ── Assigned Project Card ── */
const AssignedProjectCard = ({ project }: { project: Project }) => (
  <Link to={`/project/${project.id}`}>
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
          {project.title}
        </h3>
        <Badge variant="outline" className={`shrink-0 text-[10px] capitalize ${statusStyles[project.status]}`}>
          {statusLabel[project.status] ?? project.status}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <IndianRupee className="h-3 w-3" />
            {project.budget.min.toLocaleString("en-IN")} – {project.budget.max.toLocaleString("en-IN")}
          </span>
          {project.deadline && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {project.deadline}
            </span>
          )}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Client:</span>
        <span className="text-xs font-medium text-foreground">{project.seller.name}</span>
      </div>
    </div>
  </Link>
);

const MyProjects = () => {
  const [posted,   setPosted]   = useState<Project[]>([]);
  const [assigned, setAssigned] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchMyProjects = async () => {
      setLoading(true);
      const [postedResult, assignedResult] = await Promise.allSettled([
        api.get<unknown[]>("/users/me/posted"),
        api.get<unknown[]>("/users/me/assigned"),
      ]);
      if (postedResult.status === "fulfilled") {
        setPosted(postedResult.value.map(mapProject));
      } else {
        console.error("Posted fetch error:", postedResult.reason);
      }
      if (assignedResult.status === "fulfilled") {
        setAssigned(assignedResult.value.map(mapProject));
      } else {
        console.error("Assigned fetch error:", assignedResult.reason);
      }
      setLoading(false);
    };
    fetchMyProjects();
  }, []);

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Projects</h1>
          <p className="mt-1 text-muted-foreground">Projects you posted and projects you're working on.</p>
        </div>
        <Link to="/post-project">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="posted">
        <TabsList>
          <TabsTrigger value="posted" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Posted ({posted.length})
          </TabsTrigger>
          <TabsTrigger value="assigned" className="gap-2">
            <Gavel className="h-4 w-4" />
            Assigned to Me ({assigned.length})
          </TabsTrigger>
        </TabsList>

        {/* Posted Projects */}
        <TabsContent value="posted" className="mt-6">
          {loading ? (
            <SkeletonGrid />
          ) : posted.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posted.map((project) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                        {project.title}
                      </h3>
                      <Badge variant="outline" className={`shrink-0 text-[10px] capitalize ${statusStyles[project.status]}`}>
                        {statusLabel[project.status] ?? project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {project.budget.min.toLocaleString("en-IN")} – {project.budget.max.toLocaleString("en-IN")}
                      </span>
                      <span>{project.bids} bids</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No projects posted yet"
              description="Post your first project and start receiving bids from talented freelancers."
              showCTA
            />
          )}
        </TabsContent>

        {/* Assigned Projects (bid accepted) */}
        <TabsContent value="assigned" className="mt-6">
          {loading ? (
            <SkeletonGrid />
          ) : assigned.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {assigned.map((project) => (
                <AssignedProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Gavel}
              title="No assigned projects yet"
              description="When a client accepts your bid, the project will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyProjects;
