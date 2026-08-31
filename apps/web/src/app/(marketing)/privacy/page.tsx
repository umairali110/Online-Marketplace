export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-text-primary">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-6 space-y-6 text-sm text-text-muted">
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">1. Information We Collect</h2>
          <p>Name, email, phone, delivery address, city/country, and profile photo you provide. Order history and messages you send through the platform.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">2. How We Use Your Information</h2>
          <p>To process orders, connect you with sellers and service providers, send order/account notifications, and improve the platform.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">3. Sharing</h2>
          <p>Your delivery details are shared with the seller/provider fulfilling your order. We do not sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">4. Data Security</h2>
          <p>Passwords are hashed, sessions use httpOnly cookies, and uploaded images are stored via a secure third-party provider.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">5. Your Rights</h2>
          <p>You can update your profile information at any time from your Account page, or contact support to request account deletion.</p>
        </section>
      </div>
      <p className="mt-8 text-xs text-text-muted">
        This is a template document. Have it reviewed by a qualified lawyer before relying on it for a live business.
      </p>
    </div>
  );
}