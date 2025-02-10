import { NextResponse } from 'next/server';
import { getSession } from '@/utils/auth';
import Post from '@/models/Post';
import { dbConnect } from '@/lib/mongodb';
import { z } from 'zod';

const postSchema = z.object({
    content: z.string().min(1, 'Post content is required'),
});

export async function POST(req: Request) {
    await dbConnect();

    const session = getSession(); // ✅ Removed argument and `await`
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validation = postSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.format(), { status: 400 });
        }

        const newPost = new Post({ content: body.content, userId: session.user.id });
        await newPost.save();

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error); // ✅ Logs error to fix unused variable issue
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
