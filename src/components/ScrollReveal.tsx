import { useRef, useEffect, useState, type ReactNode } from "react";

type State = "hidden" | "entering" | "visible" | "instant";

interface Props {
  children:   ReactNode;
  delay?:     number;       // seconds, for stagger
  className?: string;
  from?:      "up" | "left" | "right" | "none";
  duration?:  number;       // ms
}

const TRANSFORM: Record<NonNullable<Props["from"]>, string> = {
  up:    "translateY(48px)",
  left:  "translateX(-48px)",
  right: "translateX(48px)",
  none:  "none",
};

export default function ScrollReveal({
  children,
  delay    = 0,
  className = "",
  from     = "up",
  duration = 620,
}: Props) {
  const ref            = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already visible on first paint → no animation needed
    const { top, bottom } = el.getBoundingClientRect();
    if (top < window.innerHeight && bottom > 0) {
      setState("instant");
      return;
    }

    // Below the fold → observe
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Step 1: mount with hidden-but-transition-ready styles
        setState("entering");
        // Step 2: two rAFs so browser paints "entering" first, then transitions
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setState("visible"))
        );
        obs.disconnect();
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const t = `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}s, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}s`;

  const styles: Record<State, React.CSSProperties> = {
    hidden:   { opacity: 0, transform: TRANSFORM[from] },
    entering: { opacity: 0, transform: TRANSFORM[from], transition: t },
    visible:  { opacity: 1, transform: "none",          transition: t },
    instant:  { opacity: 1, transform: "none" },
  };

  return (
    <div ref={ref} className={className} style={styles[state]}>
      {children}
    </div>
  );
}
