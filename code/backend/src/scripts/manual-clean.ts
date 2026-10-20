import "../config/env";
import { connectDB } from "../database/db";

async function run() {
  console.log("Starting manual data cleaning job...");
  try {
    await connectDB();

    console.log("Manual job finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Manual job failed:", err);
    process.exit(1);
  }
}

run();
