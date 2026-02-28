import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    // Simulate sending — replace with real API call when ready
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
      <div className="text-center mb-12 space-y-3">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          Get in Touch
        </span>
        <h1 className="font-heading text-4xl font-bold text-foreground">Contact Us</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Have a question, feedback, or need help? We're here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info cards */}
        <div className="space-y-4">
          {[
            { icon: Mail,          title: "Email",       desc: "support@projecthub.in",     sub: "Reply within 24 hours"   },
            { icon: Phone,         title: "Phone",       desc: "+91 98765 43210",            sub: "Mon–Fri, 9am–6pm IST"    },
            { icon: MapPin,        title: "Office",      desc: "Pune, Maharashtra",          sub: "India 411001"            },
            { icon: MessageSquare, title: "Live Chat",   desc: "Chat with our team",         sub: "Available 9am–9pm IST"   },
            { icon: Clock,         title: "Support SLA", desc: "< 24h response time",        sub: "For all support tickets" },
          ].map(({ icon: Icon, title, desc, sub }) => (
            <Card key={title} className="p-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm text-foreground mt-0.5">{desc}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact form */}
        <Card className="lg:col-span-2 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Your full name" value={form.name} onChange={set("name")} />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input placeholder="What's this about?" value={form.subject} onChange={set("subject")} />
            </div>
            <div className="space-y-1.5">
              <Label>Message <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Describe your issue or question in detail…"
                rows={6}
                value={form.message}
                onChange={set("message")}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={sending}>
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
