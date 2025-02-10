import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";

const JWT_SECRET: Secret | undefined = process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
    throw new Error("NEXTAUTH_SECRET is missing. Set it in your .env file.");
}

/**
 * Sign a JWT token
 * @param payload - Data to encode in the token
 * @param expiresIn - Expiration time (default: 7 days)
 * @returns Signed JWT token
 */
export const signToken = (payload: Record<string, unknown>, expiresIn: SignOptions["expiresIn"] = "7d"): string => {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify a JWT token
 * @param token - The token to verify
 * @returns Decoded payload if valid, or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};
