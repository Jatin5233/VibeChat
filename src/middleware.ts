// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;


  if (
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname === '/' // Allow home page
  ) {
    return NextResponse.next();
  }

  
  if (!accessToken) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
  }

  try {
    
    await jwtVerify(accessToken, JWT_SECRET);
    
    return NextResponse.next();
  } catch (error) {
  
    if (!refreshToken) {
      
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
   
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/chats/:path*",
    "/profile/:path*", 
    "/update-profile/:path*",
    "/forgot-password",
    "/reset-password",
    
  ],
};