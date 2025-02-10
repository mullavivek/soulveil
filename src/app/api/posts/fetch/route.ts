import { NextResponse } from 'next/server';
import Post from '@/models/Post';
import { dbConnect }from '@/lib/mongodb';

export async function GET() {
    await dbConnect();
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(posts, { status: 200 });
}