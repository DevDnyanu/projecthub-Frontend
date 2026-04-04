import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Star, Briefcase, Linkedin, Shield, User,
  CheckCircle2, Globe, Clock, TrendingUp, Zap, MapPin,
  ExternalLink,
} from "lucide-react";

interface UserProfileData {
  _id: string;
  name: string;
  avatar: string;
  rating: number;
  ratingCount: number;
  completedProjects: number;
  role: string;
  linkedinUrl?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: string;
  yearsOfExperience?: number;
  portfolioUrl?: string;
  availability?: string;
  createdAt?: string;
}

const AVAILABILITY_COLOR: Record<string, string> = {
  "Full-Time":     "bg-green-500/10 text-green-500 border-green-500/20",
  "Part-Time":     "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Weekends Only": "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

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
        <div className="h-48 bg-muted/40 animate-pulse" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
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
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  const availabilityClass = profile.availability
    ? AVAILABILITY_COLOR[profile.availability] ?? "bg-muted text-muted-foreground border-border"
    : "";

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero banner ── */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-900 via-primary/70 to-slate-800">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 15% 60%, hsl(var(--primary)) 0%, transparent 55%),
            radial-gradient(circle at 85% 25%, #7c3aed 0%, transparent 50%)
          `,
          opacity: 0.18,
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

      {/* ── Content ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left sidebar card ── */}
          <div className="flex flex-col gap-5">

            {/* Identity card */}
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">
              <div className="flex flex-col items-center text-center px-6 pt-6 pb-5">
                {/* Avatar */}
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 ring-4 ring-card shadow-xl">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-white text-xl font-extrabold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card bg-emerald-500" />
                </div>

                {/* Name */}
                <h1 className="font-heading text-xl font-extrabold text-foreground tracking-tight leading-tight">
                  {profile.name}
                </h1>

                {/* Role badge */}
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={`gap-1.5 px-3 py-0.5 text-[11px] font-semibold ${
                      isAdmin
                        ? "border-primary/30 bg-primary/8 text-primary"
                        : "border-border bg-secondary text-foreground"
                    }`}
                  >
                    {isAdmin
                      ? <><Shield className="h-3 w-3" /> Admin</>
                      : <><User className="h-3 w-3" /> Expert</>
                    }
                  </Badge>
                </div>

                {/* Verified */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Member
                </div>

                {/* Availability */}
                {profile.availability && (
                  <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${availabilityClass}`}>
                    <Zap className="h-3 w-3" />
                    {profile.availability}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
                <div className="flex flex-col items-center justify-center gap-1 bg-card px-4 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 mb-0.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-lg font-extrabold text-foreground leading-none">
                    {profile.rating > 0 ? profile.rating.toFixed(1) : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {profile.ratingCount ? `${profile.ratingCount} reviews` : "Rating"}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 bg-card px-4 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mb-0.5">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-lg font-extrabold text-foreground leading-none">
                    {profile.completedProjects}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Projects Done</p>
                </div>
              </div>
            </div>

            {/* Meta info card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5">
              {profile.experienceLevel && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Experience Level</p>
                    <p className="text-sm font-semibold text-foreground">{profile.experienceLevel}</p>
                  </div>
                </div>
              )}

              {(profile.yearsOfExperience ?? 0) > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Years of Experience</p>
                    <p className="text-sm font-semibold text-foreground">
                      {profile.yearsOfExperience} year{profile.yearsOfExperience !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              )}

              {memberSince && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Member Since</p>
                    <p className="text-sm font-semibold text-foreground">{memberSince}</p>
                  </div>
                </div>
              )}
            </div>

            {/* External links */}
            {(profile.linkedinUrl || profile.portfolioUrl) && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Links</p>
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-2.5 text-sm font-semibold text-blue-500 hover:bg-blue-500/15 hover:border-blue-500/35 transition-all duration-200"
                  >
                    <Linkedin className="h-4 w-4 shrink-0" />
                    LinkedIn Profile
                    <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60" />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-all duration-200"
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    Portfolio / Website
                    <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-40" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ── Right main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-5 mt-0 lg:mt-0">

            {/* Bio card */}
            {profile.bio && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">About</h2>
                <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Skills card */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="rounded-lg px-3 py-1 text-xs font-medium border border-border"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats overview card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-background p-4 text-center">
                  <p className="text-2xl font-extrabold text-foreground">
                    {profile.completedProjects}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Projects Completed</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 text-center">
                  <p className="text-2xl font-extrabold text-foreground">
                    {profile.rating > 0 ? profile.rating.toFixed(1) : "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Avg. Rating</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 text-center col-span-2 sm:col-span-1">
                  <p className="text-2xl font-extrabold text-foreground">
                    {profile.ratingCount || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Total Reviews</p>
                </div>
              </div>
            </div>

            {/* Empty state if no extra info */}
            {!profile.bio && (!profile.skills || profile.skills.length === 0) && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <User className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">This expert hasn't added more details yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
