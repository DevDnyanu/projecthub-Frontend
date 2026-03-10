import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Briefcase, Linkedin, Shield, User, CheckCircle2 } from "lucide-react";

interface UserProfileData {
  _id: string;
  name: string;
  avatar: string;
  rating: number;
  completedProjects: number;
  role: string;
  linkedinUrl?: string;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<UserProfileData>(`/users/${id}`)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Skeleton hero */}
        <div className="h-48 bg-muted/40 animate-pulse" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-16 pb-12">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-28 w-28 rounded-full" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4 mt-2">
                <Skeleton className="h-16 w-28 rounded-xl" />
                <Skeleton className="h-16 w-28 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground mt-2 text-sm">This profile doesn't exist or may have been removed.</p>
        <Link to="/">
          <Button variant="outline" className="mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Button>
        </Link>
      </div>
    );
  }

  const initials = profile.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const isAdmin  = profile.role === "admin";

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero banner ── */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-900 via-primary/80 to-slate-800">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 60%),
            radial-gradient(circle at 80% 30%, #7c3aed 0%, transparent 50%)
          `,
          opacity: 0.15,
        }} />
        <div className="absolute top-4 left-4 sm:left-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-20 pb-16">
        <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">

          {/* Avatar section */}
          <div className="flex flex-col items-center text-center px-8 pt-6 pb-6">
            <div className="relative mb-4">
              <Avatar className="h-28 w-28 ring-4 ring-card shadow-xl">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-white text-2xl font-extrabold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <span className="absolute bottom-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-emerald-500" />
            </div>

            {/* Name + role */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="font-heading text-2xl font-extrabold text-foreground tracking-tight">
                {profile.name}
              </h1>
              <Badge
                variant="outline"
                className={`gap-1.5 px-3 py-1 text-[12px] font-semibold ${
                  isAdmin
                    ? "border-primary/30 bg-primary/8 text-primary"
                    : "border-border bg-secondary text-foreground"
                }`}
              >
                {isAdmin
                  ? <><Shield className="h-3 w-3" /> Admin</>
                  : <><User className="h-3 w-3" /> Freelancer</>
                }
              </Badge>
            </div>

            {/* Verified badge */}
            <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified member
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-px border-t border-border bg-border mx-0">
            <div className="flex flex-col items-center justify-center gap-1.5 bg-card px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 mb-1">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-foreground leading-none">
                {profile.rating > 0 ? profile.rating.toFixed(1) : "—"}
              </p>
              <p className="text-[12px] text-muted-foreground">Rating</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 bg-card px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-1">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-extrabold text-foreground leading-none">
                {profile.completedProjects}
              </p>
              <p className="text-[12px] text-muted-foreground">Projects Completed</p>
            </div>
          </div>

          {/* LinkedIn */}
          {profile.linkedinUrl && (
            <div className="border-t border-border px-8 py-4 text-center">
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/8 px-5 py-2.5 text-sm font-semibold text-blue-500 hover:bg-blue-500/15 hover:border-blue-500/40 transition-all duration-200"
              >
                <Linkedin className="h-4 w-4" />
                View LinkedIn Profile
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
