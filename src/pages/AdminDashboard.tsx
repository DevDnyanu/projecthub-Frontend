import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useProjectStore } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Check, X, Eye, LayoutDashboard, FolderOpen, Users,
  Settings, LogOut, BarChart3, Shield, Bell, CheckCircle2,
  TrendingUp, DollarSign, Gavel, Clock3, CreditCard, ArrowRight, IndianRupee,
  Clock, CheckCheck, AlertCircle, Wallet, LockKeyhole, ArrowDownCircle, ArrowUpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const statusStyles: Record<string, string> = {
  pending:      "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  open:         "bg-success/10 text-success border-success/20",
  "in-progress":"bg-warning/10 text-warning border-warning/20",
  completed:    "bg-muted text-muted-foreground border-border",
  cancelled:    "bg-destructive/10 text-destructive border-destructive/20",
};

const PIE_COLORS = [
  "hsl(220, 80%, 50%)",
  "hsl(350, 80%, 56%)",
  "hsl(152, 60%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(190, 70%, 45%)",
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview",      id: "overview"       },
  { icon: FolderOpen,      label: "Projects",      id: "projects"       },
  { icon: Gavel,           label: "Bids",          id: "bids"           },
  { icon: CreditCard,      label: "Payments",      id: "payments"       },
  { icon: Wallet,          label: "Wallets",       id: "wallets"        },
  { icon: BarChart3,       label: "Analytics",     id: "analytics"      },
  { icon: Bell,            label: "Notifications", id: "notifications"  },
];

const adminStatusStyles: Record<string, string> = {
  pending_admin:  "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved:       "bg-success/10 text-success border-success/20",
  rejected_admin: "bg-destructive/10 text-destructive border-destructive/20",
};

interface AdminStats {
  totalProjects: number;
  totalUsers: number;
  openProjects: number;
  completedProjects: number;
  totalPurchases: number;
  completionRate: number;
  totalBids: number;
  liveProjects: number;
}

interface AnalyticsData {
  barData: { month: string; projects: number }[];
  pieData: { name: string; value: number }[];
}

interface AdminBid {
  _id: string;
  amount: number;
  deliveryDays: number;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  adminStatus: "pending_admin" | "approved" | "rejected_admin";
  skills: string[];
  experienceLevel: string;
  createdAt: string;
  bidder: { _id: string; name: string; avatar?: string; rating: number };
  project: { _id: string; title: string; category: string; budget: { min: number; max: number } };
}

interface WalletUser {
  userId:         string;
  name:           string;
  email:          string;
  role:           string;
  joinedAt:       string;
  walletBalance:  number;
  totalDeposited: number;
  totalWithdrawn: number;
  escrowLocked:   number;
  txCount:        number;
}

interface WalletSummary {
  totalPlatformBalance: number;
  totalEscrowLocked:    number;
  totalDeposited:       number;
  totalWithdrawn:       number;
}

interface AdminPayment {
  _id: string;
  amount: number;
  paymentStatus: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paidAt: string;
  buyer:      { _id: string; name: string; avatar?: string; email: string };
  freelancer: { _id: string; name: string; avatar?: string; email: string };
  project:    { _id: string; title: string; category: string };
}

interface AdminProject {
  id: string;
  title: string;
  category: string;
  status: string;
  budget: { min: number; max: number };
  bidsCount: number;
  workSubmitted: boolean;
  adminConfirmed: boolean;
  ownerConfirmed: boolean;
  seller: { _id: string; name: string; avatar?: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAdminProject = (p: any): AdminProject => ({
  id:             p._id ?? p.id,
  title:          p.title,
  category:       p.category,
  status:         p.status,
  budget:         p.budget,
  bidsCount:      p.bidsCount ?? 0,
  workSubmitted:  p.workSubmitted ?? false,
  adminConfirmed: p.adminConfirmed ?? false,
  ownerConfirmed: p.ownerConfirmed ?? false,
  seller:         { _id: p.seller?._id ?? "", name: p.seller?.name ?? "", avatar: p.seller?.avatar },
});

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects: publicProjects, fetchProjects } = useProjectStore();
  const { user, logout, updateAvatar, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync activeTab when URL changes externally (e.g. Navbar notification click)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [stats,        setStats]        = useState<AdminStats | null>(null);
  const [analytics,    setAnalytics]    = useState<AnalyticsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Admin sees ALL projects (including pending); non-admin sees public list
  const [adminProjects,    setAdminProjects]    = useState<AdminProject[]>([]);
  const [loadingProjects,  setLoadingProjects]  = useState(false);
  const [bids,             setBids]             = useState<AdminBid[]>([]);
  const [loadingBids,      setLoadingBids]      = useState(false);
  const [payments,         setPayments]         = useState<AdminPayment[]>([]);
  const [loadingPayments,  setLoadingPayments]  = useState(false);

  type AdminNotif = { _id: string; type: string; message: string; read: boolean; createdAt: string; projectTitle: string; actorName: string; };
  const [adminNotifs,        setAdminNotifs]        = useState<AdminNotif[]>([]);
  const [loadingNotifs,      setLoadingNotifs]      = useState(false);

  const [walletUsers,        setWalletUsers]        = useState<WalletUser[]>([]);
  const [walletSummary,      setWalletSummary]      = useState<WalletSummary | null>(null);
  const [loadingWallets,     setLoadingWallets]     = useState(false);
  const [walletSearch,       setWalletSearch]       = useState("");

  const isAdmin = user?.is_admin === true;

  // Stats — accessible to all logged-in users
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.get<AdminStats>("/admin/stats");
      setStats(data);
    } catch {
      // silently fail
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Analytics — accessible to all logged-in users
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await api.get<AnalyticsData>("/admin/analytics");
      setAnalytics(data);
    } catch {
      // silently fail
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const data = await api.get<AdminPayment[]>("/admin/payments");
      setPayments(data);
    } catch {
      // silently fail
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  const fetchAdminBids = useCallback(async () => {
    setLoadingBids(true);
    try {
      const data = await api.get<AdminBid[]>("/admin/bids");
      setBids(data);
    } catch {
      // silently fail
    } finally {
      setLoadingBids(false);
    }
  }, []);

  // Projects list — admin only (non-admins use publicProjects from store)
  const fetchAdminProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const data = await api.get<unknown[]>("/admin/projects");
      setAdminProjects(data.map(mapAdminProject));
    } catch {
      // silently fail
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    setLoadingWallets(true);
    try {
      const data = await api.get<{ users: WalletUser[]; summary: WalletSummary }>("/admin/wallets");
      setWalletUsers(data.users);
      setWalletSummary(data.summary);
    } catch {
      // silently fail
    } finally {
      setLoadingWallets(false);
    }
  }, []);

  const fetchAdminNotifs = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const data = await api.get<AdminNotif[]>("/admin/notifications");
      setAdminNotifs(data);
    } catch { /* silently fail */ }
    finally { setLoadingNotifs(false); }
  }, []);

  const markNotifRead = async (id: string) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setAdminNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      setAdminNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (activeTab === "notifications") fetchAdminNotifs();
    if (activeTab === "wallets" && isAdmin) fetchWallets();
  }, [activeTab, fetchAdminNotifs, fetchWallets, isAdmin]);

  useEffect(() => {
    // Stats and analytics are visible to all logged-in users
    fetchStats();
    fetchAnalytics();
    // Full project list + bids (including pending) only for admins
    if (isAdmin) { fetchAdminProjects(); fetchAdminBids(); fetchPayments(); }
  }, [isAdmin, fetchStats, fetchAnalytics, fetchAdminProjects, fetchAdminBids, fetchPayments]);

  // Table data: admins see everything (pending included), others see public projects
  const tableProjects: AdminProject[] = isAdmin
    ? adminProjects
    : publicProjects.map((p) => ({
        id:             p.id,
        title:          p.title,
        category:       p.category,
        status:         p.status,
        budget:         p.budget,
        bidsCount:      typeof p.bids === "number" ? p.bids : (Array.isArray(p.bids) ? p.bids.length : 0),
        workSubmitted:  false,
        adminConfirmed: false,
        ownerConfirmed: false,
        seller:         { _id: p.seller.id, name: p.seller.name, avatar: p.seller.avatar },
      }));

  // ── Chart data derived from existing state (no extra API calls) ──
  const projectStatusData = useMemo(() => {
    const statuses = ["pending", "open", "in-progress", "completed", "cancelled"];
    return statuses
      .map((s) => ({ status: s.replace("-", " "), count: tableProjects.filter((p) => p.status === s).length }))
      .filter((d) => d.count > 0);
  }, [tableProjects]);

  const bidStatusData = useMemo(
    () => [
      { name: "Pending Review", value: bids.filter((b) => b?.adminStatus === "pending_admin").length },
      { name: "Approved",       value: bids.filter((b) => b?.adminStatus === "approved").length },
      { name: "Rejected",       value: bids.filter((b) => b?.adminStatus === "rejected_admin").length },
    ],
    [bids]
  );

  const bidsPerProjectData = useMemo(() => {
    const map: Record<string, number> = {};
    bids.forEach((b) => {
      const title = b.project?.title ?? "Unknown";
      map[title] = (map[title] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([project, count]) => ({
        project: project.length > 18 ? project.slice(0, 18) + "…" : project,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bids]);

  const monthlyRevenueData = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      if (!p.paidAt) return;
      const d = new Date(p.paidAt);
      const month = d.toLocaleString("en-US", { month: "short" }) + " '" + d.getFullYear().toString().slice(2);
      map[month] = (map[month] ?? 0) + p.amount;
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  }, [payments]);

  const paymentCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      const cat = p.project?.category ?? "Other";
      map[cat] = (map[cat] ?? 0) + p.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [payments]);

  const handleApprove = async (id: string, title: string) => {
    try {
      await api.patch(`/admin/projects/${id}/approve`);
      toast({ title: "Project approved", description: `"${title}" is now live.` });
      fetchAdminProjects();
      fetchStats();
      fetchProjects();
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  };

  const handleReject = async (id: string, title: string) => {
    try {
      await api.patch(`/admin/projects/${id}/reject`);
      toast({ title: "Project rejected", description: `"${title}" has been cancelled.` });
      fetchAdminProjects();
      fetchStats();
      fetchProjects();
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  };

  const handleComplete = async (id: string, title: string) => {
    try {
      await api.patch(`/admin/projects/${id}/complete`);
      toast({ title: "Completion confirmed", description: `Admin confirmation saved for "${title}".` });
      fetchAdminProjects();
      fetchStats();
      fetchProjects();
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  };

  const handleApproveBid = async (id: string) => {
    try {
      await api.patch(`/admin/bids/${id}/approve`);
      toast({ title: "Bid approved", description: "The client can now accept this bid." });
      fetchAdminBids();
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  };

  const handleRejectBid = async (id: string) => {
    try {
      await api.patch(`/admin/bids/${id}/reject`);
      toast({ title: "Bid rejected" });
      fetchAdminBids();
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Signed out", description: "See you soon!" });
    navigate("/login");
  };

  // Same stat cards for everyone
  const statCards = stats
    ? [
        { title: "Total Projects",  value: stats.totalProjects.toLocaleString(),  change: `${stats.openProjects} open`,          icon: <FolderOpen className="h-5 w-5" />,  positive: true },
        { title: "Active Users",    value: stats.totalUsers.toLocaleString(),      change: "Registered users",                    icon: <Users className="h-5 w-5" />,       positive: true },
        { title: "Total Bids",      value: stats.totalBids.toLocaleString(),       change: `${stats.completedProjects} completed`,icon: <DollarSign className="h-5 w-5" />,  positive: true },
        { title: "Completion Rate", value: `${stats.completionRate}%`,             change: "Projects completed",                  icon: <TrendingUp className="h-5 w-5" />,  positive: stats.completionRate >= 80 },
      ]
    : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar-background text-sidebar-foreground overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-sidebar-primary-foreground">
              {isAdmin ? "Admin Panel" : "Dashboard"}
            </p>
            <p className="text-xs text-sidebar-foreground/60">ProjectHub</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const pendingBids = item.id === "bids" ? bids.filter(b => b?.adminStatus === "pending_admin").length : 0;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {pendingBids > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white px-1">
                    {pendingBids}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link
            to="/settings"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">

        {/* Mobile greeting strip — above tab nav */}
        <div className="lg:hidden px-4 py-3 border-b border-border/40 bg-card flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Welcome back, <span className="text-primary">{user?.name?.split(" ")[0]}</span> 👋
            </p>
            <p className="text-xs text-muted-foreground">Here's what's happening today</p>
          </div>
          <Badge
            variant="outline"
            className={isAdmin
              ? "gap-1 text-primary border-primary/30 bg-primary/5 text-[11px]"
              : "gap-1 text-muted-foreground border-border bg-muted/40 text-[11px]"}
          >
            <Shield className="h-2.5 w-2.5" />
            {isAdmin ? "Admin" : "View only"}
          </Badge>
        </div>

        {/* Mobile Tab Navigation — only visible below lg */}
        <div className="lg:hidden sticky top-16 z-40 border-b bg-card/95 backdrop-blur overflow-x-auto">
          <div className="flex min-w-max px-2">
            {sidebarItems.map((item) => {
              const pendingBids = item.id === "bids" ? bids.filter(b => b?.adminStatus === "pending_admin").length : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === item.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                  {pendingBids > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1">
                      {pendingBids}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                {activeTab === "overview"
                  ? "Dashboard Overview"
                  : sidebarItems.find((i) => i.id === activeTab)?.label}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground hidden sm:block">
                {`Welcome back, ${user?.name}. Here's what's happening today.`}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge
                variant="outline"
                className={isAdmin
                  ? "gap-1.5 text-primary border-primary/30 bg-primary/5"
                  : "gap-1.5 text-muted-foreground border-border bg-muted/40"}
              >
                <Shield className="h-3 w-3" />
                {isAdmin ? "Admin" : "View only"}
              </Badge>
            </div>
          </div>

          {/* View-only notice for non-admins */}
          {!isAdmin && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
              <Eye className="h-5 w-5 shrink-0 text-yellow-600" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <span className="font-semibold">View only access.</span> You can browse all data but cannot approve, reject, or complete projects. Contact an admin to make changes.
              </p>
            </div>
          )}

          {/* Stat Cards */}
          {<div className="mb-8">
            {loadingStats ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                  <Card key={stat.title} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                        <p className={`mt-1 text-xs font-medium ${stat.positive ? "text-success" : "text-destructive"}`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {stat.icon}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>}

          {/* Charts — tab-specific */}
          {(activeTab === "overview" || activeTab === "projects" || activeTab === "bids" || activeTab === "payments") && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ── Left chart (2/3 width) ── */}
            <Card className="col-span-1 lg:col-span-2 p-6">

              {/* Overview: Projects Over Time */}
              {activeTab === "overview" && (
                <>
                  <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Projects Over Time</h3>
                  {analytics ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={analytics.barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="projects" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Skeleton className="h-64 w-full rounded-lg" />
                  )}
                </>
              )}

              {/* Projects: By Status */}
              {activeTab === "projects" && (
                <>
                  <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Projects by Status</h3>
                  {projectStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={projectStatusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="status" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No project data</div>
                  )}
                </>
              )}

              {/* Bids: Top Projects by Bid Count */}
              {activeTab === "bids" && (
                <>
                  <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Top Projects by Bids</h3>
                  {bidsPerProjectData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={bidsPerProjectData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                        <YAxis type="category" dataKey="project" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={110} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="count" fill="hsl(220, 80%, 50%)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No bid data yet</div>
                  )}
                </>
              )}

              {/* Payments: Monthly Revenue */}
              {activeTab === "payments" && (
                <>
                  <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Monthly Revenue</h3>
                  {monthlyRevenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                        <Bar dataKey="revenue" fill="hsl(152, 60%, 42%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No payment data yet</div>
                  )}
                </>
              )}
            </Card>

            {/* ── Right chart (1/3 width) ── */}
            <Card className="p-6">

              {/* Overview & Projects: By Category */}
              {(activeTab === "overview" || activeTab === "projects") && (
                <>
                  <h3 className="mb-4 font-heading text-base font-semibold text-foreground">By Category</h3>
                  {analytics ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={analytics.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                            {analytics.pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-2">
                        {analytics.pieData.map((item, i) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-medium text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-52 w-full rounded-lg" />
                  )}
                </>
              )}

              {/* Bids: Status Distribution */}
              {activeTab === "bids" && (
                <>
                  <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Bid Status</h3>
                  {bids.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={bidStatusData.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                            <Cell fill="hsl(38, 92%, 50%)" />
                            <Cell fill="hsl(152, 60%, 42%)" />
                            <Cell fill="hsl(350, 80%, 56%)" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-2">
                        {[
                          { name: "Pending Review", color: "hsl(38, 92%, 50%)",  value: bidStatusData[0].value },
                          { name: "Approved",       color: "hsl(152, 60%, 42%)", value: bidStatusData[1].value },
                          { name: "Rejected",       color: "hsl(350, 80%, 56%)", value: bidStatusData[2].value },
                        ].map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-medium text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">No bids yet</div>
                  )}
                </>
              )}

              {/* Payments: Revenue by Category */}
              {activeTab === "payments" && (
                <>
                  <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Revenue by Category</h3>
                  {paymentCategoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={paymentCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                            {paymentCategoryData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-2">
                        {paymentCategoryData.map((item, i) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-medium text-foreground">₹{item.value.toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">No payment data yet</div>
                  )}
                </>
              )}
            </Card>

          </div>
          )}

          {/* ── Bids Tab — admin only ── */}
          {activeTab === "bids" && isAdmin && (
            <Card className="overflow-hidden">
              <div className="border-b px-4 sm:px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground">Bid Management</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Review and approve or reject expert bids</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {bids.filter(b => b?.adminStatus === "pending_admin").length} pending
                </Badge>
              </div>

              {loadingBids ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
                </div>
              ) : bids.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Gavel className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No bids yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {bids.map((bid) => (
                    <div key={bid._id} className="px-4 sm:px-6 py-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                          <AvatarImage src={bid.bidder?.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {bid.bidder?.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground text-sm">{bid.bidder?.name ?? "Unknown"}</p>
                            <span className="text-xs text-muted-foreground">on</span>
                            <p className="text-sm text-primary font-medium truncate max-w-[160px] sm:max-w-[200px]">{bid.project?.title ?? "—"}</p>
                            <Badge variant="outline" className={`text-[10px] ${adminStatusStyles[bid.adminStatus] ?? ""}`}>
                              {bid.adminStatus === "pending_admin" ? "Pending Review"
                                : bid.adminStatus === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">₹{bid.amount?.toLocaleString("en-IN")}</span>
                            <span>{bid.deliveryDays} days</span>
                            {bid.experienceLevel && <span>{bid.experienceLevel}</span>}
                          </div>
                          {(bid.skills?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {bid.skills.slice(0, 5).map(s => (
                                <Badge key={s} variant="secondary" className="text-[10px] py-0">{s}</Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground line-clamp-2">{bid.coverLetter}</p>
                        </div>

                        {/* Desktop action buttons */}
                        {bid.adminStatus === "pending_admin" && (
                          <div className="hidden sm:flex flex-col gap-2 shrink-0">
                            <Button
                              size="sm" variant="outline"
                              className="gap-1.5 text-success hover:bg-success/10 border-success/30"
                              onClick={() => handleApproveBid(bid._id)}
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                              onClick={() => handleRejectBid(bid._id)}
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                        {bid.adminStatus !== "pending_admin" && (
                          <div className="shrink-0">
                            {bid.adminStatus === "approved"
                              ? <CheckCircle2 className="h-5 w-5 text-success" />
                              : <X className="h-5 w-5 text-destructive" />
                            }
                          </div>
                        )}
                      </div>

                      {/* Mobile action buttons — full width row below content */}
                      {bid.adminStatus === "pending_admin" && (
                        <div className="flex gap-2 mt-3 sm:hidden">
                          <Button
                            size="sm" variant="outline"
                            className="flex-1 gap-1.5 text-success hover:bg-success/10 border-success/30"
                            onClick={() => handleApproveBid(bid._id)}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                            onClick={() => handleRejectBid(bid._id)}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ── Payments Tab — admin only ── */}
          {activeTab === "payments" && isAdmin && (() => {
            const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
            return (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Card className="p-5 border-success/30 bg-success/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="mt-1 font-heading text-2xl font-bold text-success">
                          ₹{totalRevenue.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">All successful payments</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/15">
                        <IndianRupee className="h-5 w-5 text-success" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                        <p className="mt-1 font-heading text-2xl font-bold text-foreground">{payments.length}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Payments received</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Payment</p>
                        <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                          ₹{payments.length > 0 ? Math.round(totalRevenue / payments.length).toLocaleString("en-IN") : 0}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Per transaction</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Payments List */}
                <Card className="overflow-hidden">
                  <div className="border-b px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-heading text-base font-semibold text-foreground">Payment Transactions</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">All successful Razorpay payments</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                      {payments.length} paid
                    </Badge>
                  </div>

                  {loadingPayments ? (
                    <div className="space-y-3 p-4">
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-3">
                        <CreditCard className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-foreground">No payments yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Successful payments will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {payments.map((payment) => (
                        <div key={payment._id} className="px-4 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-4 hover:bg-muted/30 transition-colors">

                          {/* Success icon */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </div>

                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            {/* Amount + badge */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-heading text-lg font-bold text-foreground">
                                ₹{payment.amount.toLocaleString("en-IN")}
                              </span>
                              <Badge className="bg-success/15 text-success border-success/25 text-[10px] font-semibold">
                                Payment Successful
                              </Badge>
                            </div>

                            {/* Project title */}
                            <p className="text-sm font-medium text-foreground mb-2 truncate">
                              {payment.project?.title ?? "—"}
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                ({payment.project?.category})
                              </span>
                            </p>

                            {/* Buyer → Freelancer flow */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {/* Buyer */}
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={payment.buyer?.avatar} />
                                  <AvatarFallback className="text-[9px] bg-blue-500/15 text-blue-600 font-bold">
                                    {payment.buyer?.name?.[0] ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-xs text-muted-foreground">Client: </span>
                                  <span className="text-xs font-semibold text-foreground">{payment.buyer?.name}</span>
                                </div>
                              </div>

                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />

                              {/* Freelancer */}
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={payment.freelancer?.avatar} />
                                  <AvatarFallback className="text-[9px] bg-violet-500/15 text-violet-600 font-bold">
                                    {payment.freelancer?.name?.[0] ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-xs text-muted-foreground">Expert: </span>
                                  <span className="text-xs font-semibold text-foreground">{payment.freelancer?.name}</span>
                                </div>
                              </div>
                            </div>

                            {/* Razorpay ID + date */}
                            <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                              {payment.razorpayPaymentId && (
                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                  {payment.razorpayPaymentId}
                                </span>
                              )}
                              {payment.paidAt && (
                                <span className="flex items-center gap-1">
                                  <Clock3 className="h-3 w-3" />
                                  {new Date(payment.paidAt).toLocaleString("en-IN", {
                                    day: "2-digit", month: "short", year: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right amount badge */}
                          <div className="shrink-0 text-right hidden sm:block">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-success/10 border border-success/20 px-3 py-1.5">
                              <IndianRupee className="h-3.5 w-3.5 text-success" />
                              <span className="font-bold text-sm text-success">
                                {payment.amount.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">Released</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            );
          })()}

          {/* ── Wallets Tab — admin only ── */}
          {activeTab === "wallets" && isAdmin && (
            <div className="space-y-6">
              {/* Summary Cards */}
              {walletSummary && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Card className="p-5 border-primary/30 bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Platform Balance</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="font-heading text-2xl font-bold text-primary">₹{walletSummary.totalPlatformBalance.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Total in all wallets</p>
                  </Card>
                  <Card className="p-5 border-yellow-500/30 bg-yellow-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Escrow Locked</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/15">
                        <LockKeyhole className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                    <p className="font-heading text-2xl font-bold text-yellow-500">₹{walletSummary.totalEscrowLocked.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">In active escrows</p>
                  </Card>
                  <Card className="p-5 border-success/30 bg-success/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Total Deposited</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15">
                        <ArrowDownCircle className="h-4 w-4 text-success" />
                      </div>
                    </div>
                    <p className="font-heading text-2xl font-bold text-success">₹{walletSummary.totalDeposited.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Via Razorpay</p>
                  </Card>
                  <Card className="p-5 border-destructive/30 bg-destructive/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Total Withdrawn</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15">
                        <ArrowUpCircle className="h-4 w-4 text-destructive" />
                      </div>
                    </div>
                    <p className="font-heading text-2xl font-bold text-destructive">₹{walletSummary.totalWithdrawn.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">By experts</p>
                  </Card>
                </div>
              )}

              {/* Users Wallet Table */}
              <Card className="overflow-hidden">
                <div className="border-b px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div>
                    <h2 className="font-heading text-base font-semibold text-foreground">User Wallets</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Balance & transaction summary per user</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={walletSearch}
                    onChange={(e) => setWalletSearch(e.target.value)}
                    className="w-full sm:w-56 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                  />
                </div>

                {loadingWallets ? (
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : walletUsers.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-medium text-foreground">No wallet data found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[11px] uppercase tracking-wider">
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Wallet Balance</TableHead>
                          <TableHead className="text-right">Deposited</TableHead>
                          <TableHead className="text-right">Withdrawn</TableHead>
                          <TableHead className="text-right">Escrow Locked</TableHead>
                          <TableHead className="text-right">Tx Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {walletUsers
                          .filter((u) =>
                            u.name.toLowerCase().includes(walletSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(walletSearch.toLowerCase())
                          )
                          .sort((a, b) => b.walletBalance - a.walletBalance)
                          .map((u) => (
                            <TableRow key={u.userId} className="hover:bg-secondary/40 transition-colors">
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-sm text-foreground">{u.name}</p>
                                  <p className="text-[11px] text-muted-foreground">{u.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-bold text-sm ${u.walletBalance > 0 ? "text-primary" : "text-muted-foreground"}`}>
                                  ₹{u.walletBalance.toLocaleString("en-IN")}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm text-success font-medium">₹{u.totalDeposited.toLocaleString("en-IN")}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm text-destructive font-medium">₹{u.totalWithdrawn.toLocaleString("en-IN")}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm text-yellow-500 font-medium">₹{u.escrowLocked.toLocaleString("en-IN")}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm text-muted-foreground">{u.txCount}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Projects Table — same for everyone, actions admin-only */}
          {(activeTab === "overview" || activeTab === "projects") && (
          <Card className="overflow-hidden">
            <div className="border-b px-4 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  All Projects
                </h2>
                {!isAdmin && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View only — contact an admin to approve or reject projects
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">{tableProjects.length} total</Badge>
            </div>

            <div className="overflow-x-auto">
              {loadingProjects && isAdmin ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableProjects.map((project) => {
                      const initials = project.seller.name.split(" ").map((n) => n[0]).join("");
                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{project.title}</p>
                              <p className="text-xs text-muted-foreground">{project.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={project.seller.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{project.seller.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className={statusStyles[project.status] ?? ""}>
                                {project.status.replace("-", " ")}
                              </Badge>
                              {project.workSubmitted && project.status === "in-progress" && !project.adminConfirmed && (
                                <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5 w-fit">
                                  Confirm Needed
                                </span>
                              )}
                              {project.adminConfirmed && project.status === "in-progress" && (
                                <span className="text-[10px] font-semibold text-green-600 bg-green-500/10 rounded px-1.5 py-0.5 w-fit">
                                  Admin ✓ {project.ownerConfirmed ? "· Client ✓" : "· Client pending"}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            ₹{project.budget.min.toLocaleString("en-IN")} –{" "}
                            ₹{project.budget.max.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-sm">{project.bidsCount}</TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* View button — everyone */}
                              <Link to={`/project/${project.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>

                              {/* Action buttons — admin only */}
                              {isAdmin && project.status === "pending" && (
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-8 w-8 text-success hover:text-success"
                                  title="Approve"
                                  onClick={() => handleApprove(project.id, project.title)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {isAdmin && project.status === "in-progress" && project.workSubmitted && !project.adminConfirmed && (
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-8 w-8 text-primary hover:text-primary"
                                  title="Confirm Completion"
                                  onClick={() => handleComplete(project.id, project.title)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              {isAdmin && project.status !== "cancelled" && project.status !== "completed" && (
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  title="Reject"
                                  onClick={() => handleReject(project.id, project.title)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
          )} {/* end projects table conditional */}

          {/* ── Notifications Tab ── */}
          {activeTab === "notifications" && (() => {
            const unread = adminNotifs.filter(n => !n.read);
            const read   = adminNotifs.filter(n => n.read);
            const notifIcon = (type: string) => {
              if (type === "new_project") return <FolderOpen className="h-4 w-4 text-blue-500" />;
              if (type === "new_bid")     return <Gavel className="h-4 w-4 text-yellow-500" />;
              return <Bell className="h-4 w-4 text-primary" />;
            };
            const notifColor = (type: string) => {
              if (type === "new_project") return "border-blue-500/20 bg-blue-500/5";
              if (type === "new_bid")     return "border-yellow-500/20 bg-yellow-500/5";
              return "border-primary/20 bg-primary/5";
            };

            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Notifications</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {unread.length} unread · {adminNotifs.length} total
                    </p>
                  </div>
                  {unread.length > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Card className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-foreground leading-none">{unread.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Unread</p>
                    </div>
                  </Card>
                  <Card className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-foreground leading-none">{read.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Read</p>
                    </div>
                  </Card>
                  <Card className="p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-foreground leading-none">{adminNotifs.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Total</p>
                    </div>
                  </Card>
                </div>

                {/* Notification list */}
                <Card className="overflow-hidden">
                  <div className="border-b px-4 sm:px-6 py-3.5 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm text-foreground">All Notifications</p>
                    {unread.length > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                        {unread.length}
                      </span>
                    )}
                  </div>

                  {loadingNotifs ? (
                    <div className="space-y-3 p-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                            <div className="h-2.5 bg-muted rounded animate-pulse w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : adminNotifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="h-7 w-7 text-green-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">All caught up!</p>
                        <p className="text-sm text-muted-foreground mt-0.5">No notifications yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {/* Unread first */}
                      {unread.length > 0 && (
                        <div className="px-4 sm:px-6 py-2 bg-muted/20">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unread ({unread.length})</p>
                        </div>
                      )}
                      {unread.map(n => (
                        <div key={n._id}
                          className="flex items-start gap-3 px-4 sm:px-6 py-4 bg-primary/[0.02] hover:bg-secondary/40 transition-colors">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${notifColor(n.type)} relative`}>
                            {notifIcon(n.type)}
                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-snug">{n.message}</p>
                            {n.projectTitle && (
                              <p className="text-xs text-primary mt-0.5 font-medium truncate">{n.projectTitle}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <button
                            onClick={() => markNotifRead(n._id)}
                            className="shrink-0 flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                          >
                            <CheckCheck className="h-3 w-3" /> Read
                          </button>
                        </div>
                      ))}

                      {/* Read notifications */}
                      {read.length > 0 && (
                        <div className="px-4 sm:px-6 py-2 bg-muted/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Read ({read.length})</p>
                        </div>
                      )}
                      {read.map(n => (
                        <div key={n._id}
                          className="flex items-start gap-3 px-4 sm:px-6 py-4 opacity-60 hover:opacity-80 transition-opacity">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${notifColor(n.type)}`}>
                            {notifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-snug">{n.message}</p>
                            {n.projectTitle && (
                              <p className="text-xs text-primary mt-0.5 font-medium truncate">{n.projectTitle}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <span className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-green-500" /> Seen
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            );
          })()}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
