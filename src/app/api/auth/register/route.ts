import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { sendVerificationEmail } from "@/app/api/auth/send/route";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { username, email, password } = registerSchema.parse(body);

        // Check if NEXTAUTH_SECRET is loaded
        if (!process.env.NEXTAUTH_SECRET) {
            throw new Error("NEXTAUTH_SECRET is not defined. Check your .env file.");
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with verified = false
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verified: false,
        });
        await newUser.save();

        // Generate verification token
        const verificationToken = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.NEXTAUTH_SECRET as string, // Explicitly cast to string
            { expiresIn: "1h" }
        );

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return NextResponse.json({ message: "User registered! Please verify your email." }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
