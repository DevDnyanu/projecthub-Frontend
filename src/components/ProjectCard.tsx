import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Users, IndianRupee } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusStyles: Record<string, string> = {
  open: "bg-success/10 text-success border-success/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const ProjectCard = ({ project }: { project: Project }) => {
  const initials = project.seller.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link to={`/project/${project.id}`}>
      <Card className="card-hover group cursor-pointer overflow-hidden border bg-card p-5">
        <div className="mb-3 flex items-start justify-between">
          <Badge variant="outline" className={statusStyles[project.status]}>
            {project.status.replace("-", " ")}
          </Badge>
          <span className="text-xs text-muted-foreground">{project.createdAt}</span>
        </div>

        <h3 className="mb-2 font-heading text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {project.skills.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{project.skills.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{project.seller.name}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              {project.budget.min.toLocaleString("en-IN")}-{project.budget.max.toLocaleString("en-IN")}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.bids}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProjectCard;
