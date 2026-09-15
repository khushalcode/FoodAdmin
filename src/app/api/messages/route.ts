import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/messages?conversationId=&limit=50  (or no params -> recent messages)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const conversationId = url.searchParams.get('conversationId')
    const limit = Number(url.searchParams.get('limit') || 50)

    let q = adminSupabase
      .from('messages')
      .select('id, conversation_id, sender_id, message, file, is_seen, order_id, created_at')
      .order('created_at', { ascending: false })
      .limit(Number.isFinite(limit) && limit > 0 ? limit : 50)

    if (conversationId) q = q.eq('conversation_id', conversationId)

    const { data, error } = await q
    if (error) throw error

    return NextResponse.json((data || []).map((m: any) => ({
      id: String(m.id),
      conversationId: m.conversation_id != null ? String(m.conversation_id) : null,
      senderId: m.sender_id,
      message: m.message,
      file: m.file ?? null,
      isSeen: m.is_seen ?? false,
      orderId: m.order_id != null ? String(m.order_id) : null,
      createdAt: m.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// PATCH /api/messages — mark a message as seen
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, isSeen } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (isSeen !== undefined) patch.is_seen = isSeen

    const { error } = await adminSupabase.from('messages').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
