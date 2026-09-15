import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/store-disbursements
// List `disbursements` joined with stores(name, vendor_id) and vendors(name)
// Returns: list of {id, storeId, storeName, vendorName, amount, status, date}
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('disbursements')
      .select(`
        id, amount, total_amount, status, disbursement_date, created_at, store_id,
        store:stores!disbursements_store_id_fkey(id, name, vendor_id),
        vendor:vendors!stores_vendor_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      // Defensive fallback without joins
      try {
        const fallback = await adminSupabase
          .from('disbursements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200)
        return NextResponse.json((fallback.data || []).map((d: any) => ({
          id: String(d.id),
          storeId: d.store_id ? String(d.store_id) : null,
          storeName: '—',
          vendorName: '—',
          amount: Number(d.amount || d.total_amount || 0),
          status: d.status || 'pending',
          date: d.disbursement_date || d.created_at,
        })))
      } catch (e2: any) {
        return NextResponse.json({ error: 'Server error', detail: e2.message }, { status: 500 })
      }
    }

    const rows = (data || []).map((d: any) => ({
      id: String(d.id),
      storeId: d.store_id ? String(d.store_id) : null,
      storeName: d.store?.name || '—',
      vendorName: d.store?.vendor_id ? (d as any).vendor?.name || '—' : '—',
      amount: Number(d.amount || d.total_amount || 0),
      status: d.status || 'pending',
      date: d.disbursement_date || d.created_at,
    }))

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/store-disbursements
// Body: {storeId, amount, status, date} — insert into disbursements
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { storeId, amount, status, date } = body

    if (!storeId || amount === undefined) {
      return NextResponse.json(
        { error: 'storeId and amount required' },
        { status: 400 }
      )
    }

    const insert: Record<string, any> = {
      store_id: Number(storeId),
      amount: Number(amount),
      status: status || 'pending',
      type: 'store',
      created_for: 'store',
    }
    if (date) insert.disbursement_date = date

    // Defensive: try full insert first, fallback to legacy schema (title/total_amount)
    try {
      const { data, error } = await adminSupabase
        .from('disbursements')
        .insert(insert)
        .select('id')
        .single()
      if (error) throw error
      return NextResponse.json({ id: String(data?.id), ok: true })
    } catch (err1: any) {
      try {
        const { data, error } = await adminSupabase
          .from('disbursements')
          .insert({
            title: `Store Disbursement #${storeId}`,
            total_amount: Number(amount),
            status: status || 'pending',
            created_for: 'store',
          })
          .select('id')
          .single()
        if (error) throw error
        return NextResponse.json({ id: String(data?.id), ok: true })
      } catch (e: any) {
        return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
