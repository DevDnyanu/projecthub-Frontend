const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
    <div className="text-sm text-muted-foreground leading-7 space-y-2">{children}</div>
  </div>
);

const Terms = () => (
  <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 space-y-10">
    <div className="space-y-3">
      <h1 className="font-heading text-4xl font-bold text-foreground">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: January 1, 2025</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Please read these Terms of Service ("Terms") carefully before using ProjectHub. By accessing
        or using our platform, you agree to be bound by these Terms.
      </p>
    </div>

    <div className="space-y-8 divide-y divide-border">
      <Section title="1. Acceptance of Terms">
        <p>By creating an account or using ProjectHub, you confirm that you are at least 18 years old
          and have the legal capacity to enter into a binding agreement. If you are using the platform
          on behalf of a company or organisation, you represent that you have authority to bind that
          entity to these Terms.</p>
      </Section>

      <div className="pt-8">
        <Section title="2. Use of the Platform">
          <p>ProjectHub is a marketplace that connects clients (buyers) with experts (sellers).
            We provide the platform, tools, and infrastructure — but are not a party to any contract
            between clients and experts.</p>
          <p>You agree not to: post fraudulent projects or bids, impersonate other users, use the
            platform to spam or harass, attempt to circumvent our payment system, or violate any
            applicable law.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="3. Accounts & Security">
          <p>You are responsible for maintaining the confidentiality of your account credentials. You
            agree to notify us immediately at support@projecthub.in if you suspect any unauthorised
            access. ProjectHub will not be liable for losses arising from compromised credentials.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="4. Project Posting & Bidding">
          <p>All projects and bids are subject to admin review before going live. ProjectHub reserves
            the right to reject any project or bid that violates our community guidelines, contains
            inappropriate content, or is otherwise deemed unsuitable.</p>
          <p>Clients are responsible for ensuring project descriptions are accurate. Experts are
            responsible for delivering work as described in their bids.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="5. Payments & Fees">
          <p>ProjectHub charges a platform service fee on successful project completions. The current
            fee structure is available on our Pricing page. Fees are subject to change with 30 days'
            notice to active users.</p>
          <p>All payments are processed through RBI-compliant payment gateways. Refunds are governed
            by our separate Refund Policy.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="6. Intellectual Property">
          <p>Upon full payment, clients receive ownership of work product delivered by freelancers,
            unless the parties agree otherwise in writing. ProjectHub retains no rights to project
            deliverables.</p>
          <p>The ProjectHub name, logo, and platform design are our intellectual property. You may
            not use them without prior written consent.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="7. Limitation of Liability">
          <p>ProjectHub is provided "as is" without warranty of any kind. To the maximum extent
            permitted by law, ProjectHub shall not be liable for any indirect, incidental, special,
            or consequential damages arising from your use of the platform.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="8. Governing Law">
          <p>These Terms shall be governed by and construed in accordance with the laws of India.
            Any disputes shall be subject to the exclusive jurisdiction of the courts of Pune,
            Maharashtra, India.</p>
        </Section>
      </div>

      <div className="pt-8">
        <Section title="9. Contact">
          <p>For questions about these Terms, email us at <a href="mailto:legal@projecthub.in" className="text-primary hover:underline">legal@projecthub.in</a> or
            visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
        </Section>
      </div>
    </div>
  </div>
);

export default Terms;
