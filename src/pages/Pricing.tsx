import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for getting started",
    color: "border-border",
    badge: null,
    features: [
      "Post up to 2 projects/month",
      "Place unlimited bids",
      "Basic profile page",
      "Email support",
      "Standard approval time (4–8h)",
    ],
    cta: "Get Started Free",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    desc: "For growing businesses & active freelancers",
    color: "border-primary",
    badge: "Most Popular",
    features: [
      "Unlimited project posts",
      "Priority bid placement",
      "Verified Pro badge on profile",
      "Priority approval (< 2h)",
      "Advanced analytics dashboard",
      "Dedicated account manager",
      "Custom proposal templates",
    ],
    cta: "Start Pro Plan",
    variant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For agencies and large teams",
    color: "border-border",
    badge: null,
    features: [
      "Everything in Pro",
      "Team member accounts",
      "White-label options",
      "SLA guarantee",
      "API access",
      "Dedicated success manager",
      "Custom contract terms",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleCta = (name: string) => {
    if (name === "Enterprise") { navigate("/contact"); return; }
    navigate(isLoggedIn ? "/" : "/login");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 space-y-12">
      <div className="text-center space-y-4">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          Pricing
        </span>
        <h1 className="font-heading text-4xl font-bold text-foreground">Simple, transparent pricing</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start free, upgrade when you're ready. No hidden fees, no surprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border-2 ${plan.color} bg-card p-6 flex flex-col gap-5`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                  {plan.badge}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{plan.name}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
            </div>

            <ul className="space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button variant={plan.variant} className="w-full" onClick={() => handleCta(plan.name)}>
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ note */}
      <p className="text-center text-sm text-muted-foreground">
        Have questions about pricing?{" "}
        <button onClick={() => navigate("/contact")} className="text-primary hover:underline">Contact us</button>{" "}
        or visit our{" "}
        <button onClick={() => navigate("/help")} className="text-primary hover:underline">Help Center</button>.
      </p>
    </div>
  );
};

export default Pricing;
