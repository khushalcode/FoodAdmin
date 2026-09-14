import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const storeId = new URL(req.url).searchParams.get('vendorId')
    if (!storeId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    // Look up the vendor_id from the store
    const { data: store } = await adminSupabase
      .from('stores')
      .select('id, vendor_id')
      .eq('id', storeId)
      .single()

    if (!store || !store.vendor_id) {
      return NextResponse.json([])
    }

    const { data, error } = await adminSupabase
      .from('withdraw_requests')
      .select('id, amount, type, status, sender_note, created_at')
      .eq('vendor_id', store.vendor_id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error

    return NextResponse.json((data || []).map((w: any) => ({
      id: String(w.id),
      amount: Number(w.amount),
      method: 'bank', // withdraw_requests uses withdrawal_method_id, fallback to 'bank'
      status: w.status || 'pending',
      note: w.sender_note,
      time: w.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { vendorId, amount, method, note } = await req.json()
    if (!vendorId || !amount) return NextResponse.json({ error: 'vendorId and amount required' }, { status: 400 })

    // Look up the vendor_id from the store
    const { data: store } = await adminSupabase
      .from('stores')
      .select('id, vendor_id')
      .eq('id', vendorId)
      .single()

    if (!store || !store.vendor_id) {
      return NextResponse.json({ error: 'Store/vendor not found' }, { status: 404 })
    }

    const { data, error } = await adminSupabase
      .from('withdraw_requests')
      .insert({
        vendor_id: store.vendor_id,
        amount: Number(amount),
        type: 'vendor',
        sender_note: note || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ id: data?.id ? String(data.id) : null, ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
