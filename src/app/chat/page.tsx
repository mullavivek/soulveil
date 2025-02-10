"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getSession } from "@/utils/auth";
import ChatBox from "@/components/ChatBox";

interface Message {
    _id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Initialize socket connection and fetch session
    useEffect(() => {
        const fetchSessionAndConnect = async () => {
            try {
                const session = await getSession();
                if (!session) return;

                setUserId(session.user.id);
                const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
                setSocket(newSocket);

                newSocket.emit("join", session.user.id);

                newSocket.on("receiveMessage", (newMessage: Message) => {
                    setMessages((prev) => [...prev, newMessage]);
                });

                return () => {
                    newSocket.off("receiveMessage");
                    newSocket.disconnect();
                };
            } catch (error) {
                console.error("Error connecting to socket:", error);
            }
        };

        fetchSessionAndConnect().catch(console.error);
    }, []);

    // Fetch message history
    useEffect(() => {
        const fetchMessages = async () => {
            if (!userId) return;
            try {
                const res = await fetch("/api/messages/fetch");
                if (!res.ok) throw new Error("Failed to fetch messages");

                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages().catch(console.error);
    }, [userId]);

    // Handle sending message
    const sendMessage = async () => {
        if (!message.trim() || !socket || !userId) return;

        const newMessage: Message = {
            _id: Date.now().toString(),
            senderId: userId,
            recipientId: "someUserId", // Replace with actual recipient logic
            content: message,
            createdAt: new Date().toISOString(),
        };

        // Optimistically update UI
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");

        // Send message to socket server
        socket.emit("sendMessage", newMessage);

        try {
            await fetch("/api/messages/send", {
                method: "POST",
                body: JSON.stringify(newMessage),
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100">
            <h1 className="text-2xl font-semibold text-center mb-4">Chat</h1>

            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4">
                {messages.map((msg) => (
                    <ChatBox key={msg._id} message={msg} isSender={msg.senderId === userId} userId={userId || ""} />
                ))}
            </div>

            <div className="flex items-center mt-4">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}
