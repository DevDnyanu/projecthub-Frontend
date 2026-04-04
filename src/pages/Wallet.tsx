import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import AddFundsModal from "@/components/AddFundsModal";
import {
  Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight,
  Lock, Unlock, RotateCcw, IndianRupee, TrendingUp,
  ShieldCheck, Clock, Plus, Minus, AlertCircle,
} from "lucide-react";

interface WalletData {
  balance: number;
  currency: string;
}

interface Transaction {
  _id: string;
  type: "deposit" | "withdrawal" | "escrow_lock" | "escrow_release" | "refund";
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  createdAt: string;
  relatedProject?: { _id: string; title: string } | null;
}

const TX_CONFIG = {
  deposit:        { label: "Funds Added",      icon: ArrowDownLeft, color: "text-green-500",  bg: "bg-green-500/10",  sign: "+" },
  withdrawal:     { label: "Withdrawal",        icon: ArrowUpRight,  color: "text-red-500",    bg: "bg-red-500/10",    sign: "-" },
  escrow_lock:    { label: "Escrow Locked",     icon: Lock,          color: "text-amber-500",  bg: "bg-amber-500/10",  sign: "-" },
  escrow_release: { label: "Escrow Released",   icon: Unlock,        color: "text-blue-500",   bg: "bg-blue-500/10",   sign: "+" },
  refund:         { label: "Refund",            icon: RotateCcw,     color: "text-violet-500", bg: "bg-violet-500/10", sign: "+" },
};

const STATUS_STYLE = {
  completed: "bg-green-500/10 text-green-500",
  pending:   "bg-amber-500/10 text-amber-500",
  failed:    "bg-red-500/10 text-red-500",
};

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const [w, txs] = await Promise.all([
        api.get<WalletData>("/wallet"),
        api.get<Transaction[]>("/wallet/transactions"),
      ]);
      setWallet(w);
      setTransactions(txs);
    } catch {
      toast({ title: "Error", description: "Failed to load wallet data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt < 100) {
      toast({ title: "Invalid amount", description: "Minimum withdrawal is ₹100", variant: "destructive" });
      return;
    }
    if (wallet && amt > wallet.balance) {
      toast({ title: "Insufficient balance", description: `Your balance is ₹${wallet.balance.toLocaleString("en-IN")}`, variant: "destructive" });
      return;
    }
    setWithdrawLoading(true);
    try {
      const result = await api.post<{ balance: number }>("/wallet/withdraw", { amount: amt });
      toast({ title: "Withdrawal Initiated", description: `₹${amt.toLocaleString("en-IN")} will be credited to your bank within 2–3 business days.` });
      setWallet((prev) => prev ? { ...prev, balance: result.balance } : prev);
      setShowWithdraw(false);
      setWithdrawAmount("");
      fetchWallet();
    } catch (err) {
      toast({ title: "Withdrawal failed", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const totalDeposited = transactions.filter((t) => t.type === "deposit"        && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions.filter((t) => t.type === "withdrawal"     && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const inEscrow       = transactions.filter((t) => t.type === "escrow_lock"    && t.status === "completed").reduce((s, t) => s + t.amount, 0)
                       - transactions.filter((t) => ["escrow_release","refund"].includes(t.type) && t.status === "completed").reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const bal = wallet?.balance ?? 0;
  const balStr = bal.toLocaleString("en-IN");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-5">

      {/* ── Hero Balance Card ── */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20">
        {/* Light blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-primary to-sky-600" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 10% 50%, rgba(255,255,255,0.25) 0%, transparent 50%),
            radial-gradient(circle at 90% 20%, rgba(186,230,253,0.3) 0%, transparent 45%)
          `,
        }} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/15">
                  <WalletIcon className="h-4 w-4 text-white/80" />
                </div>
                <span className="text-sm font-medium text-white/60">ProjectHub Wallet</span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">{wallet?.currency || "INR"} · Available Balance</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Secured by</p>
              <div className="flex items-center gap-1 text-white/50">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium">Escrow Protection</span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-end gap-1.5 mb-6">
            <IndianRupee className="h-8 w-8 text-white mb-1" />
            <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
              {balStr}
            </span>
          </div>

          {/* Mini stats row */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-[11px] text-white/50">Added ₹{totalDeposited.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-[11px] text-white/50">In Escrow ₹{Math.max(0, inEscrow).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-[11px] text-white/50">Withdrawn ₹{totalWithdrawn.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 gap-2 bg-white text-slate-900 hover:bg-white/90 font-semibold h-11"
              onClick={() => setShowAddFunds(true)}
            >
              <Plus className="h-4 w-4" />
              Add Funds
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold h-11"
              onClick={() => setShowWithdraw(true)}
              disabled={!wallet || wallet.balance < 100}
            >
              <Minus className="h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">Total Added</span>
          </div>
          <p className="font-bold text-foreground text-lg leading-none">
            ₹{totalDeposited.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">In Escrow</span>
          </div>
          <p className="font-bold text-foreground text-lg leading-none">
            ₹{Math.max(0, inEscrow).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
              <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">Withdrawn</span>
          </div>
          <p className="font-bold text-foreground text-lg leading-none">
            ₹{totalWithdrawn.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── How Escrow Works ── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">How Escrow Works</p>
        </div>
        <div className="space-y-3">
          {[
            { step: "1", text: "Add funds to your wallet via Razorpay (UPI, Cards, Net Banking)." },
            { step: "2", text: "When you accept a bid, funds are automatically locked in Escrow." },
            { step: "3", text: "Funds stay locked while the expert works on the task." },
            { step: "4", text: "Once you confirm the work is complete, Escrow releases payment to the expert." },
            { step: "5", text: "Experts can withdraw their earnings to their bank account." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary mt-0.5">
                {item.step}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Transaction History</p>
          <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {transactions.length} total
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto mb-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add funds to get started with your first project.</p>
            <Button className="mt-4 gap-2 h-9 text-sm" onClick={() => setShowAddFunds(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Funds
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {transactions.map((tx) => {
              const cfg = TX_CONFIG[tx.type];
              const Icon = cfg.icon;
              const isCredit = cfg.sign === "+";
              const statusStyle = STATUS_STYLE[tx.status];
              return (
                <div key={tx._id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{cfg.label}</p>
                      {tx.status !== "completed" && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${statusStyle}`}>
                          {tx.status}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {tx.relatedProject ? tx.relatedProject.title : tx.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${isCredit ? "text-green-500" : "text-red-500"}`}>
                      {cfg.sign}₹{tx.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Funds Modal ── */}
      <AddFundsModal
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        onSuccess={(newBalance) => {
          setWallet((prev) => prev ? { ...prev, balance: newBalance } : prev);
          fetchWallet();
        }}
        userName={user?.name}
        userEmail={user?.email}
      />

      {/* ── Withdraw Modal ── */}
      <Dialog open={showWithdraw} onOpenChange={(open) => { if (!open) setShowWithdraw(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              Withdraw Funds
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Balance row */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">Available Balance</p>
                <p className="font-extrabold text-foreground text-lg flex items-center gap-0.5 mt-0.5">
                  <IndianRupee className="h-4 w-4" />
                  {bal.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <WalletIcon className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div>
              <Label htmlFor="w-amount" className="text-sm">Withdrawal Amount</Label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="w-amount"
                  type="number"
                  placeholder="Enter amount (min ₹100)"
                  className="pl-9 h-11"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={wallet?.balance}
                  min={100}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border p-3">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Funds will be credited to your registered bank account within 2–3 business days.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowWithdraw(false)} disabled={withdrawLoading}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleWithdraw} disabled={withdrawLoading}>
                {withdrawLoading ? "Processing…" : "Withdraw"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;
