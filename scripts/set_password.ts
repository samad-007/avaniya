import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { hashPassword } from "../src/lib/auth";
import mongoose from "mongoose";

async function main() {
  const args = process.argv.slice(2);
  const email = args[0]?.toLowerCase().trim();
  const newPassword = args[1]?.trim();

  if (!email || !newPassword) {
    console.log("Usage: npx tsx --env-file=.env.local scripts/set_password.ts <email> <newPassword>");
    process.exit(1);
  }

  try {
    await connectDB();
    console.log(`Connected to database '${mongoose.connection.name}'`);

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email '${email}' not found in database '${mongoose.connection.name}'`);
      process.exit(1);
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    console.log(`✓ Password successfully updated for ${user.name} (${user.email}) in database '${mongoose.connection.name}'!`);
  } catch (err: unknown) {
    console.error("Error setting password:", err instanceof Error ? err.message : err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
