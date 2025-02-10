import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = ["/dashboard", "/messages", "/profile"]; // Protected routes
const PUBLIC_ROUTES = ["/", "/login", "/register", "/api/auth"];
const API_PROTECTED_ROUTES = ["/api/posts/like", "/api/posts/create", "/api/messages/send"];

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // If the user is accessing a protected page without a session, redirect to login
    if (AUTH_ROUTES.includes(pathname) && !token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // API protection: Ensure the user is authenticated before making certain requests
    if (API_PROTECTED_ROUTES.includes(pathname) && !token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If authenticated and tries to access login/register, redirect to dashboard
    if (token && PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/messages", "/profile", "/login", "/register", "/api/:path*"],
};
