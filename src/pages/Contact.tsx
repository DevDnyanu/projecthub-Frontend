import { useState } from "react";
import {
  Mail, Phone, MapPin, Send, MessageSquare,
  Clock, CheckCircle2, ArrowUpRight,
  Twitter, Linkedin, Github, Globe, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

/* ─── Bento card ─────────────────────────────────────── */
const B = ({
  children, className = "", glow = "rgba(14,165,233,0.15)",
}: { children: React.ReactNode; className?: string; glow?: string }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`group relative rounded-3xl border bg-card overflow-hidden
        transition-all duration-300 ${hovered ? "-translate-y-1.5" : "border-border"}
        ${className}`}
      style={{
        borderColor: hovered ? glow : undefined,
        boxShadow: hovered ? `0 6px 30px -4px ${glow}, 0 20px 70px -8px ${glow}` : "none"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
};

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [focus, setFocus]     = useState<string | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Fill required fields", variant: "destructive" }); return;
    }
    setSending(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
      toast({ title: "Sent!", description: "We'll reply within 24 h." });
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally { setSending(false); }
  };

  const inp = (k: string) =>
    `w-full rounded-xl border bg-background px-4 py-3.5 text-sm text-foreground
     placeholder:text-muted-foreground/60 outline-none transition-all duration-200
     ${focus === k
       ? "border-primary ring-4 ring-primary/10 shadow-sm"
       : "border-border hover:border-border/60"}`;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pingOnce {
          0%   { transform:scale(1);   opacity:.5; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes tickIn {
          0%  { transform:scale(0) rotate(-20deg); opacity:0; }
          70% { transform:scale(1.15) rotate(4deg);  opacity:1; }
          100%{ transform:scale(1)   rotate(0deg);   }
        }
        .fu1{animation:fadeUp .65s .05s cubic-bezier(.22,1,.36,1) both;}
        .fu2{animation:fadeUp .65s .12s cubic-bezier(.22,1,.36,1) both;}
        .fu3{animation:fadeUp .65s .20s cubic-bezier(.22,1,.36,1) both;}
        .fu4{animation:fadeUp .65s .28s cubic-bezier(.22,1,.36,1) both;}
        .fu5{animation:fadeUp .65s .36s cubic-bezier(.22,1,.36,1) both;}
        .fu6{animation:fadeUp .65s .44s cubic-bezier(.22,1,.36,1) both;}
        .fu7{animation:fadeUp .65s .52s cubic-bezier(.22,1,.36,1) both;}
        .tick-in{animation:tickIn .5s .1s cubic-bezier(.34,1.56,.64,1) both;}
      `}</style>

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

          {/* ══ HEADER ════════════════════════════════════ */}
          <div className="mb-14">
            <p className="fu1 text-2xl font-bold uppercase tracking-[0.22em] text-primary mb-4 text-center">
              Contact Us
            </p>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <h1 className="fu2 font-heading font-black text-foreground text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight">
                Got a<br />
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg,hsl(var(--primary)) 0%,#818cf8 50%,#34d399 100%)" }}>
                  project?
                </span>
              </h1>
              <p className="fu3 text-muted-foreground text-base max-w-xs leading-relaxed lg:text-right">
                Drop us a message.<br />
                We reply within 24 hours, every time.
              </p>
            </div>
          </div>

          {/* ══ BENTO GRID ════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* ── FORM ── */}
            <div className="fu4 lg:col-span-7">
              <B className="h-full" glow="rgba(14,165,233,0.45)">
                {/* top accent stripe */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-emerald-400" />

                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-foreground">Send a message</p>
                      <p className="text-xs text-muted-foreground">We'll get back to you personally</p>
                    </div>
                  </div>

                  {sent ? (
                    <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
                      <div className="relative w-20 h-20">
                        <span className="absolute inset-0 rounded-full bg-emerald-400/20"
                          style={{ animation: "pingOnce 1.8s ease-out infinite" }} />
                        <div className="tick-in relative w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-400/40 flex items-center justify-center">
                          <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <p className="font-heading font-black text-foreground text-2xl mb-1">Message sent!</p>
                        <p className="text-muted-foreground text-sm">We'll reply within 24 hours.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={submit} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { k: "name",  label: "Full Name *",    type: "text",  ph: "John Doe"      },
                          { k: "email", label: "Email Address *", type: "email", ph: "you@email.com" },
                        ].map(({ k, label, type, ph }) => (
                          <div key={k}>
                            <label className={`block text-[11px] font-bold uppercase tracking-widest mb-2 transition-colors
                              ${focus === k ? "text-primary" : "text-muted-foreground"}`}>{label}</label>
                            <input type={type} placeholder={ph} value={form[k as keyof typeof form]}
                              onChange={set(k as keyof typeof form)}
                              onFocus={() => setFocus(k)} onBlur={() => setFocus(null)}
                              className={inp(k)} />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-widest mb-2 transition-colors
                          ${focus === "subject" ? "text-primary" : "text-muted-foreground"}`}>Subject</label>
                        <input placeholder="What's this about?" value={form.subject}
                          onChange={set("subject")}
                          onFocus={() => setFocus("subject")} onBlur={() => setFocus(null)}
                          className={inp("subject")} />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className={`text-[11px] font-bold uppercase tracking-widest transition-colors
                            ${focus === "message" ? "text-primary" : "text-muted-foreground"}`}>Message *</label>
                          <span className={`text-[11px] tabular-nums transition-colors
                            ${form.message.length > 10 ? "text-primary" : "text-muted-foreground/70"}`}>
                            {form.message.length}
                          </span>
                        </div>
                        <textarea placeholder="Tell us how we can help you…" rows={5}
                          value={form.message} onChange={set("message")}
                          onFocus={() => setFocus("message")} onBlur={() => setFocus(null)}
                          className={`${inp("message")} resize-none`} />
                      </div>

                      <button type="submit" disabled={sending}
                        className="group relative overflow-hidden mt-1 w-full h-14 rounded-2xl font-bold text-sm text-white
                          bg-primary hover:bg-primary/90
                          hover:shadow-2xl hover:shadow-primary/25 hover:-translate-y-0.5
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-all duration-300 cta-pulse">
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700
                          bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2.5">
                          {sending ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                              </svg>
                              Sending…
                            </>
                          ) : (
                            <>
                              Send Message
                              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                            </>
                          )}
                        </span>
                      </button>

                      <p className="text-center text-xs text-muted-foreground/60 mt-1">
                        Your information is safe with us. No spam, ever.
                      </p>
                    </form>
                  )}
                </div>
              </B>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-5 flex flex-col gap-4">

              {/* EMAIL */}
              <div className="fu4">
                <B glow="rgba(14,165,233,0.45)">
                  <div className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0
                      group-hover:bg-primary/15 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Email us</p>
                      <p className="font-semibold text-foreground text-sm">support@projecthub.in</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Reply within 24 hours</p>
                    </div>
                  </div>
                </B>
              </div>

              {/* PHONE + LOCATION row */}
              <div className="fu5 grid grid-cols-2 gap-4">
                <B glow="rgba(52,211,153,0.45)">
                  <div className="p-5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                      <Phone className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Call us</p>
                    <p className="font-semibold text-foreground text-sm">+91 98765 43210</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Mon–Sat</p>
                  </div>
                </B>
                <B glow="rgba(244,114,182,0.45)">
                  <div className="p-5">
                    <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3">
                      <MapPin className="w-4 h-4 text-pink-500" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Office</p>
                    <p className="font-semibold text-foreground text-sm">Pune, MH</p>
                    <p className="text-xs text-muted-foreground mt-0.5">India</p>
                  </div>
                </B>
              </div>

              {/* STATS */}
              <div className="fu6">
                <B glow="rgba(139,92,246,0.45)">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Zap className="w-4 h-4 text-violet-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">By the numbers</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { v: "24h",  l: "Reply"    },
                        { v: "500+", l: "Clients"  },
                        { v: "50+",  l: "Countries"},
                        { v: "98%",  l: "Happy"    },
                      ].map(({ v, l }) => (
                        <div key={l} className="bg-secondary/50 rounded-2xl p-3 text-center border border-border/50
                          group-hover:border-border transition-colors">
                          <p className="font-heading font-black text-foreground text-lg leading-none">{v}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </B>
              </div>

              {/* CHAT + SOCIAL */}
              <div className="fu7 grid grid-cols-2 gap-4">
                <B glow="rgba(251,191,36,0.45)">
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                        <MessageSquare className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Live Chat</p>
                      <p className="text-sm font-semibold text-foreground">9 am–9 pm</p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                        <Clock className="w-4 h-4 text-cyan-500" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Response</p>
                      <p className="text-sm font-semibold text-foreground">Within 24 h</p>
                    </div>
                  </div>
                </B>

                <B>
                  <div className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <Globe className="w-4 h-4 text-muted-foreground mb-3" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Serving clients in 50+ countries worldwide.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      {[
                        { icon: Twitter,  label: "Twitter",  cls: "hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/20"  },
                        { icon: Linkedin, label: "LinkedIn", cls: "hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20"},
                        { icon: Github,   label: "GitHub",   cls: "hover:bg-secondary hover:text-foreground"                        },
                      ].map(({ icon: Icon, label, cls }) => (
                        <button key={label}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted-foreground
                            text-xs font-semibold transition-all duration-200 ${cls}`}>
                          <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                      ))}
                    </div>
                  </div>
                </B>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
