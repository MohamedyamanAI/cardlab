import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Cardlab",
  description:
    "Learn how Cardlab collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 7, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <p>
          CardLab (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a
          personal project operated by Yaman Jalal that runs the CardLab card
          game creation platform at cardlab.app. This policy explains what data
          we collect, why we collect it, and how we handle it.
        </p>
        <p>
          By using CardLab, you agree to the practices described in this policy.
        </p>

        <h2>What data we collect</h2>
        <p>
          <strong>Account data:</strong> Your name and email address when you
          sign up.
        </p>
        <p>
          <strong>Payment data:</strong> Billing is handled by Polar. We do not
          store your card details directly. Polar&rsquo;s privacy policy applies
          to payment data.
        </p>
        <p>
          <strong>Usage data:</strong> How you use the platform &mdash; features
          accessed, content created, session duration, and general interaction
          patterns. This helps us improve the product.
        </p>
        <p>
          <strong>Content you create:</strong> Card designs, artwork, game rules,
          and any other content you build using CardLab. This is yours &mdash;
          see the ownership section below.
        </p>
        <p>
          <strong>Cookies and analytics:</strong> We use cookies to keep you
          logged in and remember your preferences. We may use analytics tools to
          understand how people use the platform. You can disable cookies in your
          browser, though some features may not work correctly.
        </p>

        <h2>Why we collect it</h2>
        <p>We collect data to:</p>
        <ul>
          <li>Run and improve the platform</li>
          <li>Process your subscription and payments</li>
          <li>
            Send you account-related emails (confirmations, billing, important
            updates)
          </li>
          <li>Respond to support requests</li>
          <li>
            Understand how the product is being used so we can make it better
          </li>
        </ul>
        <p>
          We do not sell your data. We do not use it for advertising.
        </p>

        <h2>Third-party services we use</h2>
        <p>
          CardLab is built on top of several third-party services. Each has its
          own privacy policy:
        </p>
        <ul>
          <li>
            <strong>Polar</strong> &mdash; payment processing
          </li>
          <li>
            <strong>OpenAI</strong> &mdash; AI features including card generation
            and game ideation
          </li>
          <li>
            <strong>Vercel</strong> &mdash; hosting and infrastructure
          </li>
        </ul>
        <p>
          When you use CardLab, your data may pass through these services as part
          of normal operation.
        </p>

        <h2>International data transfers</h2>
        <p>
          CardLab is operated from Qatar, but our infrastructure providers are
          based in the United States. By using the Service, you acknowledge that
          your data may be transferred to and processed in the US or other
          countries, which may have different data protection laws than your own.
        </p>

        <h2>Your content</h2>
        <p>
          You own everything you create on CardLab &mdash; card designs, artwork,
          game mechanics, and any other content. We only store and process your
          content to provide the Service to you. We do not claim ownership over
          it.
        </p>
        <p>
          If you delete your account, we will delete your content within 30 days
          unless we are required to retain it by law.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have the right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data in a portable format</li>
          <li>Object to how we process your data</li>
        </ul>
        <p>
          <strong>If you are in the EU or UK (GDPR):</strong> Our legal basis for
          processing your data is either your consent, the performance of our
          contract with you, or our legitimate interests in improving the
          Service. You have the right to lodge a complaint with your local data
          protection authority.
        </p>
        <p>
          <strong>If you are in California (CCPA):</strong> You have the right to
          know what personal information we collect, to delete it, and to opt out
          of any sale of personal information. We do not sell personal
          information.
        </p>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:yaman@cardlab.app">yaman@cardlab.app</a>.
        </p>

        <h2>Data retention</h2>
        <p>
          We keep your account data for as long as your account is active. If you
          cancel or delete your account, we will delete your personal data within
          30 days unless we are legally required to keep it longer.
        </p>

        <h2>Security</h2>
        <p>
          We take reasonable steps to protect your data, including encrypted
          connections (HTTPS) and secure infrastructure. That said, no system is
          completely secure. If you believe your account has been compromised,
          contact us immediately.
        </p>

        <h2>Children</h2>
        <p>
          CardLab is not intended for users under the age of 13. We do not
          knowingly collect data from children. If you believe a child has
          created an account, please contact us and we will delete it promptly.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we make significant changes to this policy, we will notify you by
          email or by posting a notice on the platform. The date at the top of
          this page always reflects the most recent version.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Reach us at:
        </p>
        <p>
          <strong>Yaman Jalal</strong>
          <br />
          Email:{" "}
          <a href="mailto:yaman@cardlab.app">yaman@cardlab.app</a>
          <br />
          Website: cardlab.app
        </p>
      </div>
    </main>
  );
}
