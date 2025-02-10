"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
    _id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: string;
}

interface ChatBoxProps {
    userId: string;
    message: Message;
    isSender: boolean;
}

export default function ChatBox({ userId }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
        setSocket(newSocket);

        newSocket.emit("join", userId);

        newSocket.on("receiveMessage", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            newSocket.off("receiveMessage");
            newSocket.disconnect();
        };
    }, [userId]);

    // Send message
    const sendMessage = () => {
        if (!newMessage.trim() || !socket) return;

        const message: Message = {
            _id: Date.now().toString(),
            senderId: userId,
            recipientId: "someUserId", // Replace with actual recipient logic
            content: newMessage,
            createdAt: new Date().toISOString(),
        };

        socket.emit("sendMessage", message);
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
            <div className="h-64 overflow-y-auto border-b border-gray-200 p-2">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`p-2 my-1 rounded-lg max-w-xs ${
                            msg.senderId === userId
                                ? "bg-blue-500 text-white self-end ml-auto"
                                : "bg-gray-200 text-black"
                        }`}
                    >
                        {msg.content}
                        <span className="block text-xs text-gray-500 mt-1 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex mt-2">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
