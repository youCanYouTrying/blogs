import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/admin-auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get('x-pathname') ?? headerStore.get('next-url') ?? '';

  // 登录页不需要守卫
  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !verifyAdminToken(token)) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
