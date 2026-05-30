import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getCoupon, validateCoupon } from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.get("/", protectRoute, getCoupon);
couponRouter.post("/validate", protectRoute, validateCoupon);

export default couponRouter;
