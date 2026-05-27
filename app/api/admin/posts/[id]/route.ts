import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id, 10)
  if (isNaN(postId)) {
    return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  })

  if (!post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id, 10)
  if (isNaN(postId)) {
    return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 })
  }

  const body = await request.json()
  const { title, slug, content, summary, coverImage, category, published, tags } = body

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(content !== undefined && { content }),
      ...(summary !== undefined && { summary }),
      ...(coverImage !== undefined && { coverImage }),
      ...(category !== undefined && { category }),
      ...(published !== undefined && { published }),
      ...(tags !== undefined && {
        tags: {
          set: [],
          connectOrCreate: (tags as string[]).map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
    },
    include: { tags: true },
  })

  return NextResponse.json(post)
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id, 10)
  if (isNaN(postId)) {
    return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 })
  }

  // comments 通过 schema 中的 onDelete: Cascade 自动级联删除
  await prisma.post.delete({ where: { id: postId } })

  return NextResponse.json({ ok: true })
}
