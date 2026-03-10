import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User, Lock, Bell, Palette, Shield,
  LogOut, Camera, Eye, EyeOff, Save,
  Sun, Moon, Monitor, Check, X,
  AlertTriangle, Mail, Smartphone,
  QrCode, ShieldCheck, ShieldOff, Copy,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────── */
type Section = "profile" | "account" | "notifications" | "appearance" | "privacy";

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "profile",       label: "Profile",       icon: User    },
  { id: "account",       label: "Account",       icon: Lock    },
  { id: "notifications", label: "Notifications", icon: Bell    },
  { id: "appearance",    label: "Appearance",    icon: Palette },
  { id: "privacy",       label: "Privacy",       icon: Shield  },
];

const ORDER = NAV.map((n) => n.id);

/* ─── Password strength ─────────────────────────────── */
function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-success"];
  return { score: s, label: labels[s], color: colors[s] };
}

/* ─── 2FA Dialog ────────────────────────────────────── */
type TwoFaStep = "idle" | "loading-qr" | "scan" | "backup-codes" | "disable-confirm";

interface TwoFaState {
  open: boolean;
  step: TwoFaStep;
  qrCode: string;
  manualKey: string;
  token: string;         // 6-digit TOTP input
  backupCodes: string[];
  error: string;
  submitting: boolean;
  enabled: boolean;      // current 2FA status from server
  statusLoaded: boolean;
}

const TFA_INIT: TwoFaState = {
  open: false,
  step: "idle",
  qrCode: "",
  manualKey: "",
  token: "",
  backupCodes: [],
  error: "",
  submitting: false,
  enabled: false,
  statusLoaded: false,
};

function TwoFaDialog({
  state,
  onClose,
  onChange,
  onStartSetup,
  onConfirmEnable,
  onStartDisable,
  onConfirmDisable,
}: {
  state: TwoFaState;
  onClose: () => void;
  onChange: (patch: Partial<TwoFaState>) => void;
  onStartSetup: () => void;
  onConfirmEnable: () => void;
  onStartDisable: () => void;
  onConfirmDisable: () => void;
}) {
  const copyKey = () => {
    navigator.clipboard.writeText(state.manualKey);
  };

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {state.step === "scan"
              ? "Scan the QR code with your authenticator app, then enter the 6-digit code."
              : state.step === "backup-codes"
              ? "Save these backup codes — they won't be shown again."
              : state.step === "disable-confirm"
              ? "Enter your current authenticator code to disable 2FA."
              : state.enabled
              ? "2FA is currently active on your account."
              : "Add an extra layer of security to your account."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Status / entry screen ── */}
        {(state.step === "idle") && (
          <div className="space-y-4 py-2">
            {state.statusLoaded && (
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${state.enabled ? "border-success/30 bg-success/10" : "border-border bg-muted/20"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${state.enabled ? "bg-success/20" : "bg-muted"}`}>
                  {state.enabled ? <ShieldCheck className="w-4 h-4 text-success" /> : <ShieldOff className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{state.enabled ? "2FA is enabled" : "2FA is not enabled"}</p>
                  <p className="text-xs text-muted-foreground">{state.enabled ? "Your account has extra protection." : "Your account is only protected by a password."}</p>
                </div>
              </div>
            )}

            {!state.statusLoaded && (
              <div className="flex items-center justify-center py-4">
                <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {state.statusLoaded && (
              <div className="flex justify-end gap-2 pt-1">
                {state.enabled ? (
                  <Button variant="destructive" size="sm" onClick={onStartDisable} className="gap-2">
                    <ShieldOff className="w-4 h-4" /> Disable 2FA
                  </Button>
                ) : (
                  <Button size="sm" onClick={onStartSetup} className="gap-2">
                    <QrCode className="w-4 h-4" /> Set Up 2FA
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Loading QR ── */}
        {state.step === "loading-qr" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Generating QR code…</p>
          </div>
        )}

        {/* ── Scan QR code ── */}
        {state.step === "scan" && (
          <div className="space-y-4 py-2">
            {/* QR image */}
            {state.qrCode && (
              <div className="flex justify-center">
                <img
                  src={state.qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 rounded-xl border border-border shadow-sm"
                />
              </div>
            )}

            {/* Manual key */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Can't scan? Enter this key manually:</p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border font-mono text-xs break-all">
                <span className="flex-1 select-all">{state.manualKey}</span>
                <button onClick={copyKey} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 6-digit input */}
            <div className="space-y-1.5">
              <Label htmlFor="tfa-token" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Enter 6-digit code from app
              </Label>
              <Input
                id="tfa-token"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={state.token}
                onChange={(e) => onChange({ token: e.target.value.replace(/\D/g, "").slice(0, 6), error: "" })}
                className="h-11 text-center text-xl tracking-[0.5em] font-mono"
                autoFocus
              />
              {state.error && (
                <p className="text-xs text-destructive flex items-center gap-1"><X className="w-3 h-3" />{state.error}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button
                size="sm"
                disabled={state.token.length !== 6 || state.submitting}
                onClick={onConfirmEnable}
                className="gap-2"
              >
                {state.submitting
                  ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />}
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {/* ── Backup codes ── */}
        {state.step === "backup-codes" && (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                <strong>Save these now.</strong> Each code can only be used once and they won't be shown again. Store them somewhere safe.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {state.backupCodes.map((code) => (
                <code key={code} className="px-3 py-2 rounded-md bg-muted text-xs font-mono text-center tracking-widest border border-border">
                  {code}
                </code>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => { navigator.clipboard.writeText(state.backupCodes.join("\n")); }}
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" /> Copy All
              </Button>
              <Button size="sm" onClick={onClose} className="gap-2">
                <Check className="w-4 h-4" /> Done
              </Button>
            </div>
          </div>
        )}

        {/* ── Disable confirm ── */}
        {state.step === "disable-confirm" && (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Disabling 2FA will make your account less secure. Enter your current 6-digit code to confirm.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tfa-disable-token" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current authenticator code
              </Label>
              <Input
                id="tfa-disable-token"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={state.token}
                onChange={(e) => onChange({ token: e.target.value.replace(/\D/g, "").slice(0, 6), error: "" })}
                className="h-11 text-center text-xl tracking-[0.5em] font-mono"
                autoFocus
              />
              {state.error && (
                <p className="text-xs text-destructive flex items-center gap-1"><X className="w-3 h-3" />{state.error}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={state.token.length !== 6 || state.submitting}
                onClick={onConfirmDisable}
                className="gap-2"
              >
                {state.submitting
                  ? <span className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  : <ShieldOff className="w-4 h-4" />}
                Disable 2FA
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════ */
export default function Settings() {
  const { user, logout, updateAvatar, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [active, setActive]        = useState<Section>("profile");
  const [contentKey, setContentKey] = useState(0);
  const [animDir, setAnimDir]      = useState<"fwd" | "bwd">("fwd");

  /* profile */
  const [name, setName]           = useState(user?.name ?? "");
  const [email, setEmail]         = useState(user?.email ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileDone, setProfileDone]     = useState(false);

  /* avatar */
  const fileRef                   = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* password */
  const [curPw, setCurPw]         = useState("");
  const [newPw, setNewPw]         = useState("");
  const [conPw, setConPw]         = useState("");
  const [showCur, setShowCur]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showCon, setShowCon]     = useState(false);
  const [savingPw, setSavingPw]   = useState(false);

  /* notifications */
  const [notifs, setNotifs] = useState({
    emailNewBid:     true,
    emailProjectWon: true,
    emailMarketing:  false,
    pushBrowser:     true,
    pushMobile:      false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  /* 2FA */
  const [tfa, setTfa] = useState<TwoFaState>(TFA_INIT);
  const patchTfa = (patch: Partial<TwoFaState>) => setTfa((prev) => ({ ...prev, ...patch }));

  /* sync when user loads */
  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user]);

  /* nav */
  const goTo = (id: Section) => {
    if (id === active) return;
    setAnimDir(ORDER.indexOf(id) > ORDER.indexOf(active) ? "fwd" : "bwd");
    setActive(id);
    setContentKey((k) => k + 1);
  };

  const initials = (user?.name ?? "U")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  /* ── handlers ───────────────────────────────────────── */
  const onAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2 MB allowed", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) return;
    setSavingProfile(true);
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const { avatar } = await api.patchForm<{ avatar: string }>("/users/me/avatar", fd);
        updateAvatar(avatar);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      const nameChanged  = name.trim()  !== user?.name;
      const emailChanged = email.trim() !== user?.email;
      if (nameChanged || emailChanged) {
        const updated = await api.patch<{ name: string; email: string }>("/users/me/profile", {
          name: name.trim(), email: email.trim(),
        });
        updateUser({ name: updated.name, email: updated.email });
      }
      setProfileDone(true);
      setTimeout(() => setProfileDone(false), 2500);
      toast({ title: "Profile updated successfully" });
    } catch (err) {
      toast({ title: "Update failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!curPw || !newPw || !conPw) {
      toast({ title: "All fields are required", variant: "destructive" }); return;
    }
    if (newPw !== conPw) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (newPw.length < 6) {
      toast({ title: "Password too short", description: "Min 6 characters required", variant: "destructive" }); return;
    }
    setSavingPw(true);
    try {
      await api.patch("/users/me/change-password", { currentPassword: curPw, newPassword: newPw });
      toast({ title: "Password changed successfully" });
      setCurPw(""); setNewPw(""); setConPw("");
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  };

  const saveNotifs = async () => {
    setSavingNotifs(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingNotifs(false);
    toast({ title: "Preferences saved" });
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  /* ── 2FA handlers ───────────────────────────────────── */

  /** Open the dialog and fetch current 2FA status */
  const open2faDialog = async () => {
    patchTfa({ ...TFA_INIT, open: true, step: "idle", statusLoaded: false });
    try {
      const data = await api.get<{ twoFactorEnabled: boolean }>("/2fa/status");
      patchTfa({ enabled: data.twoFactorEnabled, statusLoaded: true });
    } catch {
      patchTfa({ statusLoaded: true });
    }
  };

  /** Step 1: fetch QR code from server */
  const handle2faStartSetup = async () => {
    patchTfa({ step: "loading-qr", error: "" });
    try {
      const data = await api.get<{ qrCode: string; manualEntryKey: string }>("/2fa/setup");
      patchTfa({ step: "scan", qrCode: data.qrCode, manualKey: data.manualEntryKey, token: "" });
    } catch (err) {
      patchTfa({ step: "idle", error: err instanceof Error ? err.message : "Failed to get QR code" });
      toast({ title: "Failed to set up 2FA", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  };

  /** Step 2: confirm TOTP code → enable 2FA → show backup codes */
  const handle2faConfirmEnable = async () => {
    patchTfa({ submitting: true, error: "" });
    try {
      const data = await api.post<{ backupCodes: string[] }>("/2fa/enable", { token: tfa.token });
      patchTfa({ step: "backup-codes", backupCodes: data.backupCodes, submitting: false, enabled: true });
      toast({ title: "2FA enabled!", description: "Your account now requires a code on every sign-in." });
    } catch (err) {
      patchTfa({
        submitting: false,
        error: err instanceof Error ? err.message : "Invalid code. Try again.",
      });
    }
  };

  /** Open disable confirmation */
  const handle2faStartDisable = () => {
    patchTfa({ step: "disable-confirm", token: "", error: "" });
  };

  /** Confirm disable */
  const handle2faConfirmDisable = async () => {
    patchTfa({ submitting: true, error: "" });
    try {
      await api.post("/2fa/disable", { token: tfa.token });
      patchTfa({ ...TFA_INIT, open: false });
      toast({ title: "2FA disabled", description: "Two-factor authentication has been turned off." });
    } catch (err) {
      patchTfa({
        submitting: false,
        error: err instanceof Error ? err.message : "Invalid code. Try again.",
      });
    }
  };

  const close2faDialog = () => setTfa(TFA_INIT);

  /* ── animation class ────────────────────────────────── */
  const anim = animDir === "fwd" ? "step-enter-fwd" : "step-enter-bwd";
  const strength = pwStrength(newPw);

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page title */}
        <div className="mb-7 card-enter">
          <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account, profile and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="lg:w-52 shrink-0 card-enter" style={{ animationDelay: "0.04s" }}>

            {/* Mobile: horizontal scroll */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => goTo(id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${active === id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical card */}
            <Card className="hidden lg:flex flex-col p-2 gap-0.5">
              {/* Mini profile */}
              <div className="flex items-center gap-3 px-3 py-3 mb-1">
                <Avatar className="w-9 h-9 ring-2 ring-border">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              <Separator className="mb-1 opacity-40" />

              {/* Nav */}
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => goTo(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${active === id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${active !== id ? "group-hover:scale-110" : ""}`} />
                  {label}
                </button>
              ))}

              <Separator className="my-1 opacity-40" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Sign Out
              </button>
            </Card>
          </aside>

          {/* ── Content ─────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <div key={contentKey} className={`${anim} space-y-5`}>

              {/* ─── PROFILE ─────────────────────────────── */}
              {active === "profile" && (
                <>
                  {/* Avatar card */}
                  <Card className="overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-primary/15 via-primary/8 to-transparent" />
                    <div className="px-6 pb-6">
                      <div className="relative -mt-10 flex items-end gap-4 mb-4">
                        <div className="relative shrink-0 group">
                          <Avatar className="w-20 h-20 ring-4 ring-background shadow-md">
                            <AvatarImage src={avatarPreview ?? user?.avatar} className="object-cover" />
                            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                          </Avatar>
                          <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Camera className="w-5 h-5 text-white" />
                          </button>
                          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarPick} />
                        </div>
                        <div className="pb-1">
                          <p className="font-heading font-bold text-foreground">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <div className="flex gap-1.5 mt-1.5">
                            <Badge variant="outline" className={`text-[10px] gap-1 ${user?.is_admin ? "border-primary/30 text-primary bg-primary/5" : "border-border"}`}>
                              <Shield className="w-2.5 h-2.5" />
                              {user?.is_admin ? "Admin" : "Member"}
                            </Badge>
                            {user?.isEmailVerified && (
                              <Badge className="text-[10px] gap-1 bg-success/10 text-success border-success/30 hover:bg-success/10">
                                <Check className="w-2.5 h-2.5" /> Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {avatarPreview && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 mb-1">
                          <span className="text-xs text-primary flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5" /> New photo selected — save to apply
                          </span>
                          <button onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} className="text-xs text-muted-foreground hover:text-destructive">
                            Remove
                          </button>
                        </div>
                      )}
                      {!avatarPreview && (
                        <p className="text-xs text-muted-foreground">Click your photo to upload. JPG, PNG or WebP · max 2 MB.</p>
                      )}
                    </div>
                  </Card>

                  {/* Info form */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-heading text-sm font-semibold text-foreground">Personal Information</h2>
                        <p className="text-xs text-muted-foreground">Update your display name and email address</p>
                      </div>
                    </div>
                    <Separator className="mb-5 opacity-50" />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="s-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</Label>
                        <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="s-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-10 pl-9" />
                        </div>
                        <p className="text-xs text-muted-foreground">Changing email updates your login credentials.</p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-5 pt-4 border-t border-border/40">
                      <Button
                        onClick={saveProfile}
                        disabled={savingProfile || !name.trim() || !email.trim()}
                        className={`gap-2 min-w-[140px] transition-all duration-300 ${profileDone ? "bg-success hover:bg-success" : ""}`}
                      >
                        {savingProfile
                          ? <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                          : profileDone
                          ? <Check className="w-4 h-4 success-bounce" />
                          : <Save className="w-4 h-4" />}
                        {profileDone ? "Saved!" : "Save Changes"}
                      </Button>
                    </div>
                  </Card>
                </>
              )}

              {/* ─── ACCOUNT ─────────────────────────────── */}
              {active === "account" && (
                <>
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-heading text-sm font-semibold text-foreground">Change Password</h2>
                        <p className="text-xs text-muted-foreground">Use a strong password — at least 6 characters</p>
                      </div>
                    </div>
                    <Separator className="mb-5 opacity-50" />

                    <div className="space-y-4 max-w-md">
                      {/* Current */}
                      <div className="space-y-1.5">
                        <Label htmlFor="cur-pw" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Password</Label>
                        <div className="relative">
                          <Input id="cur-pw" type={showCur ? "text" : "password"} value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="••••••••" className="h-10 pr-10" />
                          <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New */}
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pw" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New Password</Label>
                        <div className="relative">
                          <Input id="new-pw" type={showNew ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" className="h-10 pr-10" />
                          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {newPw && (
                          <div className="space-y-1 pt-0.5">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-muted"}`} />
                              ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{strength.label}</p>
                          </div>
                        )}
                      </div>

                      {/* Confirm */}
                      <div className="space-y-1.5">
                        <Label htmlFor="con-pw" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="con-pw"
                            type={showCon ? "text" : "password"}
                            value={conPw}
                            onChange={(e) => setConPw(e.target.value)}
                            placeholder="••••••••"
                            className={`h-10 pr-10 ${conPw && conPw !== newPw ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                          />
                          <button type="button" onClick={() => setShowCon(!showCon)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showCon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {conPw && conPw !== newPw && (
                          <p className="text-xs text-destructive flex items-center gap-1"><X className="w-3 h-3" /> Passwords don't match</p>
                        )}
                        {conPw && conPw === newPw && newPw.length >= 6 && (
                          <p className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-5 pt-4 border-t border-border/40">
                      <Button
                        onClick={changePassword}
                        disabled={savingPw || !curPw || !newPw || !conPw || newPw !== conPw}
                        variant="outline"
                        className="gap-2 min-w-[160px]"
                      >
                        {savingPw
                          ? <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                          : <Lock className="w-4 h-4" />}
                        Update Password
                      </Button>
                    </div>
                  </Card>

                  {/* Danger zone */}
                  <Card className="p-6 border-destructive/25">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-heading text-sm font-semibold text-foreground">Danger Zone</h2>
                        <p className="text-xs text-muted-foreground">Irreversible actions — proceed with caution</p>
                      </div>
                    </div>
                    <Separator className="mb-5 opacity-50" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Signing out will end your current session. You'll need to log in again to access your account.
                      </p>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </Card>
                </>
              )}

              {/* ─── NOTIFICATIONS ───────────────────────── */}
              {active === "notifications" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm font-semibold text-foreground">Notification Preferences</h2>
                      <p className="text-xs text-muted-foreground">Control what you're notified about and how</p>
                    </div>
                  </div>
                  <Separator className="mb-5 opacity-50" />

                  {[
                    {
                      title: "Email", icon: Mail,
                      items: [
                        { key: "emailNewBid",     label: "New bid on your project",   desc: "When someone places a bid on your project" },
                        { key: "emailProjectWon", label: "Project awarded",            desc: "When your bid gets accepted by a client"   },
                        { key: "emailMarketing",  label: "Tips & platform updates",    desc: "Helpful tips, features and promotions"      },
                      ],
                    },
                    {
                      title: "Push", icon: Smartphone,
                      items: [
                        { key: "pushBrowser", label: "Browser notifications", desc: "Real-time alerts in your browser"    },
                        { key: "pushMobile",  label: "Mobile push",           desc: "Alerts sent to your mobile device"  },
                      ],
                    },
                  ].map((group) => {
                    const Icon = group.icon;
                    return (
                      <div key={group.title} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</span>
                        </div>
                        <div className="space-y-2">
                          {group.items.map(({ key, label, desc }, i) => (
                            <div
                              key={key}
                              className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-border/50 bg-muted/20 hover:border-border/80 transition-colors bid-enter"
                              style={{ animationDelay: `${i * 0.05}s` }}
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                              </div>
                              <button
                                role="switch"
                                aria-checked={notifs[key as keyof typeof notifs]}
                                onClick={() => setNotifs({ ...notifs, [key]: !notifs[key as keyof typeof notifs] })}
                                className={`relative w-10 h-[22px] rounded-full transition-colors duration-250 shrink-0 ml-4
                                  ${notifs[key as keyof typeof notifs] ? "bg-primary" : "bg-muted border border-border"}`}
                              >
                                <span className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-250
                                  ${notifs[key as keyof typeof notifs] ? "translate-x-[20px]" : "translate-x-[2px]"}`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <Button onClick={saveNotifs} disabled={savingNotifs} className="gap-2 min-w-[140px]">
                      {savingNotifs
                        ? <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                        : <Save className="w-4 h-4" />}
                      Save Preferences
                    </Button>
                  </div>
                </Card>
              )}

              {/* ─── APPEARANCE ──────────────────────────── */}
              {active === "appearance" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm font-semibold text-foreground">Appearance</h2>
                      <p className="text-xs text-muted-foreground">Choose how ProjectHub looks for you</p>
                    </div>
                  </div>
                  <Separator className="mb-5 opacity-50" />

                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Theme</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      { id: "light",  label: "Light",  desc: "Bright & clean",        icon: Sun     },
                      { id: "dark",   label: "Dark",   desc: "Easy on the eyes",      icon: Moon    },
                      { id: "system", label: "System", desc: "Matches your OS",       icon: Monitor },
                    ] as const).map(({ id, label, desc, icon: Icon }, i) => {
                      const isActive = theme === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setTheme(id)}
                          style={{ animationDelay: `${i * 0.06}s` }}
                          className={`card-enter relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-center transition-all duration-200 group
                            ${isActive
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/10 hover:border-border hover:bg-muted/30"}`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
                            ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted text-muted-foreground group-hover:scale-105"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                          {isActive && (
                            <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center success-bounce">
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* ─── PRIVACY ─────────────────────────────── */}
              {active === "privacy" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm font-semibold text-foreground">Privacy &amp; Security</h2>
                      <p className="text-xs text-muted-foreground">Manage data and security settings</p>
                    </div>
                  </div>
                  <Separator className="mb-5 opacity-50" />

                  <div className="space-y-3">
                    {/* Export data */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 rounded-lg border border-border/50 bg-muted/10 hover:border-border/80 transition-colors bid-enter" style={{ animationDelay: "0s" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Export your data</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Download a copy of all your account data including projects, bids and reviews.</p>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0">
                        Request export
                      </Button>
                    </div>

                    {/* Two-factor authentication — wired up */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 rounded-lg border border-border/50 bg-muted/10 hover:border-border/80 transition-colors bid-enter" style={{ animationDelay: "0.06s" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Two-factor authentication</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Add an extra layer of security to your account with 2FA verification.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-2"
                        onClick={open2faDialog}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Manage 2FA
                      </Button>
                    </div>

                    {/* Delete account */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 rounded-lg border border-border/50 bg-muted/10 hover:border-border/80 transition-colors bid-enter" style={{ animationDelay: "0.12s" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Delete account</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Permanently remove your account and all associated data. This cannot be undone.</p>
                      </div>
                      <Button variant="destructive" size="sm" className="shrink-0">
                        Delete account
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-5 opacity-50" />

                  {/* Active sessions */}
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Active Sessions</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 rounded-lg border border-border/50 bg-muted/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <p className="text-sm font-medium text-foreground">Current session</p>
                        <Badge variant="secondary" className="text-[10px]">Active now</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Web browser · Last seen just now</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground shrink-0">
                      Revoke
                    </Button>
                  </div>
                </Card>
              )}

            </div>
          </main>
        </div>
      </div>

      {/* ── 2FA Dialog ───────────────────────────────────── */}
      <TwoFaDialog
        state={tfa}
        onClose={close2faDialog}
        onChange={patchTfa}
        onStartSetup={handle2faStartSetup}
        onConfirmEnable={handle2faConfirmEnable}
        onStartDisable={handle2faStartDisable}
        onConfirmDisable={handle2faConfirmDisable}
      />
    </div>
  );
}
