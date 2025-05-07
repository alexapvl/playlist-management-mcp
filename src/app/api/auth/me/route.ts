import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return user data (excluding password hash)
    const { passwordHash: _, ...userData } = user;
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: "An error occurred while getting current user" },
      { status: 500 }
    );
  }
}
