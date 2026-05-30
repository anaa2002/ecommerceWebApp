import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protectRoute = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) throw new ApiError("Unauthorized.", 401);
  const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError("Unauthorized.", 401);
  if (user.passwordCreatedAfter(decoded.iat))
    throw new ApiError("Password was updated recently.", 401);
  req.user = user;
  next();
});

export const adminRoute = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else throw new ApiError("Access denied - Admin only", 401);
});
