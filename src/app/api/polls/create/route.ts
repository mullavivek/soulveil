import { NextResponse } from "next/server";
import { getSession } from "@/utils/auth";
import Poll from "@/models/Poll";
import { dbConnect } from "@/lib/mongodb";
import { z } from "zod";

const pollSchema = z.object({
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string()).min(2).max(10),
});

export async function POST(req: Request) {
    await dbConnect();

    const session = getSession(); // ✅ Removed the argument to fix TS2554
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = pollSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const newPoll = new Poll({
        question: body.question,
        options: body.options.map((option: string) => ({ option, votes: 0 })),
        userId: session.userId, // ✅ Fixed session.user.id → session.userId
    });

    await newPoll.save();
    return NextResponse.json(newPoll, { status: 201 });
}
