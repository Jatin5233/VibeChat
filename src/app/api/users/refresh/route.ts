import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET! // match login route
    ) as { id: string };

    // Issue NEW access token with access token secret
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET!, // match login route access token secret
      { expiresIn: "15m" }
    );

    const res = NextResponse.json({ message: "Token refreshed" });

    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return res;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return NextResponse.json({ message: "Refresh token expired" }, { status: 401 });
    }
    return NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });
  }
}
