import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, IndianRupee, Lock } from "lucide-react";

/* ── Razorpay global type ── */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => { open(): void };
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  amount: number;          // agreed bid amount in ₹
  freelancerName: string;
  onPaymentSuccess: () => void;
  userName?: string;
  userEmail?: string;
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

const PaymentModal = ({
  isOpen, onClose,
  projectId, projectTitle,
  amount, freelancerName,
  onPaymentSuccess,
  userName, userEmail,
}: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      /* 1. Load Razorpay checkout.js */
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({
          title: "Payment Error",
          description: "Could not load payment gateway. Check your internet connection.",
          variant: "destructive",
        });
        return;
      }

      /* 2. Create Razorpay order on our server */
      const order = await api.post<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>("/payments/create-order", { projectId });

      /* 3. Open Razorpay checkout popup */
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "ProjectHub",
        description: `Payment for: ${projectTitle}`,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          /* 4. Verify payment on our server */
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              projectId,
            });
            toast({
              title: "Payment Successful!",
              description: `₹${amount.toLocaleString("en-IN")} paid. Project is now in progress.`,
            });
            onPaymentSuccess();
            onClose();
          } catch {
            toast({
              title: "Verification Failed",
              description: "Payment was captured but verification failed. Contact support with your payment ID.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userName || "",
          email: userEmail || "",
          contact: "9999999999",
        },
        theme: { color: "#6366f1" },
        config: {
          display: {
            sequence: ["upi", "card", "netbanking", "wallet"],
            preferences: { show_default_blocks: true },
          },
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment cancelled",
              description: "You can pay anytime to start the project.",
              variant: "destructive",
            });
            setLoading(false);
          },
          escape: true,
          animation: true,
        },
        "payment.failed": (response: {
          error: { code: string; description: string; reason: string; source: string; step: string };
        }) => {
          console.error("Razorpay payment failed:", response.error);
          toast({
            title: "Payment Failed",
            description: response.error.description || "Payment failed. Please try again with test credentials.",
            variant: "destructive",
          });
          setLoading(false);
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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Payment summary */}
          <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Project</span>
              <span className="font-medium text-foreground text-right max-w-[55%] line-clamp-1">
                {projectTitle}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Expert</span>
              <span className="font-medium text-foreground">{freelancerName}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold text-foreground text-sm">Total Amount</span>
              <span className="font-bold text-foreground text-lg flex items-center gap-0.5">
                <IndianRupee className="h-4 w-4" />
                {amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 rounded-lg bg-green-500/5 border border-green-500/20 p-3">
            <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Payment is secured by <span className="font-semibold text-foreground">Razorpay</span>.
              Funds are held safely until you mark the project as complete.
            </p>
          </div>

          {/* Supported methods */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>UPI · Cards · Net Banking · Wallets</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handlePay}
              disabled={loading}
            >
              <CreditCard className="h-4 w-4" />
              {loading ? "Opening…" : `Pay ₹${amount.toLocaleString("en-IN")}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
