import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Trash2, Plus, X, Clock, IndianRupee, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ─────────────────────────────────────────────── */
interface RecentProject {
  _id: string;
  title: string;
  skills: string[];
  budget: { min: number; max: number };
  category: string;
  createdAt: string;
}

interface SavedAlert {
  _id: string;
  name: string;
  category: string;
  skills: string[];
  budgetMin?: number;
  budgetMax?: number;
  createdAt: string;
}

const LAST_SEEN_KEY = "ph_alerts_last_seen";
const POLL_MS       = 30_000;

const ALL_CATEGORIES = [
  { id: "",                  name: "All Categories"          },
  { id: "web-dev",           name: "Web Development"         },
  { id: "mobile",            name: "Mobile Apps"             },
  { id: "design",            name: "UI/UX & Design"          },
  { id: "writing",           name: "Content & Writing"       },
  { id: "marketing",         name: "Social Media & Marketing"},
  { id: "data",              name: "Data Science & AI"       },
  { id: "prog-tech",         name: "Programming & Tech"      },
  { id: "digital-marketing", name: "SEO & Performance"       },
  { id: "video",             name: "Video & Animation"       },
  { id: "finance",           name: "Finance & Accounting"    },
];

/* ─── Helpers ────────────────────────────────────────────── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m} minute${m > 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? "s" : ""} ago`;
}

function formatBudget(min: number, max: number) {
  const fmt = (n: number) =>
    n >= 100_000 ? `₹${(n / 100_000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;
  return `${fmt(min)} – ${fmt(max)}`;
}

/* ─── Add-Alert form ─────────────────────────────────────── */
const AddAlertForm = ({
  onSave,
  onCancel,
}: {
  onSave: (a: SavedAlert) => void;
  onCancel: () => void;
}) => {
  const { toast } = useToast();
  const [name, setName]         = useState("");
  const [category, setCategory] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills]     = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [saving, setSaving]     = useState(false);

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) setSkills((p) => [...p, t]);
    setSkillInput("");
  };

  const handleSave = async () => {
    if (!name.trim()) { toast({ title: "Alert name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const saved = await api.post<SavedAlert>("/alerts", {
        name, category, skills,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
      });
      onSave(saved);
      toast({ title: "Alert saved!" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-3 border-t border-border bg-secondary/20">
      <p className="text-xs font-semibold text-foreground">New Alert</p>

      <div className="space-y-1">
        <Label className="text-xs">Alert Name *</Label>
        <Input
          placeholder='e.g. "React Jobs ₹50k+"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Category</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Skills</Label>
        <div className="flex gap-1.5">
          <Input
            placeholder="React, Node.js…"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className="h-8 text-xs flex-1"
          />
          <Button type="button" size="sm" variant="secondary" className="h-8 text-xs px-2" onClick={addSkill}>Add</Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px] gap-1 pr-0.5">
                {s}
                <button onClick={() => setSkills((p) => p.filter((x) => x !== s))}><X className="h-2.5 w-2.5" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Min Budget (₹)</Label>
          <Input placeholder="10000" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="h-8 text-xs" type="number" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Budget (₹)</Label>
          <Input placeholder="500000" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="h-8 text-xs" type="number" />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" className="h-8 text-xs flex-1" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Alert"}
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

/* ─── Main Panel ─────────────────────────────────────────── */
interface Props {
  onNewCount: (n: number) => void; // bubble badge count up to Navbar
  onClose: () => void;
}

const ProjectAlertsPanel = ({ onNewCount, onClose }: Props) => {
  const navigate                          = useNavigate();
  const { toast }                         = useToast();
  const [tab, setTab]                     = useState<"recent" | "saved">("recent");
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [savedAlerts, setSavedAlerts]     = useState<SavedAlert[]>([]);
  const [showAddForm, setShowAddForm]     = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingSaved, setLoadingSaved]   = useState(true);

  /* ── Fetch recent open projects ── */
  const fetchRecent = useCallback(async () => {
    try {
      const data = await api.get<RecentProject[]>("/projects?status=open&limit=20");
      setRecentProjects(data);

      // Count new since last panel open
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      const newCount = lastSeen
        ? data.filter((p) => new Date(p.createdAt) > new Date(lastSeen)).length
        : data.length;
      onNewCount(newCount);
    } catch {
      /* silently fail */
    } finally {
      setLoadingRecent(false);
    }
  }, [onNewCount]);

  /* ── Fetch saved alerts ── */
  const fetchSaved = useCallback(async () => {
    try {
      const data = await api.get<SavedAlert[]>("/alerts");
      setSavedAlerts(data);
    } catch {
      /* silently fail */
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  /* ── On mount: mark as seen + fetch ── */
  useEffect(() => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    onNewCount(0); // reset badge immediately on open
    fetchRecent();
    fetchSaved();
    const interval = setInterval(fetchRecent, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchRecent, fetchSaved, onNewCount]);

  /* ── Delete saved alert ── */
  const handleDelete = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}`, undefined); // will use DELETE below
      setSavedAlerts((p) => p.filter((a) => a._id !== id));
      toast({ title: "Alert removed" });
    } catch {
      toast({ title: "Failed to remove alert", variant: "destructive" });
    }
  };

  // Since api helper only has patch/post/get, add delete via fetch directly
  const deleteAlert = async (id: string) => {
    try {
      const token = localStorage.getItem("ph_token");
      const base  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await fetch(`${base}/alerts/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSavedAlerts((p) => p.filter((a) => a._id !== id));
      toast({ title: "Alert removed" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  /* ── Navigate to home with saved alert filters ── */
  const applyAlert = (alert: SavedAlert) => {
    onClose();
    const params = new URLSearchParams();
    if (alert.category) params.set("category", alert.category);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Project Alerts</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-border shrink-0">
        {(["recent", "saved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              tab === t
                ? "border-b-2 border-primary text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "recent" ? "Recent Projects" : `Saved Alerts ${savedAlerts.length > 0 ? `(${savedAlerts.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── Tab: Recent Projects ── */}
      {tab === "recent" && (
        <div className="overflow-y-auto flex-1">
          {loadingRecent ? (
            <div className="space-y-0 divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
                  <div className="h-9 w-9 rounded-lg bg-secondary shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-secondary rounded w-3/4" />
                    <div className="h-2.5 bg-secondary rounded w-1/2" />
                    <div className="h-2.5 bg-secondary rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No open projects yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentProjects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => { onClose(); navigate(`/project/${p._id}`); }}
                  className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <FolderOpen className="h-4 w-4 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    {p.skills.length > 0 && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {p.skills.slice(0, 4).join(", ")}
                        {p.skills.length > 4 && "…"}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {timeAgo(p.createdAt)}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] font-medium text-foreground">
                        <IndianRupee className="h-3 w-3" />
                        {formatBudget(p.budget.min, p.budget.max)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Saved Alerts ── */}
      {tab === "saved" && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loadingSaved ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading…</div>
            ) : savedAlerts.length === 0 && !showAddForm ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 px-4 text-center">
                <Flag className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No saved alerts yet</p>
                <p className="text-xs text-muted-foreground">Save a filter to get notified when matching projects are posted.</p>
              </div>
            ) : (
              savedAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-start justify-between gap-2 px-4 py-3 hover:bg-secondary/40 transition-colors"
                >
                  <button className="flex-1 text-left" onClick={() => applyAlert(alert)}>
                    <p className="text-sm font-medium text-foreground">{alert.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {alert.category && (
                        <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
                          {ALL_CATEGORIES.find((c) => c.id === alert.category)?.name || alert.category}
                        </span>
                      )}
                      {alert.skills.map((s) => (
                        <span key={s} className="text-[10px] rounded-full bg-secondary text-muted-foreground px-2 py-0.5">{s}</span>
                      ))}
                      {(alert.budgetMin || alert.budgetMax) && (
                        <span className="text-[10px] rounded-full bg-secondary text-muted-foreground px-2 py-0.5">
                          {alert.budgetMin ? `₹${alert.budgetMin.toLocaleString("en-IN")}` : "Any"} –{" "}
                          {alert.budgetMax ? `₹${alert.budgetMax.toLocaleString("en-IN")}` : "Any"}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteAlert(alert._id)}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add-alert form */}
          {showAddForm ? (
            <AddAlertForm
              onSave={(a) => { setSavedAlerts((p) => [a, ...p]); setShowAddForm(false); }}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <div className="px-4 py-3 border-t border-border shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 text-xs h-8"
                onClick={() => setShowAddForm(true)}
                disabled={savedAlerts.length >= 10}
              >
                <Plus className="h-3.5 w-3.5" />
                {savedAlerts.length >= 10 ? "Max 10 alerts reached" : "Add New Alert"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectAlertsPanel;
