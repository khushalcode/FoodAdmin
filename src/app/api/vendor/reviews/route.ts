import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const storeId = new URL(req.url).searchParams.get('vendorId')
    if (!storeId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    // Real schema: reviews table (linked to stores via store_id)
    const { data, error } = await adminSupabase
      .from('reviews')
      .select('id, user_id, rating, comment, reply, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json((data || []).map((r: any) => ({
      id: String(r.id),
      customer: `User ${String(r.user_id).slice(0, 6)}`,
      rating: r.rating,
      comment: r.comment,
      reply: r.reply,
      isActive: true,
      time: r.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
