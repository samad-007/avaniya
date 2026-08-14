import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, COOKIE_NAME, hashPassword, verifyPassword } from "@/lib/auth";
import { connectDB, getSanitizedMongoUri } from "@/lib/db";
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
    let userRole: "super_admin" | "admin" | "user" =
      normalizedEmail === "samad@avaniya.com" ? "super_admin" : "user";
    let datasetId = "";

    // If MongoDB is connected, authenticate against the User collection
    if (getSanitizedMongoUri()) {
      try {
        await connectDB();
        let dbUser = await User.findOne({ email: normalizedEmail });

        if (!dbUser) {
          const totalUsers = await User.countDocuments();
          const pHash = await hashPassword(password);
          const assignedRole =
            totalUsers === 0 || normalizedEmail === "samad@avaniya.com"
              ? "super_admin"
              : "user";

          dbUser = await User.create({
            email: normalizedEmail,
            passwordHash: pHash,
            name: userName,
            role: assignedRole,
            datasetId: `ds_${userId}`,
            status: "active",
          });
        } else {
          // Check if user account is suspended
          if (dbUser.status === "suspended") {
            return NextResponse.json(
              { success: false, error: "This account has been suspended. Please contact Super Admin." },
              { status: 403 }
            );
          }

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
        userRole = dbUser.role as "super_admin" | "admin" | "user";
        datasetId = dbUser.datasetId || `ds_${userId}`;
      } catch (dbErr) {
        console.warn("MongoDB auth fallback to local session", dbErr);
      }
    }

    const payload = {
      userId,
      email: normalizedEmail,
      name: userName,
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
