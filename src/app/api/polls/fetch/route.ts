import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import {dbConnect} from '@/lib/mongodb';

export async function GET() {
    await dbConnect();
    const polls = await Poll.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(polls, { status: 200 });
}