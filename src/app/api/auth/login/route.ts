import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";
import { signJwtToken } from "@/utils/auth";

export async function POST(req: Request) {
    try {
        // 🔍 Check if Mongoose is connected before calling dbConnect()
        if (mongoose.connection.readyState === 0) {
            console.log("⚠️ MongoDB is disconnected. Attempting to connect...");
            await dbConnect();
        } else {
            console.log("✅ MongoDB is already connected.");
        }

        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.verified) {
            return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // ✅ Convert user._id to a string to avoid TypeScript error
        const token = signJwtToken(user._id.toString());

        return NextResponse.json({ message: "Login successful", token }, { status: 200 });
    } catch (error) {
        console.error("❌ Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
