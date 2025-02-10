"use client";

import { useEffect, useState } from "react";

interface User {
    id: string;
    username: string;
    email: string;
    allowMessages: boolean;
}

interface Post {
    _id: string;
    content: string;
    createdAt: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const userRes = await fetch("/api/user/session");
                const postRes = await fetch("/api/posts/fetch?user=true");

                if (!userRes.ok || !postRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const userData = await userRes.json();
                const postData = await postRes.json();

                setUser(userData);
                setPosts(postData);
            } catch (err) {
                setError("Error loading profile");
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold text-center">Profile</h2>

            {user && (
                <div className="mt-4">
                    <p><strong>Anonymous Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Messaging:</strong> {user.allowMessages ? "Enabled" : "Disabled"}</p>
                </div>
            )}

            <h3 className="text-xl font-semibold mt-6">Your Posts</h3>
            {posts.length > 0 ? (
                <ul className="mt-3 space-y-3">
                    {posts.map((post) => (
                        <li key={post._id} className="p-3 bg-gray-100 rounded">
                            <p>{post.content}</p>
                            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-gray-500">You haven't posted anything yet.</p>
            )}
        </div>
    );
}
