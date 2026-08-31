export interface OrderMathInput {
  subtotal: number;
  shipping: number;
  tax: number;
  couponDiscount: number;
  trustCoinsAvailable: number;
  trustCoinsRequested: number;
  trustCoinRate: number;
}

export interface OrderMathResult {
  trustCoinsUsed: number;
  total: number;
  trustCoinsEarned: number;
}

export function computeOrderTotals(input: OrderMathInput): OrderMathResult {
  const { subtotal, shipping, tax, couponDiscount, trustCoinsAvailable, trustCoinsRequested, trustCoinRate } = input;

  const affordableCoins = Math.max(0, Math.min(trustCoinsRequested, trustCoinsAvailable));
  const maxRedeemableValue = Math.max(0, subtotal - couponDiscount);
  const coinsValueRequested = affordableCoins / 100;
  const trustCoinsUsedValue = Math.min(coinsValueRequested, maxRedeemableValue);
  const trustCoinsUsed = Math.floor(trustCoinsUsedValue * 100);

  const total = Math.max(0, subtotal + shipping + tax - couponDiscount - trustCoinsUsed / 100);
  const trustCoinsEarned = Math.floor(total * trustCoinRate);

  return { trustCoinsUsed, total, trustCoinsEarned };
}