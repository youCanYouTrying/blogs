import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10))
  const skip = (page - 1) * pageSize

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
    }),
    prisma.post.count(),
  ])

  return NextResponse.json({ posts, total, page, pageSize })
}

export async function POST(request: NextRequest) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, slug, content, summary, coverImage, category, published, tags } = body

  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'title、slug、content 为必填项' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      summary: summary ?? null,
      coverImage: coverImage ?? null,
      category: category ?? null,
      published: published ?? false,
      tags: tags?.length
        ? {
            connectOrCreate: (tags as string[]).map((name: string) => ({
              where: { name },
              create: { name },
            })),
          }
        : undefined,
    },
    include: { tags: true },
  })

  return NextResponse.json(post, { status: 201 })
}
