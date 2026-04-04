import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Lock, Unlock,
  ShieldCheck, IndianRupee, CreditCard, Smartphone,
  Building2, CheckCircle2, AlertTriangle, ArrowRight,
  Clock, Star, HelpCircle,
} from "lucide-react";

/* ── Small helpers ── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">{children}</p>
);

const StepCard = ({
  step, icon: Icon, title, desc, color = "bg-primary/10 text-primary border-primary/20",
}: {
  step: number; icon: React.ElementType; title: string; desc: string; color?: string;
}) => (
  <div className="relative flex items-start gap-4">
    <div className="flex flex-col items-center shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
        {step}
      </div>
      <div className="mt-2 w-0.5 flex-1 min-h-[40px] bg-border" />
    </div>
    <div className={`rounded-xl border p-5 flex-1 mb-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <p className="font-semibold text-sm text-foreground">{title}</p>
      </div>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </div>
);

const InfoCard = ({
  icon: Icon, title, desc, color,
}: {
  icon: React.ElementType; title: string; desc: string; color: string;
}) => (
  <div className={`rounded-xl border p-5 space-y-2 ${color}`}>
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/50">
      <Icon className="h-4.5 w-4.5" />
    </div>
    <p className="font-semibold text-sm text-foreground">{title}</p>
    <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

/* ══════════════════════════════════════════════════════ */
const WalletGuide = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-16">

      {/* ── Hero ── */}
      <div className="text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Wallet &amp; Payments Guide
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          Everything you need to know about adding money, escrow protection, and withdrawing your earnings on ProjectHub.
        </p>
        {isLoggedIn && (
          <Button className="gap-2 mt-2" onClick={() => navigate("/wallet")}>
            <Wallet className="h-4 w-4" />
            Go to My Wallet
          </Button>
        )}
      </div>

      {/* ── Overview cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard
          icon={ArrowDownLeft}
          title="Add Money"
          desc="Fund your wallet instantly via UPI, Cards, or Net Banking using Razorpay."
          color="border-green-500/20 bg-green-500/5"
        />
        <InfoCard
          icon={Lock}
          title="Escrow Protection"
          desc="Funds are locked safely when you hire an expert. Released only when work is confirmed."
          color="border-yellow-500/20 bg-yellow-500/5"
        />
        <InfoCard
          icon={ArrowUpRight}
          title="Withdraw Earnings"
          desc="Freelancers can withdraw wallet balance to their bank account anytime (₹100 minimum)."
          color="border-blue-500/20 bg-blue-500/5"
        />
      </div>

      {/* ── HOW TO ADD MONEY ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <SectionLabel>For Clients</SectionLabel>
            <h2 className="text-xl font-bold text-foreground -mt-3">How to Add Money to Your Wallet</h2>
          </div>
        </div>

        <div className="space-y-0">
          <StepCard
            step={1} icon={Wallet} title='Go to "My Wallet"'
            desc='Click your wallet balance in the top navbar, or open the user dropdown and select "My Wallet". You can also go to /wallet directly.'
            color="border-border bg-card"
          />
          <StepCard
            step={2} icon={IndianRupee} title='Click "Add Funds"'
            desc='Tap the green "Add Funds" button. You can choose a quick amount (₹500, ₹1000, ₹2000, ₹5000) or enter a custom amount. Minimum deposit is ₹100.'
            color="border-border bg-card"
          />
          <StepCard
            step={3} icon={CreditCard} title="Complete Payment via Razorpay"
            desc="A secure Razorpay popup opens. Choose your preferred payment method — UPI (GPay, PhonePe, Paytm), Credit/Debit Card, or Net Banking. Enter your payment details and confirm."
            color="border-border bg-card"
          />
          <StepCard
            step={4} icon={CheckCircle2} title="Wallet Funded Instantly"
            desc='The amount is credited to your ProjectHub wallet within seconds. You will see the updated balance on your wallet page and in the top navbar. You are now ready to hire experts!'
            color="border-green-500/20 bg-green-500/5"
          />
        </div>

        {/* Payment methods */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Accepted Payment Methods</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Smartphone, label: "UPI",         sub: "GPay, PhonePe, Paytm",   color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
              { icon: CreditCard, label: "Debit Card",  sub: "Visa, Mastercard, RuPay", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { icon: CreditCard, label: "Credit Card", sub: "All major banks",          color: "text-green-500 bg-green-500/10 border-green-500/20" },
              { icon: Building2,  label: "Net Banking", sub: "50+ Indian banks",         color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border p-3.5 space-y-2 ${m.color}`}>
                <m.icon className="h-5 w-5" />
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-[11px] text-muted-foreground">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESCROW SECTION ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <ShieldCheck className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <SectionLabel>Payment Protection</SectionLabel>
            <h2 className="text-xl font-bold text-foreground -mt-3">How Escrow Works</h2>
          </div>
        </div>

        {/* Escrow flow visual */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground mb-4">Escrow Flow</p>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            {[
              { label: "Client Wallet",       sub: "Funds available",          color: "bg-green-500/10 border-green-500/20 text-green-600",   icon: Wallet },
              { label: "Escrow Locked",        sub: "Bid accepted",             color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600", icon: Lock },
              { label: "Work In Progress",     sub: "Task active",              color: "bg-blue-500/10 border-blue-500/20 text-blue-600",      icon: Clock },
              { label: "Payment Released",     sub: "Work confirmed complete",  color: "bg-primary/10 border-primary/20 text-primary",         icon: Unlock },
              { label: "Expert Wallet",    sub: "Earnings received",        color: "bg-green-500/10 border-green-500/20 text-green-600",   icon: Wallet },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex sm:flex-col items-center gap-2 flex-1">
                <div className={`rounded-xl border p-3 text-center flex-1 w-full ${item.color}`}>
                  <item.icon className="h-4 w-4 mx-auto mb-1.5" />
                  <p className="text-[12px] font-semibold leading-tight">{item.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{item.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 sm:rotate-90" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Escrow statuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              status: "Pending",     color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-600",
              icon: Clock,
              desc: "Escrow is created. Funds are locked from client wallet. Task has not started yet.",
            },
            {
              status: "In Progress", color: "border-blue-500/20 bg-blue-500/5 text-blue-600",
              icon: Lock,
              desc: "Expert has submitted work or task is active. Funds remain locked securely.",
            },
            {
              status: "Released",    color: "border-green-500/20 bg-green-500/5 text-green-600",
              icon: Unlock,
              desc: "Both client and admin confirmed work is complete. Payment sent to expert wallet.",
            },
            {
              status: "Disputed",    color: "border-red-500/20 bg-red-500/5 text-red-600",
              icon: AlertTriangle,
              desc: "Client or expert raised a dispute. Funds stay locked until admin resolves the case.",
            },
          ].map((s) => (
            <div key={s.status} className={`rounded-xl border p-4 space-y-1.5 ${s.color}`}>
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4 shrink-0" />
                <p className="text-sm font-semibold text-foreground">{s.status}</p>
              </div>
              <p className="text-[13px] text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW TO WITHDRAW ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <SectionLabel>For Experts</SectionLabel>
            <h2 className="text-xl font-bold text-foreground -mt-3">How to Withdraw Your Earnings</h2>
          </div>
        </div>

        <div className="space-y-0">
          <StepCard
            step={1} icon={CheckCircle2} title="Complete a Project"
            desc="Finish the task and mark it as complete. Once the client and admin both confirm, the escrow payment is automatically released to your ProjectHub wallet."
            color="border-border bg-card"
          />
          <StepCard
            step={2} icon={Wallet} title="Check Your Wallet Balance"
            desc='Go to "My Wallet" from the navbar. You will see the released payment in your wallet balance and in the transaction history as "Escrow Released".'
            color="border-border bg-card"
          />
          <StepCard
            step={3} icon={ArrowUpRight} title='Click "Withdraw"'
            desc="Tap the Withdraw button on your wallet page. Enter the amount you want to withdraw (minimum ₹100). Make sure the amount doesn't exceed your available balance."
            color="border-border bg-card"
          />
          <StepCard
            step={4} icon={Building2} title="Funds Credited to Bank"
            desc="The withdrawal is processed and credited to your registered bank account within 2–3 business days. You will receive a notification confirming the withdrawal."
            color="border-blue-500/20 bg-blue-500/5"
          />
        </div>

        {/* Withdrawal rules */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Withdrawal Rules</p>
          <ul className="space-y-2.5">
            {[
              { ok: true,  text: "Minimum withdrawal amount: ₹100" },
              { ok: true,  text: "Maximum withdrawal: your full available wallet balance" },
              { ok: true,  text: "Processing time: 2–3 business days" },
              { ok: true,  text: "You can withdraw multiple times — no limit on frequency" },
              { ok: false, text: "Funds locked in escrow cannot be withdrawn until escrow is released" },
              { ok: false, text: "Disputed escrow funds are frozen until admin resolves the case" },
            ].map((r) => (
              <li key={r.text} className="flex items-start gap-2.5">
                {r.ok
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                }
                <span className="text-[13px] text-muted-foreground">{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Disputes ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <SectionLabel>Problem Resolution</SectionLabel>
            <h2 className="text-xl font-bold text-foreground -mt-3">Refunds &amp; Disputes</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: ArrowUpRight, title: "Before Work Starts",
              desc: "If a project is cancelled before the expert begins work, the full escrow amount is refunded to the client's wallet instantly.",
              color: "border-green-500/20 bg-green-500/5",
            },
            {
              icon: AlertTriangle, title: "Raise a Dispute",
              desc: "If there is a disagreement, either party can raise a dispute from the project detail page. Funds stay frozen until admin reviews and decides.",
              color: "border-yellow-500/20 bg-yellow-500/5",
            },
            {
              icon: ShieldCheck, title: "Admin Decision",
              desc: "Admin reviews evidence from both parties and can: fully release to freelancer, fully refund to client, or split the amount between both.",
              color: "border-blue-500/20 bg-blue-500/5",
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl border p-4 space-y-2 ${item.color}`}>
              <item.icon className="h-5 w-5 text-foreground" />
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-xl font-bold text-foreground -mt-3">Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Is my money safe in the ProjectHub wallet?",
              a: "Yes. All payments are processed by Razorpay, India's most trusted payment gateway. Your wallet balance is held securely and protected by escrow when used for hiring.",
            },
            {
              q: "Can I get a refund if I am not happy with the work?",
              a: "If the expert has not started work yet, your full escrow amount is refunded automatically. If work has started, you can raise a dispute and admin will review your case fairly.",
            },
            {
              q: "How long does it take to add money to my wallet?",
              a: "UPI and Card payments are credited to your wallet instantly (within seconds). If there is a delay, contact support with your Razorpay payment ID.",
            },
            {
              q: "Can I withdraw money that is locked in escrow?",
              a: "No. Escrow funds are locked until the project is confirmed complete (for experts) or until a dispute is resolved. Only your available wallet balance can be withdrawn.",
            },
            {
              q: "What is the minimum amount I need in my wallet to hire an expert?",
              a: "You need at least the full bid amount in your wallet before you can accept a bid. For example, if an expert bids ₹5000, you need ₹5000 in your wallet.",
            },
            {
              q: "As an expert, when do I receive my payment?",
              a: "Payment is released to your wallet automatically as soon as both you (by submitting work) and the client confirm the project is complete. You can then withdraw to your bank anytime.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">{item.q}</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
          <Star className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Ready to Get Started?</h3>
        <p className="text-[13px] text-muted-foreground max-w-md mx-auto">
          Add funds to your wallet and start hiring top Indian freelancers with full payment protection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <Button
            className="gap-2"
            onClick={() => navigate(isLoggedIn ? "/wallet" : "/login")}
          >
            <Wallet className="h-4 w-4" />
            {isLoggedIn ? "Open My Wallet" : "Sign In to Add Funds"}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/how-it-works")}>
            How It Works
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default WalletGuide;
