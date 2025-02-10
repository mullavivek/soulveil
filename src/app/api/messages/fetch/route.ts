import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/auth";
import Message from "@/models/Message";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    await dbConnect();

    const session = getSession(); // ✅ Removed 'await' since getSession is not async
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Correctly retrieve chatPartnerId from URL params
    const chatPartnerId = req.nextUrl.searchParams.get("chatPartnerId");
    if (!chatPartnerId) {
        return NextResponse.json({ error: "Missing chatPartnerId" }, { status: 400 });
    }

    const messages = await Message.find({
        $or: [
            { senderId: session.userId, recipientId: chatPartnerId },
            { senderId: chatPartnerId, recipientId: session.userId }
        ]
    }).sort({ createdAt: -1 });

    return NextResponse.json(messages);
}
