export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-text-primary">Terms of Service</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-6 space-y-6 text-sm text-text-muted">
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">1. Acceptance of Terms</h2>
          <p>By creating an account or using Online Marketplace, you agree to these Terms of Service.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">2. Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">3. Orders & Payment</h2>
          <p>All orders are paid via Cash on Delivery. No online payment information is collected or stored by the platform.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">4. Sellers & Providers</h2>
          <p>Sellers and service providers are independent parties responsible for the accuracy of their listings and the quality of goods/services delivered.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">5. Disputes</h2>
          <p>Disputes between customers and sellers/providers are reviewed by platform administrators via the Dispute Resolution process.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">6. Changes</h2>
          <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of the updated terms.</p>
        </section>
      </div>
      <p className="mt-8 text-xs text-text-muted">
        This is a template document. Have it reviewed by a qualified lawyer before relying on it for a live business.
      </p>
    </div>
  );
}