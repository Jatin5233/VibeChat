import { NextResponse } from "next/server";


export async function GET() {
  try {
    // Create a response object
    const response = NextResponse.json(
      {
        message: "Logout successful",
        success: true,
      },
      { status: 200 }
    );

    // Clear the access token cookie by setting an expired date
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      expires: new Date(0), // Set expiration to a past date
    });

    return response;
  } catch (error: any) {
    console.error("❌ Logout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}