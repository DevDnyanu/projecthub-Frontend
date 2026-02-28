import { Link, useNavigate } from "react-router-dom";
import {
  Twitter, Linkedin, Instagram, Github,
  Mail, MapPin, Phone, Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Footer = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleProtected = (path: string) => {
    navigate(isLoggedIn ? path : "/login");
  };

  return (
    <footer className="border-t border-border bg-card mt-auto">
      {/* ── Main footer grid ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Brand ── */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">ProjectHub</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's growing freelance marketplace connecting talented professionals with businesses that need them most.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@projecthub.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: Twitter,   href: "https://twitter.com",   label: "Twitter"   },
                { icon: Linkedin,  href: "https://linkedin.com",  label: "LinkedIn"  },
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Github,    href: "https://github.com",    label: "GitHub"    },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── For Clients ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">For Clients</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Browse Projects", action: () => navigate("/")                    },
                { label: "Post a Project",  action: () => handleProtected("/post-project") },
                { label: "How It Works",    action: () => navigate("/how-it-works")        },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── For Freelancers ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">For Freelancers</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Find Projects",      action: () => navigate("/")                    },
                { label: "My Dashboard",       action: () => handleProtected("/admin")         },
                { label: "My Projects",        action: () => handleProtected("/my-projects")   },
                { label: "Bidding Guide",      action: () => navigate("/help")                },
                { label: "Build Your Profile", action: () => handleProtected("/my-projects")   },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Contact Us",       to: "/contact" },
                { label: "Terms of Service", to: "/terms"   },
                { label: "Privacy Policy",   to: "/privacy" },
                { label: "About Us",         to: "/about"   },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} ProjectHub. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms"   className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <div className="flex items-center gap-1.5 ml-2 border-l border-border pl-4">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
