import { Resend } from "resend";
import VerificationEmail from "@/components/email"; // ✅ Ensure default import

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${process.env.APP_URL}/api/verify?token=${token}`;

    const { error } = await resend.emails.send({
        from:  "onboarding@resend.dev",
        to: [email],
        subject: "Verify Your Email",
        react: VerificationEmail({verificationLink}) , // ✅ Use correctly
});

    if (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send verification email");
    }
}
