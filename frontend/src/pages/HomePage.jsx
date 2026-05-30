import { useEffect, useState } from "react";
import {
  getFeaturedProducts,
  getRecommendedProducts,
  getProductsByCategory,
} from "../api/productApi";
import ProductCard from "../components/ProductCard";

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [hoodies, setHoodies] = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const [featuredRes, recommendedRes, hoodiesRes, electronicsRes] =
          await Promise.all([
            getFeaturedProducts(),
            getRecommendedProducts(),
            getProductsByCategory("hoodies"),
            getProductsByCategory("electronics"),
          ]);

        setFeaturedProducts(featuredRes.data.data || []);
        setRecommendedProducts(recommendedRes.data.data || []);
        setHoodies(hoodiesRes.data.data || []);
        setElectronics(electronicsRes.data.data || []);
      } catch (error) {
        const message =
          error.response?.data?.message || "Could not load products.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeProducts();
  }, []);

  if (isLoading) {
    return <p className="loading-screen">Loading shop...</p>;
  }

  if (errorMessage) {
    return <p className="loading-screen">{errorMessage}</p>;
  }

  return (
    <section className="shop-home-page">
      <div className="shop-hero">
        <p className="eyebrow">MoonCart Collection</p>
        <h1>Curated goods for cozy chaos.</h1>
        <p>
          A polished MERN e-commerce shop with admin product management, cart
          flow, and Stripe checkout.
        </p>
      </div>

      <ProductSection
        title="Featured Products"
        subtitle="Handpicked items from the admin dashboard."
        products={featuredProducts}
      />

      <ProductSection
        title="Recommended"
        subtitle="A rotating little shelf of shop treasures."
        products={recommendedProducts}
      />

      <ProductSection
        title="Hoodies"
        subtitle="Soft hoodie for coding, walking, and just.... existing."
        products={hoodies}
      />

      <ProductSection
        title="Electronics"
        subtitle="Small tech pieces for sharper everyday rituals."
        products={electronics}
      />
    </section>
  );
}

function ProductSection({ title, subtitle, products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="home-product-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default HomePage;
