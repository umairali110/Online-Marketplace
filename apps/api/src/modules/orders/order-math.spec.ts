import { computeOrderTotals } from './order-math';

describe('computeOrderTotals', () => {
  const base = {
    subtotal: 100,
    shipping: 0,
    tax: 0,
    couponDiscount: 0,
    trustCoinsAvailable: 0,
    trustCoinsRequested: 0,
    trustCoinRate: 0.05,
  };

  it('returns the full total with no discounts, earning coins at the configured rate', () => {
    const result = computeOrderTotals(base);
    expect(result.total).toBe(100);
    expect(result.trustCoinsUsed).toBe(0);
    expect(result.trustCoinsEarned).toBe(5);
  });

  it('applies a coupon discount to the total', () => {
    const result = computeOrderTotals({ ...base, couponDiscount: 20 });
    expect(result.total).toBe(80);
  });

  it('never redeems more TrustCoins value than the order actually costs', () => {
    // 5000 coins = $50 requested, but the order is only $10 — must cap at $10 (1000 coins)
    const result = computeOrderTotals({ ...base, subtotal: 10, trustCoinsAvailable: 5000, trustCoinsRequested: 5000 });
    expect(result.trustCoinsUsed).toBe(1000);
    expect(result.total).toBe(0);
  });

  it('caps redemption at what the user actually owns, not what they request', () => {
    const result = computeOrderTotals({ ...base, trustCoinsAvailable: 200, trustCoinsRequested: 10000 });
    expect(result.trustCoinsUsed).toBeLessThanOrEqual(200);
  });

  it('never returns a negative total when discounts exceed the subtotal', () => {
    const result = computeOrderTotals({ ...base, subtotal: 5, couponDiscount: 20 });
    expect(result.total).toBe(0);
  });
});