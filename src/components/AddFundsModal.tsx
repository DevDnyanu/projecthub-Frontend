import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ShieldCheck, IndianRupee, Lock } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => { open(): void };
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  userName?: string;
  userEmail?: string;
}

const AddFundsModal = ({ isOpen, onClose, onSuccess, userName, userEmail }: Props) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleAddFunds = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) {
      toast({ title: "Invalid amount", description: "Minimum deposit is ₹100", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: "Payment Error", description: "Could not load payment gateway.", variant: "destructive" });
        return;
      }

      const order = await api.post<{ orderId: string; amount: number; currency: string; keyId: string }>(
        "/wallet/deposit",
        { amount: amt },
      );

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "ProjectHub",
        description: `Add ₹${amt.toLocaleString("en-IN")} to Wallet`,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await api.post<{ balance: number; amount: number }>(
              "/wallet/deposit/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            );
            setPaymentSuccess(true);
            toast({
              title: "Wallet Funded!",
              description: `₹${result.amount.toLocaleString("en-IN")} added to your wallet.`,
            });
            onSuccess(result.balance);
            onClose();
          } catch {
            toast({
              title: "Verification Failed",
              description: "Payment captured but verification failed. Contact support.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: userName || "", email: userEmail || "" },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            if (!paymentSuccess) {
              toast({ title: "Payment cancelled", variant: "destructive" });
            }
            setLoading(false);
          },
        },
      });

      rzp.open();
    } catch (err) {
      toast({
        title: "Failed to initiate payment",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setPaymentSuccess(false); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Add Funds to Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Quick amounts */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick select</Label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className={`rounded-lg border py-2 text-sm font-semibold transition-all ${
                    amount === String(q)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  ₹{q.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="amount" className="text-sm">Custom Amount</Label>
            <div className="relative mt-1.5">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (min ₹100)"
                className="pl-9"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={100}
              />
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 rounded-lg bg-green-500/5 border border-green-500/20 p-3">
            <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Secured by <span className="font-semibold text-foreground">Razorpay</span>.
              Funds added to your wallet can be used to hire experts.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>UPI · Cards · Net Banking · Wallets</span>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button className="flex-1 gap-2" onClick={handleAddFunds} disabled={loading || !amount}>
              <Wallet className="h-4 w-4" />
              {loading ? "Opening…" : `Add ₹${Number(amount || 0).toLocaleString("en-IN")}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsModal;
