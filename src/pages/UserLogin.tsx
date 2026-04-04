import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  CheckCircle2, Star, Shield, ArrowLeft,
  Briefcase, LogIn, UserPlus, KeyRound, XCircle,
  Zap, ShieldCheck,
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const PERKS = [
  { icon: Zap,          text: "Post projects and get proposals fast" },
  { icon: Star,         text: "Top-rated verified experts" },
  { icon: ShieldCheck,  text: "100% payment protection via Escrow" },
  { icon: CheckCircle2, text: "Free to join and browse" },
];

interface DemoCard {
  label: string;
  initial: string;
  email: string;
  password: string;
  tag: string;
  color: string;
}

const DEMO_CARDS: DemoCard[] = [
  {
    label: "Admin",
    initial: "A",
    email: "Admin@projecthub.in",
    password: "Ambhore@12345",
    tag: "Admin",
    color: "bg-destructive/10 text-destructive",
  },
];

const UserLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, complete2faLogin, signup, isLoggedIn, user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);

  const [tfaTempToken, setTfaTempToken] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [tfaError, setTfaError] = useState("");
  const [tfaLoading, setTfaLoading] = useState(false);

  const [forgotEmail, setForgotEmail]             = useState("");
  const [forgotStep, setForgotStep]               = useState<"email" | "otp">("email");
  const [forgotOtp, setForgotOtp]                 = useState("");
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
  const [forgotNewPass, setForgotNewPass]         = useState("");
  const [forgotConfPass, setForgotConfPass]       = useState("");
  const [forgotResetDone, setForgotResetDone]     = useState(false);
  const [forgotLoading, setForgotLoading]         = useState(false);
  const [forgotError, setForgotError]             = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate(user?.is_admin ? "/admin" : "/", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const fillDemo = (card: DemoCard) => {
    setEmail(card.email);
    setPassword(card.password);
    setMode("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(false);
    try {
      const result = await login(email, password);
      if (!result.success) {
        toast({ title: "Sign in failed", description: "Incorrect email or password.", variant: "destructive" });
        return;
      }
      if (result.requires2FA) {
        setTfaTempToken(result.tempToken);
        setTfaCode("");
        setTfaError("");
        setMode("2fa");
        return;
      }
      if (result.needsVerification) {
        setNeedsVerification(true);
        toast({ title: "Signed in", description: "Please verify your email to post projects." });
      } else {
        toast({ title: "Welcome back!", description: "You're now signed in to ProjectHub." });
      }
    } catch {
      toast({ title: "Sign in failed", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tfaCode.length < 6) { setTfaError("Enter the 6-digit code from your app."); return; }
    setTfaLoading(true);
    setTfaError("");
    try {
      const result = await complete2faLogin(tfaTempToken, tfaCode);
      if (!result.success) { setTfaError("Invalid code. Please try again."); return; }
      toast({ title: "Welcome back!", description: "You're now signed in to ProjectHub." });
    } catch {
      setTfaError("Something went wrong. Please try again.");
    } finally {
      setTfaLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Verification email sent!", description: "Please check your inbox." });
      } else {
        toast({ title: "Failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", description: "Network error.", variant: "destructive" });
    }
    setResending(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
    } catch {
      // Always proceed — don't reveal if email exists
    } finally {
      setForgotLoading(false);
      setForgotStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (forgotOtp.length !== 6) { setForgotError("Please enter the complete 6-digit OTP."); return; }
    setForgotLoading(true);
    try {
      await api.post("/auth/verify-otp", { email: forgotEmail, otp: forgotOtp });
      setForgotOtpVerified(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "OTP is invalid or has expired. Request a new one.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (forgotOtp.length !== 6) { setForgotError("Please enter the 6-digit OTP."); return; }
    if (forgotNewPass.length < 6) { setForgotError("Password must be at least 6 characters."); return; }
    if (forgotNewPass !== forgotConfPass) { setForgotError("Passwords do not match."); return; }
    setForgotLoading(true);
    try {
      await api.post("/auth/reset-password", { email: forgotEmail, otp: forgotOtp, password: forgotNewPass });
      setForgotResetDone(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "OTP is invalid or has expired. Request a new one.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const ok = await signup(name, email, password);
    if (ok) {
      toast({ title: "Account created!", description: "Please Sign In with your credentials." });
      setMode("login");
      setName("");
      setPassword("");
    } else {
      toast({ title: "Email already taken", description: "Try signing in instead.", variant: "destructive" });
    }
    setLoading(false);
  };

  const resetForgot = () => {
    setMode("login");
    setForgotStep("email");
    setForgotResetDone(false);
    setForgotOtp("");
    setForgotOtpVerified(false);
    setForgotNewPass("");
    setForgotConfPass("");
    setForgotError("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Left panel – branding ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-8 relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, hsl(var(--primary)) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, #7c3aed 0%, transparent 45%),
            radial-gradient(circle at 60% 10%, #0ea5e9 0%, transparent 40%)
          `,
          opacity: 0.22,
        }} />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/15 backdrop-blur">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">ProjectHub</span>
          </Link>

          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              Connect with<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">
                Global Experts.
              </span>
              <br />Build anything.
            </h2>
            <p className="mt-3 text-white/55 text-sm leading-relaxed max-w-xs">
              Work with trusted professionals across every domain — with full payment protection.
            </p>
            <ul className="mt-6 space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10">
                    <Icon className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <span className="text-sm text-white/70">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/25">© {new Date().getFullYear()} ProjectHub. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ProjectHub</span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                {mode === "login"  && <LogIn    className="h-5 w-5 text-primary" />}
                {mode === "signup" && <UserPlus className="h-5 w-5 text-primary" />}
                {mode === "forgot" && <KeyRound className="h-5 w-5 text-primary" />}
                {mode === "2fa"    && <Shield   className="h-5 w-5 text-primary" />}
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {mode === "login"  ? "Sign In"
                : mode === "signup" ? "Create Account"
                : mode === "2fa"    ? "Two-Factor Verification"
                : "Reset Password"}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {mode === "forgot" ? (
                <button type="button" onClick={resetForgot}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                  <ArrowLeft className="h-3 w-3" /> Back to Sign In
                </button>
              ) : (
                <>
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button type="button"
                    onClick={() => { setMode(mode === "login" ? "signup" : "login"); setEmail(""); setPassword(""); setName(""); }}
                    className="font-medium text-primary hover:underline">
                    {mode === "login" ? "Create one" : "Sign In"}
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Email not verified banner */}
          {needsVerification && (
            <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/8 p-3">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Your email is not verified.{" "}
                <button type="button" onClick={handleResendVerification} disabled={resending}
                  className="font-semibold underline hover:no-underline disabled:opacity-50">
                  {resending ? "Sending…" : "Resend email"}
                </button>
              </p>
            </div>
          )}

          {/* ── 2FA ── */}
          {mode === "2fa" && (
            <form onSubmit={handle2faSubmit} className="space-y-3">
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                Open your authenticator app and enter the <span className="font-semibold text-foreground">6-digit code</span>.
                Or use a backup code <span className="font-mono">(XXXX-XXXX-XXXX)</span>.
              </div>
              {tfaError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/8 p-2.5">
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{tfaError}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Authenticator code</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={tfaCode} onChange={(val) => { setTfaCode(val); setTfaError(""); }}>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2 h-9" disabled={tfaLoading || tfaCode.length !== 6}>
                {tfaLoading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Verifying…</> : <>Verify &amp; Sign In <ArrowRight className="h-4 w-4" /></>}
              </Button>
              <p className="text-center text-xs">
                <button type="button" onClick={() => { setMode("login"); setTfaTempToken(""); setTfaCode(""); setTfaError(""); }}
                  className="text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back to Sign In
                </button>
              </p>
            </form>
          )}

          {/* ── Forgot password ── */}
          {mode === "forgot" && (
            <div>
              {forgotResetDone ? (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5 text-center space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 mx-auto">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">Password Reset Successfully!</p>
                  <p className="text-xs text-muted-foreground">You can now Sign In with your new password.</p>
                  <Button type="button" className="gap-2 h-9 text-sm" onClick={resetForgot}>
                    Sign In Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

              ) : forgotStep === "otp" ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                    We sent a <span className="font-semibold text-foreground">6-digit OTP</span> to{" "}
                    <span className="font-semibold text-foreground">{forgotEmail}</span>. Check your inbox.
                  </div>
                  {forgotError && (
                    <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/8 p-2.5">
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-xs text-destructive">{forgotError}</p>
                    </div>
                  )}
                  {!forgotOtpVerified ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Enter OTP</Label>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={forgotOtp} onChange={(val) => { setForgotOtp(val); setForgotError(""); }}>
                            <InputOTPGroup>
                              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>
                      <Button type="submit" className="w-full gap-2 h-9" disabled={forgotLoading || forgotOtp.length !== 6}>
                        {forgotLoading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Verifying...</> : <>Verify OTP <ArrowRight className="h-4 w-4" /></>}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        Didn't receive it?{" "}
                        <button type="button" onClick={() => { setForgotStep("email"); setForgotOtp(""); setForgotError(""); }} className="text-primary hover:underline">Send again</button>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpReset} className="space-y-3">
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">OTP verified! Set your new password.</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="otp-new-pass" className="text-xs">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="otp-new-pass" type="password" placeholder="Min. 6 characters" value={forgotNewPass} onChange={(e) => setForgotNewPass(e.target.value)} className="pl-10 h-9" required autoFocus />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="otp-conf-pass" className="text-xs">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="otp-conf-pass" type="password" placeholder="Repeat your password" value={forgotConfPass} onChange={(e) => setForgotConfPass(e.target.value)} className="pl-10 h-9" required />
                        </div>
                        {forgotConfPass.length > 0 && (
                          <p className={`text-xs font-medium ${forgotNewPass === forgotConfPass ? "text-emerald-500" : "text-destructive"}`}>
                            {forgotNewPass === forgotConfPass ? "✓ Passwords match" : "✗ Passwords do not match"}
                          </p>
                        )}
                      </div>
                      <Button type="submit" className="w-full gap-2 h-9" disabled={forgotLoading}>
                        {forgotLoading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Resetting...</> : <>Reset Password <ArrowRight className="h-4 w-4" /></>}
                      </Button>
                    </form>
                  )}
                </div>

              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <p className="text-xs text-muted-foreground">Enter your registered email and we'll send you a 6-digit OTP.</p>
                  <div className="space-y-1">
                    <Label htmlFor="forgot-email" className="text-xs">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="pl-10 h-9" required autoFocus />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2 h-9" disabled={forgotLoading}>
                    {forgotLoading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Sending OTP...</> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ── Login / Signup form ── */}
          {mode !== "forgot" && mode !== "2fa" && (
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" type="text" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11" required autoFocus />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" required autoFocus={mode === "login"} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button type="button" onClick={() => { setMode("forgot"); setForgotEmail(email); setForgotStep("email"); }}
                      className="text-xs text-primary hover:underline">Forgot password?</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms</Link>{" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              )}
              <Button type="submit" size="lg" className="w-full gap-2 h-11 mt-1" disabled={loading}>
                {loading
                  ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
                  : <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" /></>
                }
              </Button>
            </form>
          )}

          {/* Demo credentials */}
          {mode !== "forgot" && mode !== "2fa" && (
            <div className="mt-5">
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground whitespace-nowrap">
                  Demo Accounts
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {DEMO_CARDS.map((card) => (
                  <button key={card.email} type="button" onClick={() => fillDemo(card)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${card.color}`}>
                      {card.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{card.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{card.email}</p>
                    </div>
                    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${card.color}`}>{card.tag}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">Click to auto-fill credentials</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserLogin;
