import { NextResponse } from "next/server";
import { getSession } from "next-auth/react";

export async function GET() {
    const session = await getSession();
    return NextResponse.json(session);
}
