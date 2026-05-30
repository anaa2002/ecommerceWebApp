import { Link } from "react-router-dom";

function PurchaseCancelPage() {
  return (
    <section className="checkout-result-page">
      <div className="checkout-result-card">
        <h1>Purchase Cancelled</h1>
        <p>Your payment was cancelled. Your cart is still waiting for you.</p>
        <Link to="/cart">Back to cart</Link>
      </div>
    </section>
  );
}

export default PurchaseCancelPage;
