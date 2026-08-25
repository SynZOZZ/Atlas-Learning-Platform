export type PaymentMethod = "test_card" | "visa" | "wallet" | "cash_transfer";

export function paymentDecision(method: PaymentMethod) {
  const provider = String(process.env.PAYMENT_PROVIDER || "demo").toLowerCase();
  if (provider === "demo" && method === "test_card") return { paid: true, status: "paid", checkoutUrl: null };
  if (provider === "external" && ["visa", "wallet"].includes(method)) {
    const checkout = process.env.PAYMENT_CHECKOUT_URL || "";
    return { paid: false, status: "pending", checkoutUrl: checkout || null };
  }
  return { paid: false, status: "pending", checkoutUrl: null };
}
