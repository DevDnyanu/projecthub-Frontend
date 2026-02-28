const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
    <div className="text-sm text-muted-foreground leading-7 space-y-2">{children}</div>
  </div>
);

const Privacy = () => (
  <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 space-y-10">
    <div className="space-y-3">
      <h1 className="font-heading text-4xl font-bold text-foreground">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: January 1, 2025</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your privacy is important to us. This policy explains what data we collect, how we use it,
        and your rights regarding your personal information.
      </p>
    </div>

    <div className="space-y-8 divide-y divide-border">
      <Section title="1. Information We Collect">
        <p><strong className="text-foreground">Account data:</strong> Name, email address, and password (hashed) when you register.</p>
        <p><strong className="text-foreground">Profile data:</strong> Skills, portfolio links, bio, and avatar that you optionally add.</p>
        <p><strong className="text-foreground">Project data:</strong> Project titles, descriptions, bids, and messages you create on the platform.</p>
        <p><strong className="text-foreground">Usage data:</strong> Pages visited, features used, and device/browser information for analytics.</p>
      </Section>

      <div className="pt-8">
        <Section title="2. How We Use Your Information">
          <p>We use your data to: provide and improve the ProjectHub platform, send transactional
            emails (project updates, bid notifications), personalise your experience, prevent fraud
            and abuse, and comply with legal obligations.</p>
          <p>We do <strong className="text-foreground">not</strong> sell your personal data to third parties.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="3. Cookies & Tracking">
          <p>We use essential cookies to keep you logged in and remember your preferences. We also
            use analytics cookies (e.g., aggregate usage stats) to understand how people use the
            platform. You can opt out of analytics cookies in your browser settings.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="4. Data Sharing">
          <p>We share limited data with: payment processors (to handle transactions), email service
            providers (to send notifications), and cloud storage providers (for file uploads). All
            third-party providers are contractually bound to handle your data securely.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="5. Data Security">
          <p>We use industry-standard security measures including HTTPS encryption, hashed passwords,
            and JWT authentication. While we strive to protect your data, no system is 100% secure.
            We will notify you promptly in the event of a data breach.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="6. Data Retention">
          <p>We retain your account data for as long as your account is active. If you delete your
            account, we will remove your personal data within 30 days, except where retention is
            required by law (e.g., payment records for 7 years per GST regulations).</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="7. Your Rights">
          <p>You have the right to: access your personal data, correct inaccurate data, request
            deletion of your account, export your data, and opt out of marketing emails at any time.</p>
          <p>To exercise these rights, email <a href="mailto:privacy@projecthub.in" className="text-primary hover:underline">privacy@projecthub.in</a>.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="8. Changes to This Policy">
          <p>We may update this policy from time to time. We will notify you of significant changes
            by email or by a prominent notice on the platform. Continued use of ProjectHub after
            changes constitutes acceptance of the updated policy.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="9. Contact Us">
          <p>Questions about this Privacy Policy? Contact our Data Protection Officer at{" "}
            <a href="mailto:privacy@projecthub.in" className="text-primary hover:underline">privacy@projecthub.in</a>.</p>
        </Section>
      </div>
    </div>
  </div>
);

export default Privacy;
