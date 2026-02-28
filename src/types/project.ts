export interface User {
  id: string;
  name: string;
  avatar: string;
  role: "buyer" | "seller" | "admin";
  rating: number;
  completedProjects: number;
  linkedinUrl?: string;
  skills?: string[];
  experienceLevel?: string;
  yearsOfExperience?: number;
  bio?: string;
  portfolioUrl?: string;
  availability?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: { min: number; max: number };
  status: "pending" | "open" | "in-progress" | "completed" | "cancelled";
  seller: User;
  skills: string[];
  bids: number;
  createdAt: string;
  deadline: string;
  deliveryDays?: number;
  projectType?: string;
  posterSkills?: string[];
  companyName?: string;
  location?: string;
  remoteFriendly?: boolean;
  urgencyLevel?: string;
  attachments?: string[];
  workSubmitted?: boolean;
  adminConfirmed?: boolean;
  ownerConfirmed?: boolean;
}
