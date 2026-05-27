import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  let body: { password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: '请求体格式错误' }, { status: 400 });
  }

  const { password } = body;

  if (!password || password.trim() === '') {
    return NextResponse.json({ ok: false, message: '密码不能为空' }, { status: 400 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: '密码错误' }, { status: 401 });
  }

  const token = signAdminToken();

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
