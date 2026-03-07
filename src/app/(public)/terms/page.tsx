import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Cardlab",
  description:
    "Read the terms and conditions for using the Cardlab platform.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 7, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <p>
          CardLab (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a
          personal project operated by Yaman Jalal that runs the CardLab card
          game creation platform at cardlab.app. These Terms explain what you can
          expect from us and what we expect from you when using the Service.
        </p>
        <p>
          By using CardLab, you agree to these Terms. If you do not agree, please
          do not use the Service.
        </p>

        <h2>What CardLab is</h2>
        <p>
          CardLab is an AI-powered platform for designing, managing, and printing
          card games. It includes tools for game ideation, AI-assisted card
          generation, automated playtesting, and print preparation.
        </p>

        <h2>Your account</h2>
        <p>
          To use most features, you need to create an account. You are
          responsible for keeping your login credentials secure and for
          everything that happens under your account.
        </p>
        <p>
          Please provide accurate information when signing up. Impersonating
          others or creating accounts for fraudulent purposes is not allowed.
        </p>

        <h2>Subscriptions and payments</h2>
        <p>
          Some features require a paid subscription. By subscribing, you agree to
          pay the fees listed on our pricing page at the time of purchase.
        </p>
        <p>
          <strong>Billing:</strong> Subscriptions renew automatically on a
          monthly or yearly basis depending on your plan.
        </p>
        <p>
          <strong>Cancellation:</strong> You can cancel at any time. Your access
          continues until the end of the current billing period. We do not charge
          you again after cancellation.
        </p>
        <p>
          <strong>Refunds:</strong> We generally do not offer refunds for partial
          billing periods. If you believe you were charged in error, contact us
          within 14 days at{" "}
          <a href="mailto:yaman@cardlab.app">yaman@cardlab.app</a> and we will
          review it.
        </p>
        <p>
          <strong>Pricing changes:</strong> We may change our prices from time to
          time. We will give you at least 30 days notice before any price
          increase takes effect. Continued use after the notice period means you
          accept the new price.
        </p>

        <h2>Your content</h2>
        <p>
          You own everything you create on CardLab &mdash; card designs, artwork,
          game rules, and any other content. We do not claim ownership over it.
        </p>
        <p>
          By using the Service, you give us a limited license to store, display,
          and process your content solely to provide the Service to you. We do
          not use your content for any other purpose.
        </p>
        <p>
          You are responsible for what you create. Do not use CardLab to create
          content that is illegal, harmful, or infringes on someone else&rsquo;s
          rights.
        </p>
        <p>
          <strong>What happens when you cancel:</strong> If you cancel your
          account, we will retain your content for 30 days in case you change
          your mind. After that, it will be deleted. Export your content before
          cancelling if you want to keep it.
        </p>

        <h2>AI-generated content</h2>
        <p>
          CardLab uses AI to help generate card artwork, suggest mechanics, and
          simulate gameplay. AI output can be unpredictable &mdash; results may
          vary in quality and consistency.
        </p>
        <p>
          You are responsible for reviewing AI-generated content before using it,
          especially for commercial purposes. We make no guarantees about the
          accuracy, originality, or fitness of AI output for any particular
          purpose.
        </p>

        <h2>Acceptable use</h2>
        <p>You agree not to use CardLab to:</p>
        <ul>
          <li>Break any applicable laws or regulations</li>
          <li>Infringe on anyone&rsquo;s intellectual property rights</li>
          <li>Generate content that is harmful, abusive, or illegal</li>
          <li>
            Attempt to hack, reverse engineer, or disrupt the platform
          </li>
          <li>
            Use bots or automated tools to abuse or scrape the Service
          </li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these terms.
        </p>

        <h2>Affiliate and partner program</h2>
        <p>
          If you participate in the CardLab affiliate or partner program,
          additional terms will apply and will be shared with you separately.
          Commission rates, payment schedules, and program rules are governed by
          those terms.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The CardLab name, logo, platform design, and underlying code are owned
          by Yaman Jalal. You may not copy, reproduce, or use them without
          explicit written permission.
        </p>

        <h2>Disclaimers</h2>
        <p>
          CardLab is provided &ldquo;as is.&rdquo; We do our best to keep it
          running reliably, but we cannot guarantee the Service will always be
          available, error-free, or uninterrupted. Use it at your own risk.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Yaman Jalal is not liable for
          any indirect, incidental, or consequential damages resulting from your
          use of CardLab &mdash; including loss of data, lost revenue, or
          business interruption &mdash; even if we were advised such damages were
          possible.
        </p>
        <p>
          Our total liability to you for any claim related to the Service shall
          not exceed the amount you paid us in the 3 months preceding the claim.
        </p>

        <h2>Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms or
          if we decide to discontinue the Service. We will try to give you
          reasonable notice where possible.
        </p>
        <p>
          You can delete your account at any time by contacting{" "}
          <a href="mailto:yaman@cardlab.app">yaman@cardlab.app</a>.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          If we make significant changes, we will notify you by email or through
          the platform at least 14 days before the changes take effect. Continued
          use of the Service after that date means you accept the updated Terms.
        </p>

        <h2>Governing law</h2>
        <p>
          These Terms are governed by applicable law. Any disputes will first be
          attempted to be resolved through direct communication. If unresolved,
          they will be handled through the appropriate legal channels.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms? Reach us at:
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
