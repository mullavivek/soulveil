import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { sendVerificationEmail } from "@/app/api/auth/send/route";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { username, email, password } = registerSchema.parse(body);

        // Ensure NEXTAUTH_SECRET is available
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            throw new Error("NEXTAUTH_SECRET is not defined. Check your .env file.");
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isVerified: false, // Ensure correct field name
        });

        await newUser.save(); // Save user first to get the _id

        // Generate verification token AFTER user is created
        const verificationToken = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            secret,
            { expiresIn: "1h" }
        );

        // Store the token in the database
        newUser.verificationToken = verificationToken;
        await newUser.save();

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return NextResponse.json(
            { message: "User registered! Please check your email to verify your account." },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
