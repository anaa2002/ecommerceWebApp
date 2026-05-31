import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";

const isProduction = process.env.NODE_ENV === "production";

function getCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge,
  };
}

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES },
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES },
  );

  return { accessToken, refreshToken };
}

async function storeRefreshToken(userId, refreshToken) {
  await redis.set(`refreshToken:${userId}`, refreshToken, {
    ex: 7 * 24 * 60 * 60,
  });
}

function setCookies(res, accessToken, refreshToken) {
  res.cookie(
    "accessToken",
    accessToken,
    getCookieOptions(Number(process.env.ACCESS_TOKEN_COOKIE_AGE) * 60 * 1000),
  );

  res.cookie(
    "refreshToken",
    refreshToken,
    getCookieOptions(
      Number(process.env.REFRESH_TOKEN_COOKIE_AGE) * 24 * 60 * 60 * 1000,
    ),
  );
}

export const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError("User already exists.", 400);
  const user = await User.create({ username, email, password });

  const { accessToken, refreshToken } = generateTokens(user._id);
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);
  res.status(201).json({
    status: "success",
    message: "User was created successfully.",
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePasswords(password)))
    throw new ApiError("Wrong credentials.", 400);
  const { accessToken, refreshToken } = generateTokens(user._id);
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);
  res.status(200).json({
    status: "success",
    message: "User logged in successfully.",
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );
    await redis.del(`refresh_token:${decoded.userId}`);
  }

  const clearCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
  };

  res.clearCookie("accessToken", clearCookieOptions);
  res.clearCookie("refreshToken", clearCookieOptions);
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully." });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const rToken = req.cookies?.refreshToken;
  if (!rToken) throw new ApiError("No refresh token provided.", 401);
  const decoded = jwt.verify(rToken, process.env.JWT_REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError("Unauthorized.", 401);
  const storedToken = await redis.get(`refreshToken:${decoded.userId}`);
  if (storedToken !== rToken) throw new ApiError("Invalid refresh token.", 401);

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES },
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_AGE) * 60 * 1000,
  });

  res
    .status(200)
    .json({ status: "success", message: "Token refreshed successfully." });
});

export const forgotPassword = asyncHandler(async (req, res) => {});

export const resetPassword = asyncHandler(async (req, res) => {});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError("Unauthorized.", 401);
  res.status(200).json({ status: "success", data: { user } });
});
