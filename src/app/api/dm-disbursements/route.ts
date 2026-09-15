import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/dm-disbursements
// List `disbursements` where type='delivery_man' OR all disbursements joined with
// delivery_men(name) and stores(name).
// Returns: list of {id, type, partyName, amount, status, date}
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const onlyDm = url.searchParams.get('onlyDm') === '1'

    let q = adminSupabase
      .from('disbursements')
      .select(`
        id, type, amount, total_amount, status, created_for, disbursement_date, created_at,
        store:stores!disbursements_store_id_fkey(name),
        delivery_man:delivery_men!disbursements_delivery_man_id_fkey(f_name, l_name)
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (onlyDm) {
      // Filter to delivery_man type only (defensive — column may or may not exist)
      try { q = q.eq('type', 'delivery_man') } catch {}
    }

    const { data, error } = await q
    if (error) {
      // Fallback: try without joins (defensive — columns may differ)
      try {
        const fallback = await adminSupabase
          .from('disbursements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200)
        return NextResponse.json((fallback.data || []).map((d: any) => ({
          id: String(d.id),
          type: d.type || d.created_for || 'disbursement',
          partyName: '—',
          amount: Number(d.amount || d.total_amount || 0),
          status: d.status || 'pending',
          date: d.disbursement_date || d.created_at,
        })))
      } catch (e2: any) {
        return NextResponse.json({ error: 'Server error', detail: e2.message }, { status: 500 })
      }
    }

    const rows = (data || []).map((d: any) => {
      const isDm = d.type === 'delivery_man' || d.created_for === 'delivery_man'
      const partyName = isDm
        ? `${d.delivery_man?.f_name || ''} ${d.delivery_man?.l_name || ''}`.trim() || 'Delivery Man'
        : (d.store?.name || '—')
      return {
        id: String(d.id),
        type: d.type || d.created_for || 'disbursement',
        partyName,
        amount: Number(d.amount || d.total_amount || 0),
        status: d.status || 'pending',
        date: d.disbursement_date || d.created_at,
      }
    })

    // If onlyDm filter applied but DB has no `type` column, filter client-side
    const filtered = onlyDm
      ? rows.filter((r) => r.type === 'delivery_man' || r.type === 'dm')
      : rows

    return NextResponse.json(filtered)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/dm-disbursements
// Body: {deliveryManId, amount, status, date} — insert into disbursements
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { deliveryManId, amount, status, date } = body

    if (!deliveryManId || amount === undefined) {
      return NextResponse.json(
        { error: 'deliveryManId and amount required' },
        { status: 400 }
      )
    }

    const insert: Record<string, any> = {
      type: 'delivery_man',
      created_for: 'delivery_man',
      amount: Number(amount),
      status: status || 'pending',
    }
    if (date) insert.disbursement_date = date

    // Defensive: try to insert delivery_man_id (column may not exist on legacy schema)
    try {
      const { data, error } = await adminSupabase
        .from('disbursements')
        .insert({ ...insert, delivery_man_id: Number(deliveryManId) })
        .select('id')
        .single()
      if (error) throw error
      return NextResponse.json({ id: String(data?.id), ok: true })
    } catch (err1: any) {
      // Fallback: insert without delivery_man_id (legacy disbursements schema)
      try {
        const { data, error } = await adminSupabase
          .from('disbursements')
          .insert({
            ...insert,
            title: `DM Disbursement #${deliveryManId}`,
            total_amount: Number(amount),
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
