import { useEffect, useState } from "react";
import { createCheckoutSession } from "../api/paymentApi";
import toast from "react-hot-toast";
import {
  getCartItems,
  removeProductFromCart,
  updateCartQuantity,
} from "../api/cartApi";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCart() {
    try {
      const res = await getCartItems();
      setCartItems(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load cart.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleRemove(productId) {
    try {
      await removeProductFromCart(productId);
      setCartItems((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Product removed.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove product.");
    }
  }

  async function handleQuantityChange(productId, newQuantity) {
    try {
      await updateCartQuantity(productId, newQuantity);

      if (newQuantity <= 0) {
        setCartItems((prev) => prev.filter((item) => item._id !== productId));
      } else {
        setCartItems((prev) =>
          prev.map((item) =>
            item._id === productId ? { ...item, quantity: newQuantity } : item,
          ),
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update cart.");
    }
  }

  async function handleCheckout() {
    try {
      const res = await createCheckoutSession(cartItems);

      if (!res.data.url) {
        toast.error("Stripe checkout URL was not returned.");
        return;
      }

      window.location.href = res.data.url;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not start checkout.",
      );
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (isLoading) {
    return <p className="loading-screen">Loading cart...</p>;
  }

  return (
    <section className="cart-page">
      <div className="cart-container">
        <h1>Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-list">
              {cartItems.map((item) => (
                <article className="cart-item" key={item._id}>
                  <img
                    src={item.image?.url || "https://placehold.co/120x120"}
                    alt={item.name}
                  />

                  <div className="cart-item-main">
                    <h2>{item.name}</h2>
                    <p>${item.price}</p>
                  </div>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-cart-button"
                    onClick={() => handleRemove(item._id)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Subtotal: ${subtotal.toFixed(2)}</h2>
              <button type="button" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default CartPage;
