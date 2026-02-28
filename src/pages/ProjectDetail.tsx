import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProjectStore } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { mapProject } from "@/context/ProjectContext";
import { api } from "@/lib/api";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import BidModal from "@/components/BidModal";
import RatingModal from "@/components/RatingModal";
import PaymentModal from "@/components/PaymentModal";
import {
  ArrowLeft, IndianRupee, Users, Star,
  Send, CheckCircle2, Linkedin, Clock, Gavel,
  ThumbsUp, ThumbsDown, Paperclip, MapPin, Zap,
  Bookmark, Share2, ShieldCheck, CreditCard, CalendarDays,
  BadgeCheck, MessageCircle, Flag, PartyPopper, UploadCloud, StarIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusStyles: Record<string, string> = {
  pending:       "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  open:          "bg-green-500/10 text-green-600 border-green-500/20",
  "in-progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed:     "bg-muted text-muted-foreground border-border",
  cancelled:     "bg-destructive/10 text-destructive border-destructive/20",
};

const bidStatusStyles: Record<string, string> = {
  pending:  "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface ApiBid {
  _id: string;
  amount: number;
  deliveryDays: number;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  adminStatus: "pending_admin" | "approved" | "rejected_admin";
  createdAt: string;
  skills?: string[];
  experienceLevel?: string;
  linkedinUrl?: string;
  bidder: {
    _id: string;
    name: string;
    avatar: string;
    rating: number;
    completedProjects: number;
    skills?: string[];
    experienceLevel?: string;
    linkedinUrl?: string;
    bio?: string;
    portfolioUrl?: string;
  };
}

/* ── Star rating display ── */
const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.round(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted"
        }`}
      />
    ))}
    <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
  </div>
);

/* ── Bid Card (Freelancer.com style) ── */
const BidCard = ({
  bid,
  isOwner,
  projectStatus,
  updatingBid,
  onAction,
}: {
  bid: ApiBid;
  isOwner: boolean;
  projectStatus: string;
  updatingBid: string | null;
  onAction: (id: string, status: "accepted" | "rejected") => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_LEN = 160;
  const isLong = bid.coverLetter && bid.coverLetter.length > MAX_LEN;
  const displayText =
    !expanded && isLong
      ? bid.coverLetter.slice(0, MAX_LEN) + "…"
      : bid.coverLetter;

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
      <div className="flex gap-4">
        {/* Avatar */}
        <Avatar className="h-14 w-14 shrink-0 rounded-xl border border-border">
          <AvatarImage src={bid.bidder.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold rounded-xl">
            {bid.bidder.name[0]}
          </AvatarFallback>
        </Avatar>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Name + handle + rating */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm">{bid.bidder.name}</p>
                {bid.status === "accepted" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                    <BadgeCheck className="h-3 w-3" /> ACCEPTED
                  </span>
                )}
                {bid.status === "rejected" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    REJECTED
                  </span>
                )}
              </div>

              <StarRating rating={bid.bidder.rating} />

              {bid.bidder.experienceLevel && (
                <p className="text-xs text-muted-foreground mt-0.5">{bid.bidder.experienceLevel}</p>
              )}
            </div>

            {/* Bid amount + delivery */}
            <div className="text-right shrink-0">
              <p className="font-bold text-foreground text-base">
                ₹{bid.amount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">in {bid.deliveryDays} days</p>
            </div>
          </div>

          {/* Cover letter */}
          {bid.coverLetter && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {displayText}
              {isLong && (
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="ml-1 text-primary hover:underline text-xs font-medium"
                >
                  {expanded ? "less" : "more"}
                </button>
              )}
            </p>
          )}

          {/* Skills */}
          {bid.bidder.skills && bid.bidder.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {bid.bidder.skills.slice(0, 5).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0.5">{s}</Badge>
              ))}
            </div>
          )}

          {/* LinkedIn + completed projects */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gavel className="h-3 w-3" />
              {bid.bidder.completedProjects} projects completed
            </span>
            {bid.bidder.linkedinUrl && (
              <a
                href={bid.bidder.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                <Linkedin className="h-3 w-3" /> LinkedIn
              </a>
            )}
          </div>

          {/* Actions (owner only) */}
          {isOwner && bid.status === "pending" && projectStatus === "open" && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
              {bid.adminStatus === "pending_admin" ? (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-1.5 text-yellow-600 text-xs w-full">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Awaiting admin approval before you can accept
                </div>
              ) : bid.adminStatus === "rejected_admin" ? (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-destructive text-xs w-full">
                  Admin rejected this bid
                </div>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                    disabled={updatingBid === bid._id}
                    onClick={() => onAction(bid._id, "accepted")}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {updatingBid === bid._id ? "…" : "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30 h-8 text-xs"
                    disabled={updatingBid === bid._id}
                    onClick={() => onAction(bid._id, "rejected")}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {updatingBid === bid._id ? "…" : "Reject"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  useProjectStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<ApiBid[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [updatingBid, setUpdatingBid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "proposals">("details");
  const [bookmarked, setBookmarked] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<{ stars: number; comment: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [acceptedBidForPayment, setAcceptedBidForPayment] = useState<ApiBid | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoadingProject(true);
    try {
      const [projectData, bidsData] = await Promise.all([
        api.get<unknown>(`/projects/${id}`),
        api.get<ApiBid[]>(`/projects/${id}/bids`),
      ]);
      const mapped = mapProject(projectData);
      setProject(mapped);
      setBids(bidsData);
      // Check payment status and ratings for completed projects
      if (mapped.status === "completed") {
        try {
          const ratingCheck = await api.get<{ hasRated: boolean; rating: { stars: number; comment: string } | null }>(`/ratings/check/${id}`);
          setHasRated(ratingCheck.hasRated);
          if (ratingCheck.rating) setSubmittedRating(ratingCheck.rating);
        } catch { /* ignore */ }
        try {
          const payStatus = await api.get<{ hasPurchase: boolean; paymentStatus: string | null }>(`/payments/status/${id}`);
          setPaymentDone(payStatus.hasPurchase && payStatus.paymentStatus === "paid");
        } catch { /* ignore */ }
      }
    } catch {
      // project not found or auth error
    } finally {
      setLoadingProject(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleBidAction = async (bidId: string, status: "accepted" | "rejected") => {
    setUpdatingBid(bidId);
    try {
      await api.patch(`/bids/${bidId}`, { status });
      await fetchAll();
      if (status === "accepted") {
        toast({
          title: "Bid accepted!",
          description: "Project is now in progress. Freelancer has been notified.",
        });
      } else {
        toast({
          title: "Bid rejected",
          description: "The freelancer has been notified.",
        });
      }
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingBid(null);
    }
  };

  const handleSubmitWork = async () => {
    try {
      await api.patch(`/projects/${id}/submit-work`);
      await fetchAll();
      toast({
        title: "Project marked as complete!",
        description: "Admin has been notified to review and approve.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/projects/${id}/complete`);
      await fetchAll();
      toast({
        title: "Project marked complete!",
        description: "Freelancer has been notified.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  const handleOwnerConfirm = async () => {
    try {
      await api.patch(`/projects/${id}/confirm-complete`);
      await fetchAll();
      toast({
        title: "Completion confirmed!",
        description: "Your confirmation has been saved.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Project link copied to clipboard." });
  };

  /* ── Loading skeleton ── */
  if (loadingProject) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold">Project not found</h2>
        <Link to="/">
          <Button variant="outline" className="mt-4">Go back</Button>
        </Link>
      </div>
    );
  }

  const isOwner  = user?.id === project.seller.id;
  const initials = project.seller.name.split(" ").map((n) => n[0]).join("");
  const myBid    = bids.find((b) => b.bidder._id === user?.id);
  const alreadyBid = !!myBid;

  const avgBid =
    bids.length > 0
      ? Math.round(bids.reduce((s, b) => s + b.amount, 0) / bids.length)
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* ── Top header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-snug">
              {project.title}
            </h1>
            <Badge
              variant="outline"
              className={`shrink-0 capitalize ${statusStyles[project.status]}`}
            >
              {project.status.replace("-", " ")}
            </Badge>
            {project.urgencyLevel && project.urgencyLevel !== "Normal" && (
              <Badge
                variant="outline"
                className={`shrink-0 ${
                  project.urgencyLevel === "Critical"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                }`}
              >
                <Zap className="h-3 w-3 mr-1" />
                {project.urgencyLevel}
              </Badge>
            )}
          </div>
          {project.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {project.location}
              {project.remoteFriendly && <span className="ml-1 text-green-600">· Remote OK</span>}
            </div>
          )}
        </div>

        {/* Bids count + avg + actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="font-heading text-xl font-bold text-foreground">{project.bids}</p>
                <p className="text-[11px] text-muted-foreground">Bids</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-heading text-xl font-bold text-foreground">
                  {avgBid > 0 ? `₹${avgBid.toLocaleString("en-IN")}` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">Avg bid</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost" size="icon"
              className={`h-9 w-9 ${bookmarked ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setBookmarked((p) => !p)}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-border mb-6">
        {(["details", "proposals"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors capitalize border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "proposals"
              ? `Proposals${bids.length > 0 ? ` (${bids.length})` : ""}`
              : "Details"}
          </button>
        ))}
      </div>

      {/* ── Details Tab ── */}
      {activeTab === "details" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: project info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Project Details card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="font-heading text-base font-bold text-foreground">Project Details</h2>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground text-lg">
                    ₹{project.budget.min.toLocaleString("en-IN")} – ₹{project.budget.max.toLocaleString("en-IN")}
                  </p>
                  {project.deadline && (
                    <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      DEADLINE: {project.deadline}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Skills */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-heading text-sm font-bold text-foreground mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Attachments */}
            {project.attachments && project.attachments.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Attachments
                </h2>
                <div className="space-y-2">
                  {project.attachments.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Paperclip className="h-3 w-3" />
                      Attachment {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Your Bid summary */}
            {myBid && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <h2 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" /> Your Bid
                </h2>
                <div className="flex flex-wrap gap-6 text-sm mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-bold text-foreground">₹{myBid.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                    <p className="font-bold text-foreground">{myBid.deliveryDays} days</p>
                  </div>
                </div>
                {myBid.status === "pending" && (
                  <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-yellow-600 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Bid submitted — awaiting client response
                  </div>
                )}
                {myBid.status === "accepted" && project.status === "in-progress" && !project.workSubmitted && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-green-600 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Bid accepted — project is in progress
                  </div>
                )}
                {myBid.status === "accepted" && project.status === "in-progress" && project.workSubmitted && (
                  <div className="rounded-lg bg-blue-500/10 px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-medium">
                      <UploadCloud className="h-4 w-4 shrink-0" />
                      Work submitted — awaiting confirmations
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full ${project.adminConfirmed ? "bg-green-500" : "bg-yellow-400"}`} />
                      <span className="text-muted-foreground">Admin: {project.adminConfirmed ? "Confirmed ✓" : "Pending"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full ${project.ownerConfirmed ? "bg-green-500" : "bg-yellow-400"}`} />
                      <span className="text-muted-foreground">Client: {project.ownerConfirmed ? "Confirmed ✓" : "Pending"}</span>
                    </div>
                  </div>
                )}
                {myBid.status === "accepted" && project.status === "completed" && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-blue-600 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Project completed — awaiting client payment
                  </div>
                )}
                {myBid.status === "rejected" && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-xs">
                    Bid not selected by client
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Budget + Bid action */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-bold text-foreground">
                    ₹{project.budget.min.toLocaleString("en-IN")} – ₹{project.budget.max.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {project.projectType && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-semibold text-sm">{project.projectType}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Proposals</p>
                  <p className="font-semibold text-sm">{project.bids} bids</p>
                </div>
              </div>

              {project.deadline && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-semibold text-sm">{project.deadline}</p>
                  </div>
                </div>
              )}

              {project.status === "open" && !isOwner && (
                <div className="pt-2">
                  {alreadyBid ? (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-primary">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">Bid submitted</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2" size="lg"
                      onClick={() => {
                        if (!user) { navigate("/login"); return; }
                        setShowBidModal(true);
                      }}
                    >
                      <Gavel className="h-4 w-4" />
                      Place a Bid
                    </Button>
                  )}
                </div>
              )}

              {/* Freelancer: Mark Project Completed button — only for accepted bidder when in-progress */}
              {!isOwner && myBid?.status === "accepted" && project.status === "in-progress" && (
                <div className="pt-2">
                  {project.workSubmitted ? (
                    <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-3 text-blue-600">
                      <UploadCloud className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Completion Submitted</p>
                        <p className="text-xs opacity-80">Waiting for admin review</p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                      onClick={handleSubmitWork}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Project Completed
                    </Button>
                  )}
                </div>
              )}

              {isOwner && bids.length > 0 && (
                <Button
                  variant="outline" className="w-full gap-2" size="sm"
                  onClick={() => setActiveTab("proposals")}
                >
                  <Flag className="h-4 w-4" />
                  View Proposals ({bids.length})
                </Button>
              )}

              {/* Owner: Confirm Completion — after freelancer marks done, before both confirmations */}
              {isOwner && project.status === "in-progress" && project.workSubmitted && (
                <div className="pt-2 space-y-2">
                  {/* Confirmation status panel */}
                  <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Completion Confirmations</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`h-2 w-2 rounded-full ${project.ownerConfirmed ? "bg-green-500" : "bg-yellow-400"}`} />
                      <span className="text-muted-foreground">You (Client):</span>
                      <span className={project.ownerConfirmed ? "text-green-600 font-medium" : "text-yellow-600"}>
                        {project.ownerConfirmed ? "Confirmed ✓" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`h-2 w-2 rounded-full ${project.adminConfirmed ? "bg-green-500" : "bg-yellow-400"}`} />
                      <span className="text-muted-foreground">Admin:</span>
                      <span className={project.adminConfirmed ? "text-green-600 font-medium" : "text-yellow-600"}>
                        {project.adminConfirmed ? "Confirmed ✓" : "Pending"}
                      </span>
                    </div>
                  </div>
                  {!project.ownerConfirmed && (
                    <Button
                      className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      onClick={handleOwnerConfirm}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Completion
                    </Button>
                  )}
                </div>
              )}

              {/* Owner: Pay Now — both confirmed, project completed */}
              {isOwner && project.status === "completed" && !paymentDone && bids.some((b) => b.status === "accepted") && (
                <div className="pt-1 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-yellow-600 text-xs">
                    <CreditCard className="h-4 w-4 shrink-0" />
                    Project complete — please release payment to freelancer
                  </div>
                  <Button
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                    size="lg"
                    onClick={() => {
                      const accepted = bids.find((b) => b.status === "accepted");
                      if (accepted) { setAcceptedBidForPayment(accepted); setShowPaymentModal(true); }
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay ₹{bids.find((b) => b.status === "accepted")?.amount.toLocaleString("en-IN")}
                  </Button>
                </div>
              )}

              {/* Completed state — owner view + rate button (only after payment) */}
              {isOwner && project.status === "completed" && paymentDone && (
                <>
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-green-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">Project Completed &amp; Paid</span>
                  </div>
                  {hasRated ? (
                    <div className="rounded-lg bg-yellow-500/10 p-3">
                      <div className="flex items-center gap-2 text-yellow-600 mb-1">
                        <StarIcon className="h-5 w-5 shrink-0 fill-yellow-500" />
                        <span className="text-sm font-medium">Rating Submitted</span>
                      </div>
                      {submittedRating && (
                        <>
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < submittedRating.stars ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                              />
                            ))}
                            <span className="ml-1 text-xs font-semibold text-yellow-600">{submittedRating.stars}/5</span>
                          </div>
                          {submittedRating.comment && (
                            <p className="mt-1 text-xs text-muted-foreground italic">"{submittedRating.comment}"</p>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                      size="sm"
                      onClick={() => setShowRatingModal(true)}
                    >
                      <StarIcon className="h-4 w-4" />
                      Rate the Freelancer
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* About the Client */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                About the Client
              </h3>

              {/* Client avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-11 w-11 rounded-xl border border-border">
                  <AvatarImage src={project.seller.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground text-sm">{project.seller.name}</p>
                  <StarRating rating={project.seller.rating} />
                </div>
              </div>

              {/* Client details */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Gavel className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{project.seller.completedProjects} projects posted</span>
                </div>

                {project.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{project.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Posted {project.createdAt}</span>
                </div>

                {project.seller.linkedinUrl && (
                  <a
                    href={project.seller.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn Profile
                  </a>
                )}
              </div>

              {/* Client Verification */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Client Verification
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Identity verified
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <CreditCard className="h-4 w-4 shrink-0" />
                    Payment method added
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    Email verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Proposals Tab ── */}
      {activeTab === "proposals" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bid list */}
          <div className="lg:col-span-2 space-y-4">
            {bids.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Gavel className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No proposals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.status === "open" ? "Be the first to bid on this project." : "This project is no longer accepting bids."}
                </p>
                {project.status === "open" && !isOwner && !alreadyBid && (
                  <Button
                    className="mt-4 gap-2"
                    onClick={() => {
                      if (!user) { navigate("/login"); return; }
                      setShowBidModal(true);
                    }}
                  >
                    <Gavel className="h-4 w-4" /> Place a Bid
                  </Button>
                )}
              </div>
            ) : (
              bids.map((bid) => (
                <BidCard
                  key={bid._id}
                  bid={bid}
                  isOwner={isOwner}
                  projectStatus={project.status}
                  updatingBid={updatingBid}
                  onAction={handleBidAction}
                />
              ))
            )}
          </div>

          {/* Sidebar (compact) */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Project Summary
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-bold text-foreground text-sm">
                    ₹{project.budget.min.toLocaleString("en-IN")} – ₹{project.budget.max.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Bids</p>
                  <p className="font-bold text-foreground text-sm">{project.bids}</p>
                </div>
                {avgBid > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Average Bid</p>
                    <p className="font-bold text-foreground text-sm">₹{avgBid.toLocaleString("en-IN")}</p>
                  </div>
                )}
              </div>

              {project.status === "open" && !isOwner && (
                <div className="mt-4">
                  {alreadyBid ? (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-primary text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Bid submitted
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        if (!user) { navigate("/login"); return; }
                        setShowBidModal(true);
                      }}
                    >
                      <Gavel className="h-4 w-4" /> Place a Bid
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* About the Client (compact) */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                About the Client
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-9 w-9 rounded-lg border border-border">
                  <AvatarImage src={project.seller.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-lg text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground text-xs">{project.seller.name}</p>
                  <StarRating rating={project.seller.rating} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Identity verified
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" /> Payment verified
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      <BidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        projectId={id!}
        onBidSubmitted={fetchAll}
      />

      {/* Payment Modal */}
      {acceptedBidForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          projectId={id!}
          projectTitle={project.title}
          amount={acceptedBidForPayment.amount}
          freelancerName={acceptedBidForPayment.bidder.name}
          onPaymentSuccess={() => { setPaymentDone(true); fetchAll(); }}
          userName={user?.name}
          userEmail={user?.email}
        />
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        projectId={id!}
        freelancerName={bids.find((b) => b.status === "accepted")?.bidder.name ?? "Freelancer"}
        onRated={(stars, comment) => { setHasRated(true); setSubmittedRating({ stars, comment }); fetchAll(); }}
      />
    </div>
  );
};

export default ProjectDetail;
