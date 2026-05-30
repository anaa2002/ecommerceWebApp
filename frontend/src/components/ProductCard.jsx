import toast from "react-hot-toast";
import { addProductToCart } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";

function ProductCard({ product }) {
  const { user } = useAuth();
  const imageUrl = product.image?.url || "https://placehold.co/400x500";

  async function handleAddToCart() {
    if (!user) {
      toast.error("Please login first.");
      return;
    }

    try {
      await addProductToCart(product._id);
      toast.success("Product added to cart.");
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not add product to cart.";
      toast.error(message);
    }
  }

  return (
    <article className="product-card">
      <img className="product-image" src={imageUrl} alt={product.name} />

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">${product.price}</span>

          <button
            type="button"
            className="add-cart-button"
            onClick={handleAddToCart}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
