import api from "./axios";

export function getCartItems() {
  return api.get("/cart");
}

export function addProductToCart(productId) {
  return api.post("/cart", { productId });
}

export function removeProductFromCart(productId) {
  return api.delete("/cart", {
    data: { productId },
  });
}

export function clearCart() {
  return api.delete("/cart");
}

export function updateCartQuantity(productId, quantity) {
  return api.patch(`/cart/${productId}`, { quantity });
}
