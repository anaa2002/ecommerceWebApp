import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { confirmCheckoutSuccess } from "../api/paymentApi";

function PurchaseSuccessPage() {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [message, setMessage] = useState("");
  const hasConfirmed = useRef(false);

  useEffect(() => {
    async function confirmPayment() {
      if (hasConfirmed.current) return;
      hasConfirmed.current = true;
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setMessage("Missing Stripe session id.");
        setIsConfirming(false);
        return;
      }

      try {
        const res = await confirmCheckoutSuccess(sessionId);
        setMessage(res.data.message || "Payment successful.");
        toast.success("Payment successful.");
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Could not confirm payment.";

        setMessage(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsConfirming(false);
      }
    }

    confirmPayment();
  }, [searchParams]);

  if (isConfirming) {
    return <p className="loading-screen">Confirming payment...</p>;
  }

  return (
    <section className="checkout-result-page">
      <div className="checkout-result-card">
        <h1>Purchase Successful</h1>
        <p>{message}</p>
        <Link to="/">Back to shop</Link>
      </div>
    </section>
  );
}

export default PurchaseSuccessPage;
