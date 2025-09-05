import jwt from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      username: string;
      email: string;
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
