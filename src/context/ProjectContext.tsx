import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Project } from "@/types/project";
import { api } from "@/lib/api";

// ── Shared mapper: converts raw API object → frontend Project shape ────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapProject = (p: any): Project => ({
  id: p._id ?? p.id,
  title: p.title,
  description: p.description,
  category: p.category,
  skills: p.skills ?? [],
  budget: p.budget,
  status: p.status,
  bids: p.bidsCount ?? p.bids ?? 0,
  createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
  deadline: p.deadline ? new Date(p.deadline).toISOString().split("T")[0] : "",
  seller: {
    id: p.seller?._id ?? p.seller?.id ?? "",
    name: p.seller?.name ?? "",
    avatar: p.seller?.avatar ?? "",
    role: p.seller?.role ?? "seller",
    rating: p.seller?.rating ?? 0,
    completedProjects: p.seller?.completedProjects ?? 0,
    linkedinUrl: p.seller?.linkedinUrl,
  },
  subcategory: p.subcategory,
  deliveryDays: p.deliveryDays,
  projectType: p.projectType,
  companyName: p.companyName,
  posterSkills: p.posterSkills ?? [],
  location: p.location,
  remoteFriendly: p.remoteFriendly,
  urgencyLevel: p.urgencyLevel,
  attachments: p.attachments ?? [],
  workSubmitted: p.workSubmitted ?? false,
  adminConfirmed: p.adminConfirmed ?? false,
  ownerConfirmed: p.ownerConfirmed ?? false,
});

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (data: {
    title: string;
    description: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    skills: string[];
  }) => Promise<void>;
  placeBid: (
    projectId: string,
    amount: number,
    deliveryDays: number,
    message: string
  ) => Promise<void>;
  buyProject: (projectId: string) => Promise<void>;
  approveProject: (projectId: string) => Promise<void>;
  rejectProject: (projectId: string) => Promise<void>;
  completeProject: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjectStore = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjectStore must be used within ProjectProvider");
  return ctx;
};

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<unknown[]>("/projects");
      setProjects(data.map(mapProject));
    } catch {
      // silently keep existing list on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(
    async (data: {
      title: string;
      description: string;
      category: string;
      budgetMin: number;
      budgetMax: number;
      deadline: string;
      skills: string[];
    }) => {
      // Project is created with status "pending" (awaiting admin approval).
      // Do NOT add it to the public store — it must be approved before appearing on the site.
      await api.post<unknown>("/projects", data);
    },
    []
  );

  const placeBid = useCallback(
    async (projectId: string, amount: number, deliveryDays: number, message: string) => {
      await api.post(`/projects/${projectId}/bids`, { amount, deliveryDays, message });
      // Increment local bids count optimistically
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, bids: p.bids + 1 } : p))
      );
    },
    []
  );

  const buyProject = useCallback(async (projectId: string) => {
    await api.post(`/projects/${projectId}/buy`);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: "in-progress" as const } : p
      )
    );
  }, []);

  const approveProject = useCallback(async (projectId: string) => {
    await api.patch(`/admin/projects/${projectId}/approve`);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "open" as const } : p))
    );
  }, []);

  const rejectProject = useCallback(async (projectId: string) => {
    await api.patch(`/admin/projects/${projectId}/reject`);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: "cancelled" as const } : p
      )
    );
  }, []);

  const completeProject = useCallback(async (projectId: string) => {
    await api.patch(`/admin/projects/${projectId}/complete`);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: "completed" as const } : p
      )
    );
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        fetchProjects,
        addProject,
        placeBid,
        buyProject,
        approveProject,
        rejectProject,
        completeProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
