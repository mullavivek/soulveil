"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        // Wrapping async function inside useEffect
        const verifyEmail = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`, {
                    method: "GET", // Ensure it's a GET request
                });

                if (!res.ok) {
                    throw new Error("Verification failed");
                }

                setStatus("success");

                setTimeout(() => {
                    router.push("/login"); // Redirect after success
                }, 2000);
            } catch (error) {
                console.error(error);
                setStatus("error");
            }
        };

        // Call the async function
        (async () => {
            await verifyEmail();
        })();
    }, [token, router]);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-center">
            {status === "loading" && <p className="text-blue-500">Verifying email...</p>}
            {status === "success" && <p className="text-green-500">Email verified! Redirecting to login...</p>}
            {status === "error" && <p className="text-red-500">Invalid or expired token.</p>}
        </div>
    );
}
