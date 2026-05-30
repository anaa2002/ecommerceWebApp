import api from "./axios";

export function getFeaturedProducts() {
  return api.get("/products/featured");
}

export function getRecommendedProducts() {
  return api.get("/products/recommended");
}

export function getProductsByCategory(category) {
  return api.get(`/products/category/${category}`);
}

export function getAllProducts() {
  return api.get("/products");
}

export function createProduct(productData) {
  return api.post("/products", productData);
}

export function deleteProduct(productId) {
  return api.delete(`/products/${productId}`);
}

export function toggleFeaturedProduct(productId) {
  return api.patch(`/products/${productId}/toggle-featured`);
}

export function updateProduct(productId, productData) {
  return api.patch(`/products/${productId}`, productData);
}
