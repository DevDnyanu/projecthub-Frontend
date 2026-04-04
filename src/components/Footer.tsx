import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Twitter, Linkedin, Instagram, Github,
  Mail, MapPin, Phone, Send, CheckCircle2,
  Briefcase, ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ── Newsletter ───────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <div>
      <p className="text-[13px] text-slate-400 mb-3 leading-relaxed">
        Get the latest projects and platform news — no spam, ever.
      </p>
      {done ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-[13px] font-medium text-emerald-400">You're subscribed!</span>
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 min-w-0 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────── */

const SOCIALS = [
  { icon: Twitter,   href: "https://twitter.com",   label: "Twitter",   cls: "hover:bg-sky-500/15 hover:text-sky-400 hover:border-sky-500/30"     },
  { icon: Linkedin,  href: "https://linkedin.com",  label: "LinkedIn",  cls: "hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-500/30"  },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram", cls: "hover:bg-pink-500/15 hover:text-pink-400 hover:border-pink-500/30"  },
  { icon: Github,    href: "https://github.com",    label: "GitHub",    cls: "hover:bg-slate-500/15 hover:text-slate-300 hover:border-slate-500/30"},
];

const BOTTOM_LINKS = [
  { label: "Terms of Service", to: "/terms"   },
  { label: "Privacy Policy",   to: "/privacy" },
  { label: "Contact Us",       to: "/contact" },
  { label: "Blog",             to: "/blog"    },
];

/* ── Footer link ──────────────────────────────────────── */
const FLink = ({ label, to, onClick }: { label: string; to?: string; onClick?: () => void }) => {
  const cls = "group flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-white transition-colors duration-200";
  const inner = (
    <>
      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-y-0.5 translate-x-0.5 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200 shrink-0 text-primary" />
      {label}
    </>
  );
  if (to) return <li><Link to={to} className={cls}>{inner}</Link></li>;
  return <li><button onClick={onClick} className={cls}>{inner}</button></li>;
};

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
const Footer = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const goProtected = (path: string) => navigate(isLoggedIn ? path : "/login");

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">

      {/* ── Main grid ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">

          {/* Brand col — wider */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="font-heading text-xl font-extrabold text-white tracking-tight">ProjectHub</p>
              </div>
            </Link>

            {/* Tagline */}
            <div className="space-y-3">
              <p className="text-[15px] font-semibold text-white leading-snug">
                Connect with Global Experts.<br />
                Build anything.
              </p>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-xs">
                Work with the world's most trusted professionals across every domain.
                Start your project with confidence.
              </p>
            </div>

            {/* Contact */}
            <ul className="space-y-2.5">
              {[
                { icon: Mail,   text: "support@projecthub.in"   },
                { icon: Phone,  text: "+91 98765 43210"          },
                { icon: MapPin, text: "Pune, Maharashtra, India" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[13px] text-slate-400">{text}</span>
                </li>
              ))}
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label, cls }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 transition-all duration-200 ${cls}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* For Clients */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              For Clients
            </h4>
            <ul className="space-y-3.5">
              <FLink label="Home"  onClick={() => navigate("/")} />
              <FLink label="Post a Project"   onClick={() => goProtected("/post-project")} />
              <FLink label="How It Works"     to="/how-it-works" />
              <FLink label="Wallet & Payments" onClick={() => goProtected("/wallet-guide")} />
            </ul>
          </div>

          {/* For Experts */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              For Experts
            </h4>
            <ul className="space-y-3.5">
              <FLink label="Find Projects"    onClick={() => navigate("/")} />
              <FLink label="My Projects"      onClick={() => goProtected("/my-projects")} />
              <FLink label="Dashboard"        onClick={() => goProtected("/admin")} />
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Company
            </h4>
            <ul className="space-y-3.5">
              <FLink label="About Us"   to="/about"      />
              <FLink label="Blog"       to="/blog"       />
              <FLink label="Careers"    to="/careers"    />
              <FLink label="Contact"    to="/contact"    />
            </ul>
          </div>
          {/* Newsletter */}
          <div className="lg:col-span-2 sm:col-span-2">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Newsletter
            </h4>
            <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">
              Get the latest projects and platform news — no spam, ever.
            </p>

            {/* Trust badge */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-200">Secure Payments</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  100% payment protection on every transaction.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────── */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">

            <p className="text-[12px] text-slate-600 text-center sm:text-left">
              © {new Date().getFullYear()} <span className="text-slate-400 font-medium">ProjectHub Technologies Pvt. Ltd.</span>
              &nbsp;All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {BOTTOM_LINKS.map(({ label, to }) => (
                <Link key={to} to={to} className="text-[12px] text-slate-600 hover:text-slate-300 transition-colors duration-200">
                  {label}
                </Link>
              ))}

              {/* Live status */}
              <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[12px] text-slate-600">All systems operational</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
