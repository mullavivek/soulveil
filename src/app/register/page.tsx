"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const validation = registerSchema.safeParse(form);
        if (!validation.success) {
            setError(Object.values(validation.error.format()).join(" "));
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold text-center">Register</h2>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <p className="text-sm text-center mt-4">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                    Login
                </a>
            </p>
        </div>
    );
}
