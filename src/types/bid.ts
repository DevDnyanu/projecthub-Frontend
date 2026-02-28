import { User } from "./project";

export interface Bid {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancer?: User;
  amount: number;
  deliveryDays: number;
  coverLetter: string;
  skills: string[];
  experienceLevel: string;
  yearsOfExperience: number;
  bio: string;
  portfolioUrl: string;
  linkedinUrl: string;
  availability: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}
