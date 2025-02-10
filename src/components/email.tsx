import * as React from "react";

interface EmailTemplateProps {
    verificationLink: string;
}

export const VerificationEmail: React.FC<EmailTemplateProps> = ({
                                                                            verificationLink,
                                                                        }) => (
    <div
        style={{
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f4f4f4",
            textAlign: "center",
            padding: "20px",
        }}
    >
        <div
            style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                maxWidth: "500px",
                margin: "auto",
            }}
        >
            <h2>Verify Your Email</h2>
            <p>Thank you for signing up! Please verify your email by clicking the button below.</p>
            <a
                href={verificationLink}
                style={{
                    backgroundColor: "#28a745",
                    color: "#ffffff",
                    padding: "10px 20px",
                    textDecoration: "none",
                    borderRadius: "5px",
                    display: "inline-block",
                    marginTop: "20px",
                }}
            >
                Verify Email
            </a>
            <p>This link will expire in 1 hour.</p>
        </div>
    </div>
);
export default VerificationEmail;