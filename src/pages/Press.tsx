import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const coverage = [
  { outlet: "YourStory",       title: "ProjectHub raises seed funding to disrupt India's freelance market", date: "Jan 2025", href: "#" },
  { outlet: "Inc42",           title: "Top 10 Indian Startups to Watch in 2025",                          date: "Jan 2025", href: "#" },
  { outlet: "Economic Times",  title: "How ProjectHub is connecting Tier-2 city talent with global clients", date: "Dec 2024", href: "#" },
  { outlet: "StartupTalky",    title: "ProjectHub's community-first approach to freelancing",              date: "Nov 2024", href: "#" },
];

const Press = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 space-y-12">
      <div className="text-center space-y-4">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          Press
        </span>
        <h1 className="font-heading text-4xl font-bold text-foreground">ProjectHub in the News</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Press coverage, announcements, and media resources.
        </p>
      </div>

      {/* Coverage */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Recent Coverage</h2>
        <div className="space-y-3">
          {coverage.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary">{item.outlet}</p>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </div>

      {/* Press kit */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Press Kit</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Download our press kit including logos, brand assets, founder bios, and factsheet. Please
          attribute any use of our materials to "ProjectHub".
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">Download Logo Pack</Button>
          <Button variant="outline" size="sm">Download Factsheet</Button>
        </div>
      </div>

      {/* Media contact */}
      <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center space-y-3">
        <p className="font-semibold text-foreground">Media Enquiries</p>
        <p className="text-sm text-muted-foreground">For interviews, quotes, or press partnerships, reach out to our communications team.</p>
        <p className="text-sm font-medium text-foreground">press@projecthub.in</p>
        <Button variant="outline" onClick={() => navigate("/contact")}>Contact PR Team</Button>
      </div>
    </div>
  );
};

export default Press;
