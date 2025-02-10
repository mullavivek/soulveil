import { z } from "zod";

// User registration validation
export const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Login validation
export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Post creation validation
export const postSchema = z.object({
    content: z.string().min(1, "Post content cannot be empty"),
});

// Poll creation validation
export const pollSchema = z.object({
    question: z.string().min(5, "Poll question must be at least 5 characters long"),
    options: z
        .array(z.string().min(1, "Each option must have text"))
        .min(2, "Poll must have at least 2 options")
        .max(10, "Poll can have at most 10 options"),
});

// Message validation
export const messageSchema = z.object({
    senderId: z.string(),
    receiverId: z.string(),
    content: z.string().min(1, "Message cannot be empty"),
});
