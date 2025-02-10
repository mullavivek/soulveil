import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        await dbConnect(); // Await the database connection

        // Get the token from the URL
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token is missing" }, { status: 400 });
        }

        // Verify the JWT token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string }; // Only expect userId
        } catch (err) {
            console.error("JWT verification error:", err);
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Find the user by decoded user ID
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is already verified
        if (user.emailVerified) {  // Use emailVerified here
            return NextResponse.json({ message: "Email is already verified" }, { status: 200 });
        }

        // Update user's verified status
        user.emailVerified = true;  // Use emailVerified here
        await user.save();

        // Redirect to the login page
        return NextResponse.redirect(new URL('/login', req.url)); // Redirect!

    } catch (error: any) {
        console.error("Email verification error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 }); // Include error message
    }
}
