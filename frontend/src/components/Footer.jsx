import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <ShoppingBag size={22} />
            <span>MoonCart</span>
          </div>

          <p>
            A MERN e-commerce app with admin product management, cart flow, and
            Stripe checkout.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h3>Shop</h3>
            <Link to="/">Home</Link>
            <Link to="/cart">Cart</Link>
          </div>

          <div>
            <h3>Project</h3>
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <span>React • Node • MongoDB</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} MoonCart. Built as a full-stack portfolio project.</p>
      </div>
    </footer>
  );
}

export default Footer;
