import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Plus, User, Menu, LogOut, ChevronDown, X,
  Briefcase, FolderOpen, LayoutDashboard, Shield, Users, BarChart3,
  Gavel, Clock, CheckCircle2, CheckCircle, Flag, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import ProjectAlertsPanel from "@/components/ProjectAlertsPanel";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface UserResult {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
}

const CATEGORY_NAV: { id: string; label: string; subcategories: string[] }[] = [];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const { toast } = useToast();
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [alertsBadge, setAlertsBadge] = useState(0);
  const alertsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    const timer = setTimeout(() => {
      api.get<UserResult[]>(`/users/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((data) => { setSearchResults(data); setShowDropdown(true); })
        .catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleUserSelect = (id: string) => { setSearchQuery(""); setShowDropdown(false); navigate(`/users/${id}`); };
  const handleProtectedNav = (path: string) => { if (!isLoggedIn) navigate("/login"); else { navigate(path); setMobileOpen(false); } };
  const handleLogout = () => { logout(); navigate("/login"); toast({ title: "Signed out", description: "See you soon!" }); };

  const navItems = [
    { label: "Browse",       path: "/",             icon: Users,     protected: false },
    { label: "My Projects",  path: "/my-projects",  icon: FolderOpen, protected: true },
    { label: "Post Project", path: "/post-project", icon: Briefcase,  protected: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl h-16 flex items-center gap-3 px-4 sm:px-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
          <img src="/favicon.svg" alt="ProjectHub" className="h-8 w-8" />
          <span className="font-heading text-[1.05rem] font-bold tracking-tight">
            <span className="text-foreground">Project</span><span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* ── Search ── */}
        <div className="relative hidden md:flex flex-1 max-w-xs" ref={searchRef}>
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search users..."
            className="pl-9 h-9 bg-secondary border-none rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {searchResults.length > 0 ? searchResults.map((u) => (
                <button key={u.id} onClick={() => handleUserSelect(u.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-left">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-foreground truncate flex-1">{u.name}</p>
                  <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">{u.role}</Badge>
                </button>
              )) : (
                <p className="px-4 py-3 text-sm text-muted-foreground">No users found</p>
              )}
            </div>
          )}
        </div>

        {/* ── Nav links — full-height underline tab style ── */}
        <nav className="hidden md:flex self-stretch items-center ml-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => item.protected ? handleProtectedNav(item.path) : navigate(item.path)}
              className={`self-stretch flex items-center px-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive(item.path)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {item.label}
            </button>
          ))}
          {isLoggedIn && (
            <button
              onClick={() => handleProtectedNav("/admin")}
              className={`self-stretch flex items-center gap-1.5 px-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive("/admin")
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {user?.is_admin
                ? <><Shield className="h-3.5 w-3.5" />Admin</>
                : <><BarChart3 className="h-3.5 w-3.5" />Dashboard</>}
            </button>
          )}
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1">

          {/* Post Project */}
          <Button
            size="sm"
            onClick={() => handleProtectedNav("/post-project")}
            className="hidden md:flex gap-1.5 h-8 px-3.5 text-sm font-semibold rounded-lg"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Post Project</span>
          </Button>

          {/* Theme */}
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>

          {/* Project Alerts */}
          {isLoggedIn && (
            <div className="relative" ref={alertsRef}>
              <button
                onClick={() => { setShowAlertsPanel((p) => !p); setShowNotifPanel(false); }}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="fixed inset-x-2 top-[70px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-sm text-foreground">Notifications</p>
                    </div>
                    <button onClick={() => { setShowNotifPanel(false); navigate(user?.is_admin ? "/admin?tab=bids" : "/my-projects"); }}
                      className="text-xs text-primary hover:underline font-medium">View all</button>
                  </div>

                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {user?.is_admin ? "Activity Summary" : "My Activity"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[11px] text-muted-foreground">{user?.is_admin ? "New Projects" : "Bids Received"}</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">{newProjectsCount}</p>
                      </div>
                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-[11px] text-muted-foreground">{user?.is_admin ? "New Bids" : "Bid Updates"}</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">{newBidsCount}</p>
                      </div>
                      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-[11px] text-muted-foreground">Read</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">{readCount}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/20 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Total</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">{notifications.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/60">
                      <span className="text-xs font-semibold text-orange-500">Pending: {unreadCount}</span>
                      <span className="text-xs font-semibold text-green-500">Done: {readCount}</span>
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto border-t border-border/60">
                    {unreadNotifs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-6 gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/30">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">All caught up!</p>
                      </div>
                    ) : unreadNotifs.map((n) => (
                      <button key={n._id} onClick={() => handleNotifClick(n)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors bg-primary/5">
                        <div className="relative mt-0.5 shrink-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            {n.type === "new_project" ? <FolderOpen className="h-3.5 w-3.5 text-primary" /> : <Gavel className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-snug">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10">
                    {unreadCount > 0
                      ? <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline font-medium">Mark all read</button>
                      : <span className="text-xs text-muted-foreground">Up to date</span>}
                    <button onClick={() => { setShowNotifPanel(false); navigate(user?.is_admin ? "/admin" : "/my-projects"); }}
                      className="text-xs text-primary hover:underline font-medium">
                      {user?.is_admin ? "Admin Panel" : "My Projects"}
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
                <button className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-secondary transition-colors ml-0.5">
                  <Avatar className="h-7 w-7 ring-2 ring-primary/20">
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
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" /> Settings
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors md:hidden ml-1"
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
        <div className="md:hidden bg-card border-t border-border shadow-lg">
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

          <div className="px-4 py-3 border-b border-border/60">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10 bg-secondary border-none h-9 rounded-lg"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

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

          <div className="px-4 pb-3">
            <button onClick={() => { handleProtectedNav("/post-project"); setMobileOpen(false); }}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Post a Project
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-secondary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Theme</span>
              <ThemeToggle />
            </div>
            {isLoggedIn ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="gap-1.5"><User className="h-4 w-4" /> Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
