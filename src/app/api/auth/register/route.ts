import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let userId = `user_${Date.now()}`;
    let userRole: "admin" | "user" = "admin";

    // If MongoDB is connected, register the user in the User collection
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return NextResponse.json(
            { success: false, error: "An account with this email already exists" },
            { status: 409 }
          );
        }

        const totalUsers = await User.countDocuments();
        const passwordHash = await hashPassword(password);

        const newUser = await User.create({
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
          role: totalUsers === 0 ? "admin" : "user",
        });

        userId = newUser._id.toString();
        userRole = newUser.role;
      } catch (dbErr: any) {
        console.warn("MongoDB write failed, creating local session", dbErr);
      }
    }

    const payload = {
      userId,
      email: normalizedEmail,
      name: name.trim(),
      role: userRole,
    };

    const token = await signSessionToken(payload);

    const res = NextResponse.json({
      success: true,
      data: {
        userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
