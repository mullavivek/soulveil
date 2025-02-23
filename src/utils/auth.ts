import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { getServerSession } from "next-auth";

// Ensure secret is properly set
const SECRET = process.env.NEXTAUTH_SECRET;
if (!SECRET) {
    throw new Error("❌ NEXTAUTH_SECRET is missing in environment variables.");
}

// JWT Signing Function
export const signJwtToken = (payload: string | object) => {
    return jwt.sign({ id: payload }, SECRET, { expiresIn: "7d" });
};

// Get Session Function with proper type handling
export const getSession = async (): Promise<{ User?: { id: string; username: string; email: string } } | null> => {
    return (await getServerSession(authOptions)) as { User?: { id: string; username: string; email: string } } | null;
};

// Define Extended User Type
interface ExtendedUser extends NextAuthUser {
    id: string;
    username: string;
    email: string;
}

// NextAuth Configuration
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "your_username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<ExtendedUser | null> {
                await dbConnect();

                if (!credentials?.username || !credentials?.password) {
                    console.error("❌ Missing username or password");
                    throw new Error("Missing username or password");
                }

                // Fetch user from database
                const user = (await User.findOne({ username: credentials.username })) as IUser | null;

                if (!user) {
                    console.error(`❌ User not found: ${credentials.username}`);
                    throw new Error("User not found");
                }

                if (!user.isVerified) {
                    console.warn(`⚠️ Unverified account: ${credentials.username}`);
                    throw new Error("Please verify your email before logging in.");
                }

                const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                if (!isValidPassword) {
                    console.error("❌ Invalid password attempt");
                    throw new Error("Invalid password");
                }

                console.log(`✅ Successful login: ${user.username}`);

                return {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                };
            },
        }),
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
                    id: (user as ExtendedUser).id,
                    username: (user as ExtendedUser).username,
                    email: (user as ExtendedUser).email,
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
                    username: token.username as string,
                    email: token.email as string,
                },
            };
        },
    },
    secret: SECRET,
    debug: process.env.NODE_ENV === "development",
};

// NextAuth API Route Handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
