import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        await dbConnect(); // Ensure DB connection

        // Get the token from the URL
        const token = req.nextUrl.searchParams.get("token");
        if (!token) {
            return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
        }

        // Verify the JWT token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
        } catch (err) {
            console.error("JWT verification error:", err);
            return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
        }

        // Find the user in the database
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if the verification token matches the one stored in the database
        if (user.verificationToken !== token) {
            return NextResponse.json({ error: "Invalid or mismatched verification token" }, { status: 400 });
        }

        // Check if the token has expired
        if (user.verificationExpires && user.verificationExpires < new Date()) {
            return NextResponse.json({ error: "Verification token has expired" }, { status: 400 });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return NextResponse.json({ message: "Your email is already verified" }, { status: 200 });
        }

        // Mark the user as verified and remove token fields
        await User.findByIdAndUpdate(user._id, {
            $unset: { verificationToken: 1, verificationExpires: 1 }, // Remove token fields
            $set: { isVerified: true } // Mark as verified
        });

        // Redirect to the login page after verification
        return NextResponse.redirect(new URL("/login", req.url));

    } catch (error: any) {
        console.error("Email verification error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
