import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Briefcase, Linkedin, Shield, User } from "lucide-react";

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
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await api.get<UserProfileData>(`/users/${id}`);
        setProfile(data);
      } catch {
        // user not found
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
        <Skeleton className="h-5 w-24" />
        <Card className="p-8">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold">User not found</h2>
        <Link to="/">
          <Button variant="outline" className="mt-4">Go back</Button>
        </Link>
      </div>
    );
  }

  const initials = profile.name.split(" ").map((n) => n[0]).join("");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <Card className="p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
          <Avatar className="h-20 w-20 shrink-0">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="font-heading text-2xl font-bold text-foreground">{profile.name}</h1>
              <Badge variant="outline" className="w-fit gap-1 text-xs">
                {profile.role === "admin" ? (
                  <><Shield className="h-3 w-3" /> Admin</>
                ) : (
                  <><User className="h-3 w-3" /> Freelancer</>
                )}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold text-foreground">{profile.rating.toFixed(1)}</span>
                <span>rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span className="font-semibold text-foreground">{profile.completedProjects}</span>
                <span>projects completed</span>
              </div>
            </div>

            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                View LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
