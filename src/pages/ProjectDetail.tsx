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
import EscrowStatusCard from "@/components/EscrowStatusCard";
import ChatModal from "@/components/ChatModal";
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

/* Animated hero gradient per status */
const statusHero: Record<string, { gradient: string; dot: string; glow: string }> = {
  open:          { gradient: "from-emerald-500/25 via-emerald-400/10 to-transparent", dot: "bg-emerald-500 shadow-emerald-500/60", glow: "shadow-emerald-500/10" },
  "in-progress": { gradient: "from-amber-500/25 via-amber-400/10 to-transparent",   dot: "bg-amber-500  shadow-amber-500/60",  glow: "shadow-amber-500/10"  },
  completed:     { gradient: "from-slate-500/20 via-slate-400/8 to-transparent",    dot: "bg-slate-400",                        glow: "shadow-slate-500/10"  },
  cancelled:     { gradient: "from-red-500/20 via-red-400/8 to-transparent",        dot: "bg-red-500    shadow-red-500/60",     glow: "shadow-red-500/10"    },
  pending:       { gradient: "from-primary/25 via-primary/10 to-transparent",       dot: "bg-primary    shadow-primary/60",     glow: "shadow-primary/10"    },
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

/* ── Bid Card ── */
const BidCard = ({
  bid,
  isOwner,
  projectStatus,
  updatingBid,
  onAction,
  onMessage,
}: {
  bid: ApiBid;
  isOwner: boolean;
  projectStatus: string;
  updatingBid: string | null;
  onAction: (id: string, status: "accepted" | "rejected") => void;
  onMessage: (bidder: ApiBid["bidder"]) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_LEN = 200;
  const isLong = bid.coverLetter && bid.coverLetter.length > MAX_LEN;
  const displayText =
    !expanded && isLong
      ? bid.coverLetter.slice(0, MAX_LEN) + "…"
      : bid.coverLetter;

  const isAccepted = bid.status === "accepted";
  const isRejected = bid.status === "rejected";

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-md ${
      isAccepted
        ? "border-green-500/40 shadow-green-500/5 shadow-sm"
        : isRejected
        ? "border-border opacity-60"
        : "border-border hover:border-primary/30"
    }`}>
      {/* Accepted banner */}
      {isAccepted && (
        <div className="flex items-center gap-2 bg-green-500/10 border-b border-green-500/20 px-4 py-2">
          <BadgeCheck className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Accepted Proposal</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 shrink-0 rounded-xl border-2 border-border">
            <AvatarImage src={bid.bidder.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-xl text-base">
              {bid.bidder.name[0]}
            </AvatarFallback>
          </Avatar>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top row: name + bid amount */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-bold text-foreground text-sm leading-tight">{bid.bidder.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <StarRating rating={bid.bidder.rating} />
                  {bid.bidder.experienceLevel && (
                    <span className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5">
                      {bid.bidder.experienceLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Bid amount pill */}
              <div className="shrink-0 text-right">
                <div className="inline-flex items-baseline gap-0.5 rounded-xl bg-primary/8 border border-primary/15 px-3 py-1.5">
                  <span className="text-[11px] text-primary font-semibold">₹</span>
                  <span className="text-base font-extrabold text-primary leading-none">
                    {bid.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  in {bid.deliveryDays} days
                </p>
              </div>
            </div>

            {/* Cover letter */}
            {bid.coverLetter && (
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-2.5">
                {displayText}
                {isLong && (
                  <button
                    onClick={() => setExpanded((p) => !p)}
                    className="ml-1 text-primary hover:underline text-xs font-semibold"
                  >
                    {expanded ? "show less" : "read more"}
                  </button>
                )}
              </p>
            )}

            {/* Skills */}
            {bid.bidder.skills && bid.bidder.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2.5">
                {bid.bidder.skills.slice(0, 5).map((s) => (
                  <span key={s} className="rounded-md bg-secondary border border-border px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Footer: stats + actions */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-2.5 border-t border-border/50">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Gavel className="h-3 w-3" />
                  {bid.bidder.completedProjects} completed
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

              {/* Message button — always visible */}
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-7 text-[11px] px-3 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => onMessage(bid.bidder)}
              >
                <MessageCircle className="h-3 w-3" /> Message
              </Button>

              {/* Owner actions */}
              {isOwner && bid.status === "pending" && projectStatus === "open" && (
                <div className="flex items-center gap-2">
                  {bid.adminStatus === "pending_admin" ? (
                    <div className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-2.5 py-1 text-yellow-600 text-[10px] font-medium">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      Awaiting admin
                    </div>
                  ) : bid.adminStatus === "rejected_admin" ? (
                    <div className="rounded-lg bg-destructive/10 px-2.5 py-1 text-destructive text-[10px] font-medium">
                      Admin rejected
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="gap-1 bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] px-3"
                        disabled={updatingBid === bid._id}
                        onClick={() => onAction(bid._id, "accepted")}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {updatingBid === bid._id ? "…" : "Accept"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:bg-destructive/10 border-destructive/30 h-7 text-[11px] px-3"
                        disabled={updatingBid === bid._id}
                        onClick={() => onAction(bid._id, "rejected")}
                      >
                        <ThumbsDown className="h-3 w-3" />
                        {updatingBid === bid._id ? "…" : "Reject"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
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
  const [bidSort, setBidSort] = useState<"newest" | "lowest" | "highest_rated">("newest");
  const [bookmarked, setBookmarked] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<{ stars: number; comment: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [acceptedBidForPayment, setAcceptedBidForPayment] = useState<ApiBid | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [chatUser, setChatUser] = useState<ApiBid["bidder"] | null>(null);

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
          description: "Funds locked in escrow. Project is now in progress.",
        });
      } else {
        toast({
          title: "Bid rejected",
          description: "The expert has been notified.",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Try again.";
      const isWalletError = msg.toLowerCase().includes("wallet") || msg.toLowerCase().includes("insufficient");
      if (isWalletError) {
        toast({
          title: "Insufficient Wallet Balance",
          description: (
            <span>
              {msg}{" "}
              <a href="/wallet" className="underline font-semibold text-white">
                Add Funds →
              </a>
            </span>
          ) as unknown as string,
          variant: "destructive",
        });
      } else {
        toast({ title: "Failed", description: msg, variant: "destructive" });
      }
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
        description: "Expert has been notified.",
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
        <div className="skeleton-shimmer h-4 w-20 rounded-md" />
        <div className="skeleton-shimmer h-7 w-2/3 rounded-md" />
        <div className="flex gap-3">
          <div className="skeleton-shimmer h-8 w-20 rounded-full" />
          <div className="skeleton-shimmer h-8 w-16 rounded-full" />
        </div>
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border pb-0">
          <div className="skeleton-shimmer h-9 w-20 rounded-t-lg" />
          <div className="skeleton-shimmer h-9 w-28 rounded-t-lg" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {/* Details card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="skeleton-shimmer h-5 w-32 rounded-md" />
              <div className="skeleton-shimmer h-3 w-full rounded-md" />
              <div className="skeleton-shimmer h-3 w-5/6 rounded-md" />
              <div className="skeleton-shimmer h-3 w-4/6 rounded-md" />
            </div>
            {/* Skills card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="skeleton-shimmer h-4 w-28 rounded-md" />
              <div className="flex gap-2 flex-wrap">
                {[80,60,90,70,50].map((w, i) => (
                  <div key={i} className={`skeleton-shimmer h-6 rounded-full`} style={{ width: w }} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {/* Sidebar action card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="skeleton-shimmer h-12 w-full rounded-xl" />
              <div className="skeleton-shimmer h-4 w-3/4 rounded-md" />
              <div className="skeleton-shimmer h-4 w-2/4 rounded-md" />
              <div className="skeleton-shimmer h-10 w-full rounded-lg" />
            </div>
            {/* Client card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="skeleton-shimmer h-11 w-11 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="skeleton-shimmer h-4 w-24 rounded-md" />
                  <div className="skeleton-shimmer h-3 w-16 rounded-md" />
                </div>
              </div>
              <div className="skeleton-shimmer h-3 w-full rounded-md" />
              <div className="skeleton-shimmer h-3 w-2/3 rounded-md" />
            </div>
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

  const hero = statusHero[project.status] ?? statusHero.open;

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

      {/* ── Animated status hero strip ── */}
      <div className={`relative mb-5 overflow-hidden rounded-2xl border border-border bg-gradient-to-r ${hero.gradient} hero-gradient shadow-lg ${hero.glow}`}>
        {/* floating dots decoration */}
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-30">
          {[20,14,10,7].map((size, i) => (
            <div key={i} className={`rounded-full ${hero.dot}`} style={{ width: size, height: size, animationDelay: `${i*0.4}s` }} />
          ))}
        </div>
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <div className={`h-3 w-3 rounded-full shadow-md animate-pulse ${hero.dot}`} />
          <span className="font-heading text-sm font-bold text-foreground capitalize">
            {project.status.replace("-", " ")} Project
          </span>
          {project.urgencyLevel && project.urgencyLevel !== "Normal" && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/25 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">
              <Zap className="h-3 w-3" /> {project.urgencyLevel}
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            Posted {project.createdAt}
          </span>
        </div>
      </div>

      {/* ── Top header ── */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <Badge
                variant="outline"
                className={`capitalize text-[11px] font-bold tracking-wide px-2.5 py-0.5 ${statusStyles[project.status]}`}
              >
                {project.status.replace("-", " ")}
              </Badge>
              {project.urgencyLevel && project.urgencyLevel !== "Normal" && (
                <Badge
                  variant="outline"
                  className={`text-[11px] font-bold ${
                    project.urgencyLevel === "Critical"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                  }`}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {project.urgencyLevel}
                </Badge>
              )}
              {project.remoteFriendly && (
                <Badge variant="outline" className="text-[11px] font-semibold bg-primary/8 text-primary/80 border-primary/25">
                  Remote OK
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-snug mb-2">
              {project.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {project.location}
                </span>
              )}
              {project.projectType && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {project.projectType}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> Posted {project.createdAt}
              </span>
            </div>
          </div>

          {/* Right: stats + actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Bid stats */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-2.5">
              <div className="text-center">
                <p className="font-heading text-lg font-extrabold text-foreground leading-none">{project.bids}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Proposals</p>
              </div>
              <div className="w-px h-7 bg-border" />
              <div className="text-center">
                <p className="font-heading text-lg font-extrabold text-foreground leading-none">
                  {avgBid > 0 ? `₹${avgBid.toLocaleString("en-IN")}` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Avg bid</p>
              </div>
            </div>

            {/* Icon actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon"
                className={`h-9 w-9 rounded-xl ${bookmarked ? "text-primary bg-primary/8" : "text-muted-foreground"}`}
                onClick={() => setBookmarked((p) => !p)}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary" : ""}`} />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {(["details", "proposals"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2.5 text-sm font-semibold transition-colors capitalize border-b-2 -mb-px rounded-t-sm ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab === "proposals" ? (
              <span className="flex items-center gap-1.5">
                Proposals
                {bids.length > 0 && (
                  <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] ${
                    activeTab === "proposals"
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {bids.length}
                  </span>
                )}
              </span>
            ) : (
              "Details"
            )}
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
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              {/* Budget hero */}
              <div className="bg-gradient-to-br from-primary/8 to-primary/4 border-b border-border/60 px-5 py-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Budget</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-primary font-bold">₹</span>
                  <span className="font-heading text-2xl font-extrabold text-primary leading-none">
                    {project.budget.min.toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground mx-1 text-sm">–</span>
                  <span className="font-heading text-2xl font-extrabold text-primary leading-none">
                    {project.budget.max.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {project.projectType && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</p>
                      <p className="font-semibold text-sm text-foreground">{project.projectType}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Proposals</p>
                    <p className="font-semibold text-sm text-foreground">{project.bids} bids</p>
                  </div>
                </div>

                {project.deadline && (
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Deadline</p>
                      <p className="font-semibold text-sm text-foreground">{project.deadline}</p>
                    </div>
                  </div>
                )}

                {!isOwner && (
                <div className="pt-1">
                  {project.status === "open" ? (
                    alreadyBid ? (
                      <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 p-3 text-primary">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-semibold">Proposal submitted</span>
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-2 cta-pulse" size="lg"
                        onClick={() => {
                          if (!user) { navigate("/login"); return; }
                          setShowBidModal(true);
                        }}
                      >
                        <Gavel className="h-4 w-4" />
                        Place a Bid
                      </Button>
                    )
                  ) : project.status === "in-progress" && myBid?.status === "rejected" ? (
                    <div className="flex items-center gap-2 rounded-xl bg-muted border border-border p-3 text-muted-foreground">
                      <ThumbsDown className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Project Awarded</p>
                        <p className="text-xs">This project was awarded to another freelancer.</p>
                      </div>
                    </div>
                  ) : project.status === "in-progress" && !myBid ? (
                    <div className="flex items-center gap-2 rounded-xl bg-muted border border-border p-3 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      <p className="text-sm">This project is no longer accepting proposals.</p>
                    </div>
                  ) : null}
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

              {/* Escrow status — visible to owner and accepted freelancer */}
              {(isOwner || (!isOwner && myBid?.status === "accepted")) && ["in-progress", "completed"].includes(project.status) && (
                <div className="pt-1">
                  <EscrowStatusCard
                    projectId={project.id}
                    isClient={isOwner}
                    isFreelancer={!isOwner && myBid?.status === "accepted"}
                  />
                </div>
              )}

              {/* Owner: Pay Now — both confirmed, project completed */}
              {isOwner && project.status === "completed" && !paymentDone && bids.some((b) => b.status === "accepted") && (
                <div className="pt-1 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-yellow-600 text-xs">
                    <CreditCard className="h-4 w-4 shrink-0" />
                    Project complete — please release payment to expert
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
                      Rate the Expert
                    </Button>
                  )}
                </>
              )}
              </div>{/* /p-5 space-y-3 */}
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

              {/* Chat with Client button — visible to experts only */}
              {!isOwner && user && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    onClick={() =>
                      setChatUser({
                        _id: project.seller.id,
                        name: project.seller.name,
                        avatar: project.seller.avatar,
                        rating: project.seller.rating,
                        completedProjects: project.seller.completedProjects,
                      })
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Client
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Proposals Tab ── */}
      {activeTab === "proposals" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bid list */}
          <div className="lg:col-span-2 space-y-4">

            {/* Header row */}
            {bids.length > 0 && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-semibold text-foreground">
                  {bids.length} Proposal{bids.length !== 1 ? "s" : ""}
                </p>
                <select
                  value={bidSort}
                  onChange={(e) => setBidSort(e.target.value as typeof bidSort)}
                  className="text-[13px] rounded-lg border border-border bg-card text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="lowest">Lowest Price</option>
                  <option value="highest_rated">Highest Rated</option>
                </select>
              </div>
            )}

            {bids.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Gavel className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No proposals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.status === "open" ? "Be the first to bid on this project." : "This project is no longer accepting bids."}
                </p>
                {project.status === "open" && !isOwner && !alreadyBid && (
                  <Button
                    className="mt-4 gap-2 cta-pulse"
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
              [...bids]
                .sort((a, b) => {
                  if (bidSort === "lowest") return a.amount - b.amount;
                  if (bidSort === "highest_rated") return (b.bidder.rating ?? 0) - (a.bidder.rating ?? 0);
                  return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
                })
                .map((bid, i) => (
                <div key={bid._id} className="bid-enter" style={{ animationDelay: `${i * 0.07}s` }}>
                  <BidCard
                    bid={bid}
                    isOwner={isOwner}
                    projectStatus={project.status}
                    updatingBid={updatingBid}
                    onAction={handleBidAction}
                    onMessage={(bidder) => setChatUser(bidder)}
                  />
                </div>
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
                    <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 p-3 text-primary text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Proposal submitted
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2 cta-pulse"
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
        freelancerName={bids.find((b) => b.status === "accepted")?.bidder.name ?? "Expert"}
        onRated={(stars, comment) => { setHasRated(true); setSubmittedRating({ stars, comment }); fetchAll(); }}
      />

      {/* Chat Modal */}
      {chatUser && (
        <ChatModal
          otherUser={chatUser}
          projectId={id}
          projectTitle={project?.title}
          onClose={() => setChatUser(null)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
