import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "default_secret";

export const signJwtToken = (payload: string | object) => {
    return jwt.sign({ id: payload }, SECRET, { expiresIn: "7d" });
};
console.log("Exports from auth.ts:", { signJwtToken });

export const getSession = async () => {
    return await getServerSession(authOptions);
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("User not found");
                }

                if (!user.isVerified) {
                    throw new Error("Please verify your email before logging in.");
                }

                const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                if (!isValidPassword) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.username,
                };
            }
        })
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                },
            };
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

