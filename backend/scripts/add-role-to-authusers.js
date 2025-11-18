import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

// Load env from project root .env if present
dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

// Simple Auth model schema mirroring existing model
const authSchema = new mongoose.Schema(
  {},
  { strict: false, collection: "authusers" }
);
const AuthUser = mongoose.model("AuthUser", authSchema);

async function run() {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/myDB";
  console.log("Connecting to", mongoUri);
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const res = await AuthUser.updateMany(
      { $or: [{ role: { $exists: false } }, { role: null }] },
      { $set: { role: "user" } }
    );

    console.log(
      "Matched:",
      res.matchedCount ?? res.n ?? "unknown",
      "Modified:",
      res.modifiedCount ?? res.nModified ?? "unknown"
    );

    // Optionally list one updated document for verification
    const one = await AuthUser.findOne({ email: { $exists: true } }).lean();
    console.log("Example document after update (first):", one);
  } catch (err) {
    console.error("Error updating documents:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
