import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  CheckCircle2, Star, TrendingUp, Shield, ArrowLeft,
  Briefcase, LogIn, UserPlus, KeyRound, XCircle,
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const PERKS = [
  { icon: TrendingUp, text: "10,000+ live projects daily" },
  { icon: Star, text: "Top-rated verified freelancers" },
  { icon: Shield, text: "100% payment protection" },
  { icon: CheckCircle2, text: "Free to join & browse" },
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
  const { login, signup, isLoggedIn, user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);

  // Forgot password — OTP flow
  const [forgotEmail, setForgotEmail]         = useState("");
  const [forgotStep, setForgotStep]           = useState<"email" | "otp">("email");
  const [forgotOtp, setForgotOtp]             = useState("");
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
  const [forgotNewPass, setForgotNewPass]     = useState("");
  const [forgotConfPass, setForgotConfPass]   = useState("");
  const [forgotResetDone, setForgotResetDone] = useState(false);
  const [forgotLoading, setForgotLoading]     = useState(false);
  const [forgotError, setForgotError]         = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      // Admin users go directly to the dashboard
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
      if (result.success) {
        if (result.needsVerification) {
          setNeedsVerification(true);
          toast({
            title: "Signed in",
            description: "Please verify your email to post projects.",
          });
        } else {
          toast({ title: "Welcome back!", description: "You're now signed in to ProjectHub." });
        }
      } else {
        toast({ title: "Sign in failed", description: "Incorrect email or password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Sign in failed", description: "Network error. Please try again.", variant: "destructive" });
    }
    setLoading(false);
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
      // Always proceed to OTP step — don't reveal if email exists
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
      toast({ title: "Account created!", description: "Please sign in with your credentials." });
      setMode("login");
      setName("");
      setPassword("");
    } else {
      toast({ title: "Email already taken", description: "Try signing in instead.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* ── Left panel – branding ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">ProjectHub</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            India's #1<br />Freelance<br />Marketplace
          </h2>
          <p className="mt-4 text-primary-foreground/70 text-lg">
            Connect with top talent or find your next big project.
          </p>
          <ul className="mt-10 space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-primary-foreground/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/40">© 2025 ProjectHub. All rights reserved.</p>
      </div>

      {/* ── Right panel – form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 bg-background">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ProjectHub</span>
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                {mode === "login"  && <LogIn     className="h-5 w-5 text-primary" />}
                {mode === "signup" && <UserPlus  className="h-5 w-5 text-primary" />}
                {mode === "forgot" && <KeyRound  className="h-5 w-5 text-primary" />}
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {mode === "login"  ? "Sign in to your account"
                : mode === "signup" ? "Create your account"
                : "Reset your password"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "forgot" ? (
                <button
                  type="button"
                  onClick={() => { setMode("login"); setForgotStep("email"); setForgotResetDone(false); setForgotOtp(""); setForgotOtpVerified(false); setForgotNewPass(""); setForgotConfPass(""); setForgotError(""); }}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to sign in
                </button>
              ) : (
                <>
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => { setMode(mode === "login" ? "signup" : "login"); setEmail(""); setPassword(""); setName(""); }}
                    className="font-medium text-primary hover:underline"
                  >
                    {mode === "login" ? "Sign up for free" : "Sign in"}
                  </button>
                </>
              )}
            </p>
          </div>

          {needsVerification && (
            <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Your email address is not verified yet.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="mt-2 text-xs font-semibold text-yellow-600 underline hover:no-underline disabled:opacity-50"
              >
                {resending ? "Sending…" : "Resend verification email"}
              </button>
            </div>
          )}

          {/* ── Forgot password — OTP flow ── */}
          {mode === "forgot" && (
            <div>
              {/* Success */}
              {forgotResetDone ? (
                <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20 mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-semibold text-foreground">Password Reset Successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                  <Button
                    type="button"
                    className="mt-2 gap-2"
                    onClick={() => { setMode("login"); setForgotStep("email"); setForgotResetDone(false); setForgotOtp(""); setForgotOtpVerified(false); setForgotNewPass(""); setForgotConfPass(""); setForgotError(""); }}
                  >
                    Sign In Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

              ) : forgotStep === "otp" ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                    We sent a <span className="font-semibold text-foreground">6-digit OTP</span> to{" "}
                    <span className="font-semibold text-foreground">{forgotEmail}</span>.
                    Check your inbox (and spam folder).
                  </div>

                  {forgotError && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{forgotError}</p>
                    </div>
                  )}

                  {/* Sub-step A — Verify OTP */}
                  {!forgotOtpVerified ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Enter OTP</Label>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={forgotOtp} onChange={(val) => { setForgotOtp(val); setForgotError(""); }}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full gap-2" disabled={forgotLoading || forgotOtp.length !== 6}>
                        {forgotLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Verifying...
                          </span>
                        ) : (
                          <>Verify OTP <ArrowRight className="h-4 w-4" /></>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        Didn't receive it?{" "}
                        <button
                          type="button"
                          onClick={() => { setForgotStep("email"); setForgotOtp(""); setForgotError(""); }}
                          className="text-primary hover:underline"
                        >
                          Send OTP again
                        </button>
                      </p>
                    </form>

                  ) : (
                    /* Sub-step B — OTP verified, set new password */
                    <form onSubmit={handleOtpReset} className="space-y-4">
                      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <p className="text-sm font-medium text-success">OTP verified! Now set your new password.</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="otp-new-pass">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="otp-new-pass"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={forgotNewPass}
                            onChange={(e) => setForgotNewPass(e.target.value)}
                            className="pl-10"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="otp-conf-pass">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="otp-conf-pass"
                            type="password"
                            placeholder="Repeat your password"
                            value={forgotConfPass}
                            onChange={(e) => setForgotConfPass(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {forgotConfPass.length > 0 && (
                          <p className={`text-xs font-medium ${forgotNewPass === forgotConfPass ? "text-success" : "text-destructive"}`}>
                            {forgotNewPass === forgotConfPass ? "✓ Passwords match" : "✗ Passwords do not match"}
                          </p>
                        )}
                      </div>

                      <Button type="submit" size="lg" className="w-full gap-2" disabled={forgotLoading}>
                        {forgotLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Resetting...
                          </span>
                        ) : (
                          <>Reset Password <ArrowRight className="h-4 w-4" /></>
                        )}
                      </Button>
                    </form>
                  )}
                </div>

              ) : (
                /* Step 1 — Enter email */
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your registered email and we'll send you a 6-digit OTP to reset your password.
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2" disabled={forgotLoading}>
                    {forgotLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending OTP...
                      </span>
                    ) : (
                      <>Send OTP <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ── Login / Signup form ── */}
          {mode !== "forgot" && (
          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus={mode === "login"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setForgotEmail(email); setForgotSent(false); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>{" "}
                and{" "}
                <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            )}

            <Button type="submit" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          )} {/* end login/signup form conditional */}

          {/* Demo credentials */}
          {mode !== "forgot" && (
          <div className="mt-6">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground whitespace-nowrap">
                Demo Accounts
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-2">
              {DEMO_CARDS.map((card) => (
                <button
                  key={card.email}
                  type="button"
                  onClick={() => fillDemo(card)}
                  className="rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${card.color}`}>
                      {card.initial}
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${card.color}`}>
                      {card.tag}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{card.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{card.email}</p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Click any card to auto-fill credentials
            </p>
          </div>
          )} {/* end demo credentials conditional */}

        </div>
      </div>
    </div>
  );
};

export default UserLogin;
