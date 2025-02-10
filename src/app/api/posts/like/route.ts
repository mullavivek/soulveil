import { NextResponse } from 'next/server';
import { getSession } from '@/utils/auth';
import Post from '@/models/Post';
import { dbConnect } from '@/lib/mongodb';

export async function POST(req: Request) {
    await dbConnect();

    const session = getSession(); // ✅ Removed argument and `await`
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { postId } = await req.json();
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const likedIndex = post.likes.indexOf(session.user.id);
        if (likedIndex > -1) {
            post.likes.splice(likedIndex, 1); // ✅ Unlike the post
        } else {
            post.likes.push(session.user.id); // ✅ Like the post
        }

        await post.save();

        return NextResponse.json(post, { status: 200 });
    } catch (error) {
        console.error('Error updating likes:', error); // ✅ Fix ESLint unused error
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
