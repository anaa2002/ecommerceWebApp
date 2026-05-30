import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, logoutUser, signupUser } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  async function checkAuth() {
    try {
      const res = await getMe();
      setUser(res.data.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }

  async function signup(formData) {
    setIsLoading(true);
    try {
      const res = await signupUser(formData);
      setUser(res.data.data.user);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Signup failed. Please try again.";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }

  async function login(formData) {
    setIsLoading(true);
    try {
      const res = await loginUser(formData);
      setUser(res.data.data.user);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isCheckingAuth,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
