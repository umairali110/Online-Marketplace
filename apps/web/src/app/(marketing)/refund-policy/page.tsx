export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-text-primary">Refund & Return Policy</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-6 space-y-6 text-sm text-text-muted">
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">1. Cash on Delivery Orders</h2>
          <p>Since all orders are paid on delivery, no online refund is required if you decline the order at your doorstep.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">2. Damaged or Incorrect Items</h2>
          <p>If you receive a damaged or incorrect item, use the &quot;Report an Issue&quot; option on your order within 7 days of delivery.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">3. Service Disputes</h2>
          <p>For hired service providers, raise a dispute through your job&apos;s detail page if the work delivered doesn&apos;t match what was agreed.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">4. Resolution</h2>
          <p>Our admin team reviews every dispute and works with the seller/provider and customer to reach a fair resolution.</p>
        </section>
      </div>
      <p className="mt-8 text-xs text-text-muted">
        This is a template document. Have it reviewed by a qualified lawyer before relying on it for a live business.
      </p>
    </div>
  );
}