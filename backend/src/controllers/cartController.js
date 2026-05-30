import Product from "../Models/Product.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!productId) throw new ApiError("Product ID is required.", 400);

  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cartItems.push({
      product: productId,
      quantity: 1,
    });
  }

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Cart item added successfully.",
    data: user.cartItems,
  });
});

export const removeAllFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!productId) {
    user.cartItems = [];
  } else {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId,
    );
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: productId
      ? "Product removed from cart successfully."
      : "Cart emptied successfully.",
    data: user.cartItems,
  });
});

export const updateQuantity = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { quantity } = req.body;
  const user = req.user;

  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId,
  );

  if (!existingItem) throw new ApiError("Product not found in cart.", 404);

  if (quantity <= 0) {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId,
    );
  } else {
    existingItem.quantity = quantity;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Cart updated successfully.",
    data: user.cartItems,
  });
});

export const getCartProducts = asyncHandler(async (req, res) => {
  const productIds = req.user.cartItems.map((item) => item.product);

  const products = await Product.find({
    _id: { $in: productIds },
  });

  const cartItems = products.map((product) => {
    const item = req.user.cartItems.find(
      (cartItem) => cartItem.product.toString() === product._id.toString(),
    );

    return {
      ...product.toJSON(),
      quantity: item.quantity,
    };
  });

  res.status(200).json({
    status: "success",
    data: cartItems,
  });
});
