import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  
  const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || 'demo123';
  
  if (password === ACCESS_PASSWORD) {
    const cookieStore = cookies();
    
    // Set authentication cookie (expires in 24 hours)
    cookieStore.set('sced-authenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}