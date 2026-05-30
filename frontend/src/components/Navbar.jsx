import { Link } from "react-router-dom";
import { ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        MoonCart
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>

        {user ? (
          <>
            <span className="user-pill">Hello, {user.username}</span>

            <Link to="/cart" className="cart-link">
              <ShoppingCart size={18} />
              Cart
            </Link>

            {user.role === "admin" && <Link to="/admin">Admin</Link>}

            <button onClick={logout} className="logout-button">
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
