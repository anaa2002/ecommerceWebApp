import { useState } from "react";
import CreateProductForm from "../components/CreateProductForm";
import AdminProductList from "../components/AdminProductList";

function AdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleProductCreated() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <section className="admin-page">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <p>Create and manage products here.</p>

        <CreateProductForm onProductCreated={handleProductCreated} />
        <AdminProductList refreshKey={refreshKey} />
      </div>
    </section>
  );
}

export default AdminPage;
