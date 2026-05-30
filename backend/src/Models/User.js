import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Email is not in a correct format."],
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      select: false,
      minlength: [8, "Password must be at least 8 characters long."],
    },
    cartItems: [
      {
        quantity: { type: Number, default: 1 },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    passwordCreatedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordCreatedAt = Date.now();
});

userSchema.methods.comparePasswords = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.passwordCreatedAfter = function (jwtIat) {
  if (!this.passwordCreatedAt) return false;
  const createdAtSeconds = Math.floor(this.passwordCreatedAt.getTime() / 1000);
  return createdAtSeconds > jwtIat;
};

export default mongoose.model("User", userSchema);
