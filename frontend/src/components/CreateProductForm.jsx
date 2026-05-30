import { useState } from "react";
import toast from "react-hot-toast";
import { createProduct } from "../api/productApi";

function CreateProductForm({ onProductCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createProduct({
        ...formData,
        price: Number(formData.price),
      });

      toast.success("Product created successfully.");

      onProductCreated();

      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not create product.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>Create Product</h2>

      <label>
        Name
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Velvet Moon Hoodie"
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Soft, mysterious, and suspiciously cozy."
        />
      </label>

      <label>
        Price
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="49"
        />
      </label>

      <label>
        Image
        <input
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Optional image URL/base64"
        />
      </label>

      <label>
        Category
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="hoodies"
        />
      </label>

      <button disabled={isLoading}>
        {isLoading ? "Creating..." : "Create product"}
      </button>
    </form>
  );
}

export default CreateProductForm;
