import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Coupon from "../Models/Coupon.js";
import Order from "../Models/Order.js";
import { stripe } from "../config/stripe.js";
import User from "../Models/User.js";

// createCheckoutSession -> send user to Stripe
// checkoutSuccess -> verify payment and create order

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { products, couponCode } = req.body;

  if (!Array.isArray(products) || products.length === 0)
    throw new ApiError("Invalid or empty products array.", 404);

  let totalAmount = 0;
  const lineItems = products.map((product) => {
    const amount = Math.round(product.price * 100); // stripe wants cents
    totalAmount += amount * product.quantity;
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: product.image?.url ? [product.image.url] : [],
        },
        unit_amount: amount,
      },
      quantity: product.quantity || 1,
    };
  });

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode,
      userId: req.user._id,
      isActive: true,
    });

    if (coupon) {
      totalAmount -= Math.round(
        (totalAmount * coupon.discountPercentage) / 100,
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
    discounts: coupon
      ? [
          {
            coupon: await createStripeCoupon(coupon.discountPercentage),
          },
        ]
      : [],
    metadata: {
      userId: req.user._id.toString(),
      couponCode: couponCode || "",
      products: JSON.stringify(
        products.map((p) => ({
          id: p._id,
          quantity: p.quantity,
          price: p.price,
        })),
      ),
    },
  });

  if (totalAmount >= 20000) {
    await createNewCoupon(req.user._id);
  }

  res.status(200).json({
    status: "success",
    id: session.id,
    url: session.url,
    totalAmount: totalAmount / 100,
  });
});

export const checkoutSuccess = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new ApiError("Payment was not completed.", 400);
  }

  const existingOrder = await Order.findOne({
    stripeSessionId: sessionId,
  });

  if (existingOrder) {
    await User.findByIdAndUpdate(session.metadata.userId, {
      cartItems: [],
    });

    return res.status(200).json({
      status: "success",
      message: "Payment already confirmed. Cart cleared.",
      orderId: existingOrder._id,
    });
  }

  if (session.metadata.couponCode) {
    await Coupon.findOneAndUpdate(
      {
        code: session.metadata.couponCode,
        userId: session.metadata.userId,
      },
      {
        isActive: false,
      },
    );
  }

  const products = JSON.parse(session.metadata.products);

  const newOrder = new Order({
    user: session.metadata.userId,
    products: products.map((product) => ({
      product: product.id,
      quantity: product.quantity,
      price: product.price,
    })),
    totalAmount: session.amount_total / 100,
    stripeSessionId: sessionId,
  });

  await newOrder.save();

  await User.findByIdAndUpdate(session.metadata.userId, {
    cartItems: [],
  });

  res.status(200).json({
    status: "success",
    message: "Payment successful. Order created and cart cleared.",
    orderId: newOrder._id,
  });
});

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}
