import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyAdminToken } from '@/lib/admin-auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  // 鉴权
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value ?? '';
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  // 解析 multipart/form-data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: '未找到文件字段 file' }, { status: 400 });
  }

  // 校验文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: '不支持的文件类型，仅允许 jpeg、png、webp、gif' },
      { status: 400 }
    );
  }

  // 校验文件大小
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: '文件大小超过 5MB 限制' },
      { status: 400 }
    );
  }

  // 构建存储路径：public/uploads/YYYY-MM/时间戳_原文件名.ext
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const timestamp = now.getTime();
  const safeName = file.name.replace(/\s+/g, '_');
  const filename = `${timestamp}_${safeName}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', yearMonth);
  const filePath = path.join(uploadDir, filename);

  // 确保目录存在
  await mkdir(uploadDir, { recursive: true });

  // 写入文件
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/${yearMonth}/${filename}`;
  return NextResponse.json({ url }, { status: 200 });
}
