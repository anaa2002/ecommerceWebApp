import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductByCategory,
  getProductById,
  getRecommendedProducts,
  toggleFeaturedProduct,
  updateProduct,
} from "../controllers/productController.js";
import { adminRoute, protectRoute } from "../middleware/authMiddleware.js";

const productRouter = express.Router();

// productRouter.use(protectRoute);

productRouter.get("/", protectRoute, adminRoute, getAllProducts);
// productRouter.get("/:id", getProductById);
productRouter.post("/", protectRoute, adminRoute, createProduct);
productRouter.patch("/:id", protectRoute, adminRoute, updateProduct);
productRouter.delete("/:id", protectRoute, adminRoute, deleteProduct);
productRouter.patch(
  "/:id/toggle-featured",
  protectRoute,
  adminRoute,
  toggleFeaturedProduct,
);
productRouter.get("/recommended", getRecommendedProducts);
productRouter.get("/featured", getFeaturedProducts);
productRouter.get("/category/:category", getProductByCategory);

export default productRouter;
