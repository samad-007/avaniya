import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, COOKIE_NAME, hashPassword, verifyPassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let userId = `user_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    let userName = normalizedEmail.split("@")[0];
    let userRole: "admin" | "user" = "admin";

    // If MongoDB is connected, authenticate against the User collection
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        let dbUser = await User.findOne({ email: normalizedEmail });

        if (!dbUser) {
          // If no user exists, check total user count; if first user, auto-provision as admin
          const totalUsers = await User.countDocuments();
          const pHash = await hashPassword(password);
          dbUser = await User.create({
            email: normalizedEmail,
            passwordHash: pHash,
            name: userName,
            role: totalUsers === 0 ? "admin" : "user",
          });
        } else {
          // Verify password against stored bcrypt hash
          const isValid = await verifyPassword(password, dbUser.passwordHash);
          if (!isValid) {
            return NextResponse.json(
              { success: false, error: "Invalid email or password" },
              { status: 401 }
            );
          }
        }

        userId = dbUser._id.toString();
        userName = dbUser.name;
        userRole = dbUser.role;
      } catch (dbErr) {
        console.warn("MongoDB auth fallback to local session", dbErr);
      }
    }

    const payload = {
      userId,
      email: normalizedEmail,
      name: userName,
      role: userRole,
    };

    const token = await signSessionToken(payload);

    const res = NextResponse.json({
      success: true,
      data: { userId, email: payload.email, name: payload.name, role: payload.role },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days session
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
