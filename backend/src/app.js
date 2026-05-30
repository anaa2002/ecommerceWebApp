import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/errorMiddleware.js";
import ApiError from "./utils/ApiError.js";
import authRouter from "./routers/authRouter.js";
import productRouter from "./routers/productRouter.js";
import cartRouter from "./routers/cartRouter.js";
import couponRouter from "./routers/couponRouter.js";
import paymentRouter from "./routers/paymentRouter.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/payments", paymentRouter);

app.all(/.*/, (req, res) => {
  throw new ApiError("URL not found.", 404);
});

app.use(errorMiddleware);
export default app;
