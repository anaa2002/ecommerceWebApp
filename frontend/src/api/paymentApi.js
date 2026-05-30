import api from "./axios";

export function createCheckoutSession(products, couponCode = "") {
  return api.post("/payments/create-checkout-session", {
    products,
    couponCode,
  });
}

export function confirmCheckoutSuccess(sessionId) {
  return api.post("/payments/checkout-success", { sessionId });
}
