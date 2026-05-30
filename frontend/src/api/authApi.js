import api from "./axios";

export function signupUser(formData) {
  return api.post("/auth/signup", formData);
}

export function loginUser(formData) {
  return api.post("/auth/login", formData);
}

export function logoutUser(formData) {
  return api.post("/auth/logout");
}

export function getMe() {
  return api.get("/auth/me");
}
