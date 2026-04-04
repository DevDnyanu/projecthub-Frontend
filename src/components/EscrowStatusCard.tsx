import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shield, Clock, CheckCircle2, AlertTriangle, IndianRupee, Lock } from "lucide-react";

interface Escrow {
  _id: string;
  amount: number;
  status: "pending" | "in_progress" | "released" | "disputed" | "refunded";
  disputeReason?: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  isClient: boolean;
  isFreelancer: boolean;
}

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",  icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20",       icon: Lock },
  released:    { label: "Released",    color: "bg-green-500/10 text-green-500 border-green-500/20",    icon: CheckCircle2 },
  disputed:    { label: "Disputed",    color: "bg-red-500/10 text-red-500 border-red-500/20",          icon: AlertTriangle },
  refunded:    { label: "Refunded",    color: "bg-muted text-muted-foreground border-border",          icon: CheckCircle2 },
};

const EscrowStatusCard = ({ projectId, isClient, isFreelancer }: Props) => {
  const { toast } = useToast();
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchEscrow = async () => {
    try {
      const data = await api.get<Escrow>(`/escrow/${projectId}`);
      setEscrow(data);
    } catch {
      setEscrow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEscrow(); }, [projectId]);

  const handleRaiseDispute = async () => {
    if (disputeReason.trim().length < 20) {
      toast({ title: "Too short", description: "Please provide at least 20 characters.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/escrow/${projectId}/dispute`, { reason: disputeReason });
      toast({ title: "Dispute Raised", description: "Admin has been notified and will review your case." });
      setShowDisputeForm(false);
      fetchEscrow();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to raise dispute", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!escrow) return null;

  const cfg = STATUS_CONFIG[escrow.status];
  const Icon = cfg.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Escrow</p>
            <p className="text-[11px] text-muted-foreground">Payment Protection</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.color}`}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </span>
      </div>

      {/* Amount */}
      <div className="rounded-lg bg-muted/40 border border-border p-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Locked Amount</span>
        <span className="flex items-center gap-0.5 font-bold text-foreground">
          <IndianRupee className="h-4 w-4" />
          {escrow.amount.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Status description */}
      <div className="text-xs text-muted-foreground space-y-1">
        {escrow.status === "pending" && (
          <p>Funds are locked in escrow. Work has not started yet.</p>
        )}
        {escrow.status === "in_progress" && (
          <p>Task is active. Funds remain locked until work is confirmed complete.</p>
        )}
        {escrow.status === "released" && (
          <p>Payment released to expert on {escrow.releasedAt ? new Date(escrow.releasedAt).toLocaleDateString("en-IN") : "—"}.</p>
        )}
        {escrow.status === "disputed" && (
          <p>Dispute is under review by admin. Funds are locked until resolved.</p>
        )}
        {escrow.status === "refunded" && (
          <p>Escrow refunded to client on {escrow.refundedAt ? new Date(escrow.refundedAt).toLocaleDateString("en-IN") : "—"}.</p>
        )}
      </div>

      {/* Dispute button */}
      {(isClient || isFreelancer) && ["pending", "in_progress"].includes(escrow.status) && !showDisputeForm && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={() => setShowDisputeForm(true)}
        >
          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
          Raise a Dispute
        </Button>
      )}

      {/* Dispute form */}
      {showDisputeForm && (
        <div className="space-y-2.5 pt-1 border-t border-border">
          <p className="text-xs font-semibold text-destructive">Describe the issue</p>
          <Textarea
            placeholder="Explain the problem in detail (minimum 20 characters)..."
            rows={3}
            className="text-sm resize-none"
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDisputeForm(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={handleRaiseDispute} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Dispute"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowStatusCard;
