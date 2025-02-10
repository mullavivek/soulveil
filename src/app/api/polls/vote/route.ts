import { NextResponse } from "next/server";
import { getSession } from "@/utils/auth";
import Poll from "@/models/Poll";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
    await dbConnect();

    const session = getSession(); // ✅ Removed argument and `await`
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { pollId, optionIndex } = await req.json();
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return NextResponse.json({ error: "Poll not found" }, { status: 404 });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
        }

        poll.options[optionIndex].votes += 1;
        await poll.save();

        return NextResponse.json(poll, { status: 200 });
    } catch (error) {
        console.error("Error processing poll vote:", error); // ✅ Logs the error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
