import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/auth';
import ActivityLog from '@/models/ActivityLog';
import { dbConnect } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    await dbConnect();

    const session = getSession(); // ✅ Removed argument and `await`
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const logs = await ActivityLog.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching activity logs:', error); // ✅ Fix ESLint unused error
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
