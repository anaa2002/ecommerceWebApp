import express from "express";
import {
  getMe,
  login,
  logout,
  refreshToken,
  signup,
} from "../controllers/authController.js";
import { loginValidate, signupValidate } from "../middleware/authValidate.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signupValidate, signup);
authRouter.post("/login", loginValidate, login);
authRouter.post("/logout", logout);
authRouter.post("/refresh-token", refreshToken);

authRouter.get("/me", protectRoute, getMe);

export default authRouter;
