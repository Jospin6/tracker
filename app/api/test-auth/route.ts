import { NextResponse } from "next/server";
import { testUserCreation } from "@/lib/utils/test-auth";

export async function GET() {
  const result = await testUserCreation();

  if (result.success) {
    return NextResponse.json({ message: "Test successful" });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }
}