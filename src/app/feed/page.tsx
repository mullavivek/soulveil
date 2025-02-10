"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { getSession } from "@/utils/auth";

interface Post {
    _id: string;
    content: string;
    userId: string;
    likes: string[];
    createdAt: string;
}

interface CustomSession {
    user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user session and posts
    useEffect(() => {
        (async () => {
            try {
                const session: CustomSession | null = await getSession();
                setUserId(session?.user?.id ?? null); // Use optional chaining to avoid accessing undefined properties

                const response = await fetch("/api/posts/fetch");
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        })(); // Immediately Invoked Function Expression (IIFE)
    }, []);

    // Handle post like/unlike
    const handleLike = async (postId: string) => {
        try {
            const response = await fetch("/api/posts/like", {
                method: "POST",
                body: JSON.stringify({ postId }),
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPosts((prevPosts) =>
                    prevPosts.map((post) => (post._id === postId ? updatedPost : post))
                );
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Public Feed</h1>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : posts.length > 0 ? (
                <div className="grid gap-4">
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            postId={post._id}
                            content={post.content}
                            author={post.userId}
                            createdAt={post.createdAt}
                            likes={post.likes}
                            currentUserId={userId || ""}
                            onLike={handleLike}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center">No posts available.</p>
            )}
        </div>
    );
}
