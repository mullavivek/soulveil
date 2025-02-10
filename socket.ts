import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";

interface ServerWithIO extends HttpServer {
    io?: Server;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: { server: ServerWithIO } }) => {
    if (res.socket.server.io) {
        console.log("Socket.io is already running");
        res.end();
        return;
    }

    console.log("Initializing Socket.io");
    const io = new Server(res.socket.server, {
        path: "/api/socket",
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        // Handle Post Likes
        socket.on("likePost", (postId: string) => {
            console.log(`Post ${postId} liked`);
            io.emit("updatePost", postId); // Notify all clients to update the post
        });

        // Handle Real-Time Messaging
        socket.on("sendMessage", ({ senderId, receiverId, message }) => {
            console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
            io.to(receiverId).emit("receiveMessage", { senderId, message });
        });

        socket.on("joinRoom", (userId: string) => {
            socket.join(userId);
            console.log(`User ${userId} joined their personal chat room`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    });

    res.end();
};

export default SocketHandler;