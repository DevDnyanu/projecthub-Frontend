import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  freelancerName: string;
  onRated: (stars: number, comment: string) => void;
}

const RatingModal = ({ isOpen, onClose, projectId, freelancerName, onRated }: Props) => {
  const { toast } = useToast();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleSubmit = async () => {
    if (stars === 0) {
      toast({ title: "Select a rating", description: "Please choose at least 1 star.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/ratings", { projectId, stars, comment });
      toast({ title: "Rating submitted!", description: `You rated ${freelancerName} ${stars} star${stars > 1 ? "s" : ""}.` });
      onRated(stars, comment);
      onClose();
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10">
            <Star className="h-7 w-7 text-yellow-500 fill-yellow-500" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Rate the Freelancer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How was your experience working with <span className="font-semibold text-foreground">{freelancerName}</span>?
          </p>
        </div>

        {/* Stars */}
        <div className="mb-2 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(n)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-10 w-10 transition-colors ${
                  n <= (hovered || stars)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Star label */}
        <p className="mb-5 text-center text-sm font-semibold text-yellow-500 h-5">
          {labels[hovered || stars]}
        </p>

        {/* Comment */}
        <Textarea
          placeholder="Share your experience (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-5 resize-none"
          rows={3}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={handleSubmit}
            disabled={loading || stars === 0}
          >
            {loading ? "Submitting…" : "Submit Rating"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
