import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Product from "../Models/Product.js";
import { redis } from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json({ status: "success", data: products });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const cachedFeaturedProducts = await redis.get("featured_products");

  if (cachedFeaturedProducts) {
    const products =
      typeof cachedFeaturedProducts === "string"
        ? JSON.parse(cachedFeaturedProducts)
        : cachedFeaturedProducts;

    return res.status(200).json({
      status: "success",
      data: products,
    });
  }

  const featuredProducts = await Product.find({ isFeatured: true }).lean();

  await redis.set("featured_products", JSON.stringify(featuredProducts));

  res.status(200).json({
    status: "success",
    data: featuredProducts,
  });
});

export const getProductById = asyncHandler(async (req, res) => {});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category } = req.body;

  let uploadedImage = null;

  if (image) {
    uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "products",
    });
  }

  const product = await Product.create({
    name,
    description,
    price,
    image: {
      url: uploadedImage?.secure_url || "",
      publicId: uploadedImage?.public_id || "",
    },
    category,
  });

  res.status(201).json({
    status: "success",
    message: "Product created successfully.",
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category } = req.body;

  const product = await Product.findById(id);

  if (!product) throw new ApiError("Product not found.", 404);

  if (image && image !== product.image?.url) {
    if (product.image?.publicId) {
      await cloudinary.uploader.destroy(product.image.publicId);
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "products",
    });

    product.image = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };
  }

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.category = category ?? product.category;

  const updatedProduct = await product.save();

  await updateFeaturedProductCache();

  res.status(200).json({
    status: "success",
    message: "Product updated successfully.",
    data: updatedProduct,
  });
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) throw new ApiError("Product not found.", 404);

  if (product.image?.publicId) {
    await cloudinary.uploader.destroy(product.image.publicId);
  }

  await Product.findByIdAndDelete(id);
  await updateFeaturedProductCache();

  res.status(200).json({
    status: "success",
    message: "Product deleted successfully.",
  });
});

export const getRecommendedProducts = asyncHandler(async (req, res) => {
  const products = await Product.aggregate([
    { $sample: { size: 3 } },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        image: 1,
        price: 1,
      },
    },
  ]);

  res.status(200).json({ status: "success", data: products });
});

export const getProductByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const products = await Product.find({ category });
  res.status(200).json({ status: "success", data: products });
});

export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) throw new ApiError("No product found.", 404);

  product.isFeatured = !product.isFeatured;
  const updatedProduct = await product.save();
  await updateFeaturedProductCache();
  res.status(200).json({
    status: "success",
    message: "Product toggled.",
    data: updatedProduct,
  });
});

async function updateFeaturedProductCache(req, res) {
  const featuredProducts = await Product.find({ isFeatured: true }).lean();
  await redis.set("featured_products", JSON.stringify(featuredProducts));
}
