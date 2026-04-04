import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Plus, User, Menu, LogOut, ChevronDown, X,
  Briefcase, FolderOpen, LayoutDashboard, Shield, Users, BarChart3,
  Gavel, Clock, CheckCircle2, CheckCircle, Flag, Settings, Wallet,
  Moon, Sun, MessageCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef, useCallback } from "react";
import ProjectAlertsPanel from "@/components/ProjectAlertsPanel";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";


const CATEGORY_NAV: { id: string; label: string; subcategories: string[] }[] = [];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const { toast } = useToast();
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [alertsBadge, setAlertsBadge] = useState(0);
  const alertsRef = useRef<HTMLDivElement>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node))
        setShowAlertsPanel(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const lastSeen = localStorage.getItem("ph_alerts_last_seen");
    if (!lastSeen) setAlertsBadge(1);
  }, [isLoggedIn]);

  type NotifType = "new_bid" | "new_project" | "bid_accepted" | "bid_rejected" | "bid_approved_admin" | "bid_rejected_admin";
  interface AppNotif { _id: string; type: NotifType; message: string; read: boolean; createdAt: string; projectTitle: string; actorName: string; }
  const [notifications, setNotifications] = useState<AppNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const endpoint = user?.is_admin ? "/admin/notifications" : "/notifications";
      const data = await api.get<AppNotif[]>(endpoint);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch { /* silently fail */ }
  }, [isLoggedIn, user?.is_admin]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchNotifications]);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get<{ balance: number }>("/wallet")
      .then((w) => setWalletBalance(w.balance))
      .catch(() => {});
    api.get<{ count: number }>("/chat/unread-count")
      .then((r) => setUnreadMsgs(r.count))
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifPanel(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotifClick = async (n: AppNotif) => {
    setShowNotifPanel(false);
    if (!n.read) {
      const endpoint = user?.is_admin ? `/admin/notifications/${n._id}/read` : `/notifications/${n._id}/read`;
      try { await api.patch(endpoint); fetchNotifications(); } catch { /* ignore */ }
    }
    navigate(user?.is_admin ? (n.type === "new_project" ? "/admin?tab=projects" : "/admin?tab=bids") : "/my-projects");
  };

  const handleMarkAllRead = async () => {
    const endpoint = user?.is_admin ? "/admin/notifications/read-all" : "/notifications/read-all";
    try { await api.patch(endpoint); fetchNotifications(); } catch { /* ignore */ }
  };

  const newProjectsCount = notifications.filter((n) => n.type === "new_project" && !n.read).length;
  const newBidsCount     = notifications.filter((n) => n.type === "new_bid" && !n.read).length;
  const readCount        = notifications.filter((n) => n.read).length;
  const unreadNotifs     = notifications.filter((n) => !n.read);

  const handleProtectedNav = (path: string) => { if (!isLoggedIn) navigate("/login"); else { navigate(path); setMobileOpen(false); } };
  const handleLogout = () => { logout(); navigate("/login"); toast({ title: "Signed out", description: "See you soon!" }); };

  const navItems = [
    { label: "Home",         path: "/",             icon: Users,     protected: false },
    { label: "My Projects",  path: "/my-projects",  icon: FolderOpen, protected: true },
    { label: "Post Project", path: "/post-project", icon: Briefcase,  protected: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_20px_-4px_hsl(220_20%_5%/0.4)]">
      <div className="mx-auto max-w-7xl h-16 flex items-center gap-3 px-4 sm:px-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2 group">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-all duration-200 group-hover:scale-105 group-hover:shadow-primary/50">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading text-[1.05rem] font-extrabold tracking-tight leading-none">
            <span className="text-foreground">Project</span><span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Right actions ── */}
        <div className="flex items-center gap-0.5">

          {/* Nav links — right side */}
          <nav className="hidden md:flex items-center gap-0.5 mr-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => item.protected ? handleProtectedNav(item.path) : navigate(item.path)}
                className={`flex items-center px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </button>
            ))}
            {isLoggedIn && (
              <button
                onClick={() => handleProtectedNav("/admin")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {user?.is_admin
                  ? <><Shield className="h-3.5 w-3.5 mr-1" />Admin</>
                  : <><BarChart3 className="h-3.5 w-3.5 mr-1" />Dashboard</>}
              </button>
            )}
          </nav>

          {/* Post Project */}
          <Button
            size="sm"
            onClick={() => handleProtectedNav("/post-project")}
            className="hidden md:flex gap-1.5 h-8 px-3.5 text-sm font-semibold rounded-lg shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Post Project</span>
          </Button>

          {/* Project Alerts */}
          {isLoggedIn && (
            <div className="relative" ref={alertsRef}>
              <button
                onClick={() => { setShowAlertsPanel((p) => !p); setShowNotifPanel(false); }}
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              >
                <Flag className="h-4 w-4" />
                {alertsBadge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {alertsBadge > 9 ? "9+" : alertsBadge}
                  </span>
                )}
              </button>
              {showAlertsPanel && <ProjectAlertsPanel onNewCount={setAlertsBadge} onClose={() => setShowAlertsPanel(false)} />}
            </div>
          )}

          {/* Bell */}
          {isLoggedIn && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifPanel((p) => !p); setShowAlertsPanel(false); setMobileOpen(false); }}
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="fixed inset-x-2 top-[70px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px] bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-black/30 z-50 overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                        <Bell className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <button onClick={() => { setShowNotifPanel(false); navigate(user?.is_admin ? "/admin?tab=bids" : "/my-projects"); }}
                      className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors">
                      View all
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="px-4 pt-3 pb-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                      {user?.is_admin ? "Activity Summary" : "My Activity"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[11px] text-muted-foreground">{user?.is_admin ? "New Projects" : "Bids Received"}</span>
                        </div>
                        <p className="text-xl font-extrabold text-foreground leading-none">{newProjectsCount}</p>
                      </div>
                      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Gavel className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-[11px] text-muted-foreground">{user?.is_admin ? "New Bids" : "Bid Updates"}</span>
                        </div>
                        <p className="text-xl font-extrabold text-foreground leading-none">{newBidsCount}</p>
                      </div>
                      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-[11px] text-muted-foreground">Read</span>
                        </div>
                        <p className="text-xl font-extrabold text-foreground leading-none">{readCount}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/20 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Total</span>
                        </div>
                        <p className="text-xl font-extrabold text-foreground leading-none">{notifications.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-[11px] font-semibold text-orange-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        Pending: {unreadCount}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-[11px] font-semibold text-green-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Done: {readCount}
                      </span>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-52 overflow-y-auto border-t border-border/60 no-scrollbar">
                    {unreadNotifs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-7 gap-2.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-foreground">All caught up!</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">No new notifications</p>
                        </div>
                      </div>
                    ) : unreadNotifs.map((n) => (
                      <button key={n._id} onClick={() => handleNotifClick(n)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-secondary/60 transition-colors border-b border-border/40 last:border-0 bg-primary/[0.03]">
                        <div className="relative mt-0.5 shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                            {n.type === "new_project" ? <FolderOpen className="h-3.5 w-3.5 text-primary" /> : <Gavel className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-medium text-foreground leading-snug">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/60 bg-muted/15">
                    {unreadCount > 0
                      ? <button onClick={handleMarkAllRead} className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors">Mark all read</button>
                      : <span className="text-xs text-muted-foreground">Up to date</span>}
                    <button onClick={() => { setShowNotifPanel(false); navigate(user?.is_admin ? "/admin" : "/my-projects"); }}
                      className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors">
                      {user?.is_admin ? "Admin Panel" : "My Projects"} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Avatar / Sign In */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl pl-1 pr-2 py-1 hover:bg-secondary transition-all duration-200 ml-0.5 border border-transparent hover:border-border/60">
                  <Avatar className="h-7 w-7 ring-2 ring-primary/30">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm font-medium text-foreground">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    {user?.is_admin && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        <Shield className="h-2.5 w-2.5" /> Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {user?.is_admin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/my-projects")} className="cursor-pointer">
                  <FolderOpen className="h-4 w-4 mr-2" /> My Projects
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/post-project")} className="cursor-pointer">
                  <Briefcase className="h-4 w-4 mr-2" /> Post a Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/wallet")} className="cursor-pointer">
                  <Wallet className="h-4 w-4 mr-2" /> My Wallet
                  {walletBalance !== null && (
                    <span className="ml-auto text-xs text-muted-foreground">₹{walletBalance.toLocaleString("en-IN")}</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/messages")} className="cursor-pointer">
                  <MessageCircle className="h-4 w-4 mr-2" /> Messages
                  {unreadMsgs > 0 && (
                    <span className="ml-auto text-xs font-bold text-white bg-primary rounded-full px-1.5 py-0.5 leading-none">{unreadMsgs}</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="cursor-pointer">
                  {theme === "dark"
                    ? <><Sun className="h-4 w-4 mr-2" /> Light Mode</>
                    : <><Moon className="h-4 w-4 mr-2" /> Dark Mode</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="ml-1">
              <Button size="sm" className="gap-1.5 h-8 px-3.5 rounded-lg font-semibold">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 md:hidden ml-1"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Category bar ── */}
      {isLoggedIn && CATEGORY_NAV.length > 0 && (
        <div className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center">
            {CATEGORY_NAV.map((cat) => (
              <div key={cat.id} className="relative shrink-0"
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}>
                <button
                  onClick={() => navigate(isLoggedIn ? "/" : "/login")}
                  className={`flex items-center gap-1 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    hoveredCat === cat.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${hoveredCat === cat.id ? "rotate-180" : ""}`} />
                </button>
                {hoveredCat === cat.id && (
                  <>
                    <div className="absolute left-0 top-[calc(100%-2px)] h-2 w-full z-50" />
                    <div className="absolute left-0 top-full z-50 min-w-[180px] rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                      {cat.subcategories.map((sub) => (
                        <button key={sub}
                          onClick={() => { navigate(isLoggedIn ? "/" : "/login"); setHoveredCat(null); }}
                          className="flex w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
                        >{sub}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border/60 shadow-2xl shadow-black/20">
          {isLoggedIn && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-secondary/40">
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  {user?.is_admin && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                      <Shield className="h-2.5 w-2.5" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}

          <nav className="px-3 py-2 space-y-0.5">
            {navItems.map((item) => (
              <button key={item.path}
                onClick={() => { item.protected ? handleProtectedNav(item.path) : navigate(item.path); setMobileOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  isActive(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            ))}
            {isLoggedIn && (
              <button onClick={() => { handleProtectedNav("/admin"); setMobileOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  isActive("/admin") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {user?.is_admin ? <><Shield className="h-4 w-4 shrink-0" /><span>Admin Panel</span></> : <><BarChart3 className="h-4 w-4 shrink-0" /><span>Dashboard</span></>}
              </button>
            )}
          </nav>

          {isLoggedIn && (
            <div className="px-3 pb-1">
              <button
                onClick={() => { handleProtectedNav("/wallet"); setMobileOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  location.pathname === "/wallet" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Wallet className="h-4 w-4 shrink-0" />
                My Wallet
                {walletBalance !== null && (
                  <span className="ml-auto text-xs font-semibold text-primary">₹{walletBalance.toLocaleString("en-IN")}</span>
                )}
              </button>
              <button
                onClick={() => { handleProtectedNav("/messages"); setMobileOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  location.pathname === "/messages" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                Messages
                {unreadMsgs > 0 && (
                  <span className="ml-auto text-xs font-bold text-white bg-primary rounded-full px-1.5 py-0.5 leading-none">{unreadMsgs}</span>
                )}
              </button>
            </div>
          )}
          <div className="px-4 pb-3">
            <button onClick={() => { handleProtectedNav("/post-project"); setMobileOpen(false); }}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Post a Project
            </button>
          </div>

          <div className="px-3 pb-1">
            <button
              onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {theme === "dark"
                ? <><Sun className="h-4 w-4 shrink-0" /><span>Light Mode</span></>
                : <><Moon className="h-4 w-4 shrink-0" /><span>Dark Mode</span></>}
            </button>
          </div>

          <div className="px-4 py-3 border-t border-border/60 bg-secondary/20">
            {isLoggedIn ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block">
                <Button size="sm" className="w-full gap-1.5"><User className="h-4 w-4" /> Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
