import ApiError from "../utils/ApiError.js";

export const signupValidate = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username?.trim() || !email?.trim() || !password)
    throw new ApiError("All fields are required.", 400);
  next();
};

export const loginValidate = (req, res, next) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password)
    throw new ApiError("All fields are required.", 400);
  next();
};
