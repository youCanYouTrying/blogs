import jwt from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET as string;

export function signAdminToken(): string {
  if (!SECRET) {
    throw new Error('ADMIN_JWT_SECRET 环境变量未配置');
  }
  return jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): boolean {
  if (!SECRET) return false;
  try {
    const payload = jwt.verify(token, SECRET) as { role?: string };
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
