import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.db.collection("users");

    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map((i) => i.name));

    await collection.dropIndex("phone_1");
    console.log("✅ Dropped phone_1 index successfully");

  } catch (err) {
    console.log("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Done — now redeploy your backend");
    process.exit(0);
  }
};

fix();