import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import AdminRoute from "./routes/AdminRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import CartPage from "./pages/CartPage";
import Footer from "./components/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const { isCheckingAuth } = useAuth();

  if (isCheckingAuth)
    return <p className="loading-screen">Checking authentication...</p>;

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignUpPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route path="/purchase-success" element={<PurchaseSuccessPage />} />
          <Route path="/purchase-cancel" element={<PurchaseCancelPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
