import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/reviews?storeId=&itemId=&limit=100  (or no params -> recent reviews)
// Returns reviews joined with users (name), items (name), stores (name).
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const storeId = url.searchParams.get('storeId')
    const itemId = url.searchParams.get('itemId')
    const limit = Number(url.searchParams.get('limit') || 100)

    let q = adminSupabase
      .from('reviews')
      .select('id, user_id, item_id, store_id, rating, comment, reply, replied_at, is_seen, created_at')
      .order('created_at', { ascending: false })
      .limit(Number.isFinite(limit) && limit > 0 ? limit : 100)

    if (storeId) q = q.eq('store_id', storeId)
    if (itemId) q = q.eq('item_id', itemId)

    const { data, error } = await q
    if (error) throw error

    const reviews = data || []

    // Resolve user names from the users table (legacy bigint ids).
    const userIds = [...new Set(reviews.map((r: any) => String(r.user_id)).filter(Boolean))]
      .filter((id) => /^\d+$/.test(id))
    const itemIds = [...new Set(reviews.map((r: any) => r.item_id).filter(Boolean))]
    const storeIds = [...new Set(reviews.map((r: any) => r.store_id).filter(Boolean))]

    let userMap: Record<string, string> = {}
    if (userIds.length > 0) {
      try {
        const { data: users } = await adminSupabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds)
        for (const u of users || []) userMap[String(u.id)] = u.name || u.email || 'Customer'
      } catch {
        // ignore
      }
    }

    let itemMap: Record<string, string> = {}
    if (itemIds.length > 0) {
      try {
        const { data: items } = await adminSupabase
          .from('items')
          .select('id, name')
          .in('id', itemIds)
        for (const i of items || []) itemMap[String(i.id)] = i.name || 'Item'
      } catch {
        // ignore
      }
    }

    let storeMap: Record<string, string> = {}
    if (storeIds.length > 0) {
      try {
        const { data: stores } = await adminSupabase
          .from('stores')
          .select('id, name')
          .in('id', storeIds)
        for (const s of stores || []) storeMap[String(s.id)] = s.name || 'Store'
      } catch {
        // ignore
      }
    }

    return NextResponse.json(reviews.map((r: any) => ({
      id: String(r.id),
      userId: r.user_id,
      userName: (r.user_id && userMap[String(r.user_id)]) || 'Customer',
      itemId: r.item_id != null ? String(r.item_id) : null,
      itemName: (r.item_id && itemMap[String(r.item_id)]) || null,
      storeId: r.store_id != null ? String(r.store_id) : null,
      storeName: (r.store_id && storeMap[String(r.store_id)]) || null,
      rating: r.rating,
      comment: r.comment,
      reply: r.reply ?? null,
      repliedAt: r.replied_at ?? null,
      isSeen: r.is_seen ?? false,
      createdAt: r.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// PATCH /api/reviews — admin replies to a review (sets reply + replied_at = NOW())
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, reply } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (reply === undefined) return NextResponse.json({ error: 'reply required' }, { status: 400 })

    const { error } = await adminSupabase
      .from('reviews')
      .update({ reply, replied_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
