"use client";

import { useState } from "react";

interface PostProps {
    postId: string;
    content: string;
    author: string;
    createdAt: string;
    likes: string[];
    currentUserId: string;
    onLike: (postId: string) =>Promise<void>;
}

export default function PostCard({ postId, content, author, createdAt, likes, currentUserId }: PostProps) {
    const [likeCount, setLikeCount] = useState(likes.length);
    const [liked, setLiked] = useState(likes.includes(currentUserId));

    const handleLike = async () => {
        try {
            const res = await fetch("/api/posts/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId }),
            });

            if (!res.ok) throw new Error("Failed to like/unlike");

            setLiked(!liked);
            setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{author}</h3>
                <span className="text-sm text-gray-500">{new Date(createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-gray-700">{content}</p>
            <div className="flex items-center mt-3">
                <button
                    className={`px-3 py-1 rounded-lg ${liked ? "bg-red-500 text-white" : "bg-gray-300"}`}
                    onClick={handleLike}
                >
                    {liked ? "Unlike" : "Like"}
                </button>
                <span className="ml-2 text-gray-600">{likeCount} {likeCount === 1 ? "Like" : "Likes"}</span>
            </div>
        </div>
    );
}
