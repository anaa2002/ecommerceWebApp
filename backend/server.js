import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server running on PORT: ${PORT}.`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
