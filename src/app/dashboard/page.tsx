"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/utils/auth";  // Import from utils
import PostCard from "@/components/PostCard";

interface Post {
    _id: string;
    content: string;
    userId: string;
    likes: string[];
    createdAt: string;
}

interface ActivityLog {
    _id: string;
    action: string;
    createdAt: string;
}

export default function DashboardPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user session
    useEffect(() => {
        const fetchUserSession = async () => {
            try {
                const session = await getSession();
                if (session?.user) {
                    setUserId((session.user as { id?: string })?.id ?? null);
                }
            } catch (error) {
                console.error("Error fetching session:", error);
            }
        };

        void fetchUserSession(); // Acknowledge the Promise to prevent TS warning
    }, []);

    // Fetch user posts and activity logs
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                const [postRes, activityRes] = await Promise.all([
                    fetch("/api/posts/fetch"),
                    fetch("/api/user/activity-log"),
                ]);

                if (postRes.ok) {
                    const postData = await postRes.json();
                    setPosts(postData.filter((post: Post) => post.userId === userId));
                }

                if (activityRes.ok) {
                    const activityData = await activityRes.json();
                    setActivityLogs(activityData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchData(); // Acknowledge the Promise to prevent TS warning
    }, [userId]);

    // Handle post likes (Updated to be async)
    const handleLike = async (postId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/posts/like/${postId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to like the post");
            }

            console.log(`Post ${postId} liked successfully!`);
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Dashboard</h1>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : (
                <>
                    {/* Recent Posts */}
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
                        {posts.length > 0 ? (
                            <div className="grid gap-4">
                                {posts.map((post) => (
                                    <PostCard key={post._id} postId={post._id} content={post.content}
                                              author={post.userId} createdAt={post.createdAt}
                                              likes={post.likes} currentUserId={userId!}
                                              onLike={handleLike} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No posts yet.</p>
                        )}
                    </section>

                    {/* Activity Log */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                        {activityLogs.length > 0 ? (
                            <ul className="bg-white p-4 rounded-lg shadow">
                                {activityLogs.map((log) => (
                                    <li key={log._id} className="py-2 border-b">
                                        {log.action} - <span className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No recent activity.</p>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
