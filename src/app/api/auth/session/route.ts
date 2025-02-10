// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getSession } from "next-auth/react";

export async function GET(req: Request) {
    const session = await getSession();
    return NextResponse.json(session);
}
