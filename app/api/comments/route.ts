import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasSensitiveWord } from '@/lib/sensitive'

// GET /api/comments?postId=<number>
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postIdParam = searchParams.get('postId')

  if (!postIdParam) {
    return NextResponse.json({ error: 'postId 为必填参数' }, { status: 400 })
  }

  const postId = Number(postIdParam)
  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: 'postId 必须为正整数' }, { status: 400 })
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nickname: true,
      content: true,
      createdAt: true,
    },
  })

  return NextResponse.json(comments)
}

// POST /api/comments
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 })
  }

  const { postId, nickname, content } = body as {
    postId?: unknown
    nickname?: unknown
    content?: unknown
  }

  // Validate postId
  if (postId === undefined || postId === null) {
    return NextResponse.json({ error: 'postId 为必填参数' }, { status: 400 })
  }
  const postIdNum = Number(postId)
  if (!Number.isInteger(postIdNum) || postIdNum <= 0) {
    return NextResponse.json({ error: 'postId 必须为正整数' }, { status: 400 })
  }

  // Validate nickname
  if (typeof nickname !== 'string' || nickname.trim().length === 0) {
    return NextResponse.json({ error: '昵称不能为空' }, { status: 400 })
  }
  if (nickname.trim().length > 50) {
    return NextResponse.json({ error: '昵称最长 50 个字符' }, { status: 400 })
  }

  // Validate content
  if (typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
  }
  if (content.trim().length > 500) {
    return NextResponse.json({ error: '评论内容最长 500 个字符' }, { status: 400 })
  }

  // Sensitive word filter
  if (hasSensitiveWord(content)) {
    return NextResponse.json(
      { error: '评论包含违禁词，请修改后重试' },
      { status: 400 }
    )
  }

  const comment = await prisma.comment.create({
    data: {
      postId: postIdNum,
      nickname: nickname.trim(),
      content: content.trim(),
    },
    select: {
      id: true,
      nickname: true,
      content: true,
      postId: true,
      createdAt: true,
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
