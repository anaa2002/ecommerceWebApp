import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required."] },
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    image: { url: String, publicId: String },
    category: {
      type: String,
      required: [true, "Category is required."],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
