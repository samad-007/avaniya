import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";
import { connectDB, getSanitizedMongoUri } from "@/lib/db";
import { User } from "@/models/User";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkRateLimit(`register_${ip}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many account registration requests. Please wait a minute.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetInMs / 1000)),
          },
        }
      );
    }

    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let userId = `user_${Date.now()}`;
    let userRole: "super_admin" | "admin" | "user" =
      normalizedEmail === "samad@avaniya.com" ? "super_admin" : "user";
    let datasetId = `ds_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

    // If MongoDB is connected, register the user in the User collection
    if (getSanitizedMongoUri()) {
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
        const assignedRole =
          totalUsers === 0 || normalizedEmail === "samad@avaniya.com"
            ? "super_admin"
            : "user";

        const newUser = await User.create({
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
          role: assignedRole,
          datasetId,
          status: "active",
        });

        userId = newUser._id.toString();
        userRole = newUser.role;
        datasetId = newUser.datasetId;
      } catch (dbErr: unknown) {
        console.warn("MongoDB write failed, creating local session", dbErr);
      }
    }

    const payload = {
      userId,
      email: normalizedEmail,
      name: name.trim(),
      role: userRole,
      datasetId,
    };

    const token = await signSessionToken(payload);

    const res = NextResponse.json({
      success: true,
      data: {
        userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        datasetId: payload.datasetId,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours (daily expiration)
    });

    return res;
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
