import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/conversations — admin reads only; list ordered by updated_at desc, limit 100
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('conversations')
      .select('id, sender_id, sender_type, receiver_id, receiver_type, last_message_id, unread_message_count, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json((data || []).map((c: any) => ({
      id: String(c.id),
      senderId: c.sender_id,
      senderType: c.sender_type,
      receiverId: c.receiver_id,
      receiverType: c.receiver_type,
      lastMessageId: c.last_message_id != null ? String(c.last_message_id) : null,
      unreadMessageCount: c.unread_message_count ?? 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}
