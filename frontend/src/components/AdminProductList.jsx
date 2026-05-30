import { useEffect, useState } from "react";
import {
  getAllProducts,
  toggleFeaturedProduct,
  deleteProduct,
  updateProduct,
} from "../api/productApi";
import toast from "react-hot-toast";

function AdminProductList({ refreshKey }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });

  async function loadProducts() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await getAllProducts();
      setProducts(res.data.data || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not load products.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [refreshKey]);

  function startEditing(product) {
    setEditingProductId(product._id);

    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image?.url || "",
      category: product.category,
    });
  }

  function cancelEditing() {
    setEditingProductId(null);

    setEditFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
    });
  }

  function handleEditChange(e) {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleUpdateProduct(productId) {
    try {
      const res = await updateProduct(productId, {
        ...editFormData,
        price: Number(editFormData.price),
      });

      const updatedProduct = res.data.data;

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? updatedProduct : product,
        ),
      );

      toast.success("Product updated successfully.");
      cancelEditing();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update product.");
    }
  }

  async function handleToggleFeatured(productId) {
    try {
      const res = await toggleFeaturedProduct(productId);
      const updatedProduct = res.data.data;

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? updatedProduct : product,
        ),
      );

      toast.success("Product featured status updated.");
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not update featured status.";

      toast.error(message);
    }
  }

  async function handleDeleteProduct(productId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      await deleteProduct(productId);

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId),
      );

      toast.success("Product deleted successfully.");
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not delete product.";

      toast.error(message);
    }
  }

  if (isLoading) {
    return <p className="admin-status">Loading products...</p>;
  }

  if (errorMessage) {
    return <p className="admin-status error">{errorMessage}</p>;
  }

  return (
    <section className="admin-list">
      <h2>Products</h2>

      {products.length === 0 ? (
        <p className="admin-status">No products created yet.</p>
      ) : (
        <div className="admin-product-list">
          {products.map((product) =>
            editingProductId === product._id ? (
              <article className="admin-edit-card" key={product._id}>
                <input
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="Product name"
                />

                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                />

                <input
                  name="price"
                  type="number"
                  value={editFormData.price}
                  onChange={handleEditChange}
                  placeholder="Price"
                />

                <input
                  name="image"
                  value={editFormData.image}
                  onChange={handleEditChange}
                  placeholder="Image URL/base64"
                />

                <input
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  placeholder="Category"
                />

                <div className="admin-product-actions">
                  <button
                    type="button"
                    className="small-admin-button"
                    onClick={() => handleUpdateProduct(product._id)}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="small-admin-button danger"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                </div>
              </article>
            ) : (
              <article className="admin-product-row" key={product._id}>
                <div>
                  <h3>{product.name}</h3>
                  <p>
                    {product.category} • ${product.price}
                  </p>
                </div>

                <div className="admin-product-actions">
                  <span className="featured-pill">
                    {product.isFeatured ? "Featured" : "Not featured"}
                  </span>

                  <button
                    type="button"
                    className="small-admin-button"
                    onClick={() => handleToggleFeatured(product._id)}
                  >
                    {product.isFeatured ? "Unfeature" : "Feature"}
                  </button>

                  <button
                    type="button"
                    className="small-admin-button"
                    onClick={() => startEditing(product)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="small-admin-button danger"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}

export default AdminProductList;
