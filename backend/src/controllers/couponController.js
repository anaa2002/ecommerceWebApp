import Coupon from "../Models/Coupon.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
  res.status(200).json({ status: "success", data: coupon });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({
    code: code,
    userId: req.user._id,
    isActive: true,
  });

  if (!coupon) throw new ApiError("Coupon not found.", 404);
  if (coupon.expirationDate < new Date()) {
    coupon.isActive = false;
    await coupon.save();
    throw new ApiError("Coupon expired.", 404);
  }
  res.status(200).json({
    status: "success",
    data: {
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    },
  });
});
