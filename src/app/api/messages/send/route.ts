import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/auth";
import Message from "@/models/Message";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    await dbConnect();

    const session = getSession(); // ✅ Removed the argument to fix TS2554
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, content } = await req.json();

    if (!recipientId || !content) {
        return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 });
    }

    const message = await Message.create({
        senderId: session.userId, // ✅ Fixed session.user.id → session.userId
        recipientId,
        content,
    });

    return NextResponse.json(message, { status: 201 });
}
