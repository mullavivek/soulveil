import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/auth';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongodb';

export async function PUT(req: NextRequest) {
    await dbConnect();

    const session = getSession(); // ✅ Removed argument and `await`
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { allowMessages } = await req.json();

        if (typeof allowMessages !== 'boolean') {
            return NextResponse.json({ error: 'Invalid value for allowMessages' }, { status: 400 });
        }

        await User.findByIdAndUpdate(session.user.id, { allowMessages });

        return NextResponse.json({ message: 'Privacy settings updated' }, { status: 200 });
    } catch (error) {
        console.error('Error updating privacy settings:', error); // ✅ Fix ESLint unused error
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
