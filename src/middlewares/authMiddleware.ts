import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
export async function verifyToken(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return { error: "No token found", status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return { user: decoded, error: null, status: 200 };
  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}



