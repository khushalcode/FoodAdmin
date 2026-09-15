import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/payout-requests
// List `withdraw_requests` joined with vendors(name, email) and delivery_men(name, email)
// Returns: list of {id, type, requesterName, requesterEmail, amount, status, method, note, createdAt}
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const statusFilter = url.searchParams.get('status')

    let q = adminSupabase
      .from('withdraw_requests')
      .select(`
        id, amount, status, type, sender_note, user_note, withdrawal_method_id,
        withdrawal_method_fields, created_at,
        vendor:vendors!withdraw_requests_vendor_id_fkey(name, email),
        delivery_man:delivery_men!withdraw_requests_delivery_man_id_fkey(f_name, l_name, email),
        method:withdrawal_methods!withdraw_requests_withdrawal_method_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (statusFilter) q = q.eq('status', statusFilter)

    const { data, error } = await q
    if (error) {
      // Defensive fallback without joins
      try {
        const fallback = await adminSupabase
          .from('withdraw_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200)
        return NextResponse.json((fallback.data || []).map((w: any) => ({
          id: String(w.id),
          type: w.type || (w.delivery_man_id ? 'delivery_man' : 'vendor'),
          requesterName: '—',
          requesterEmail: '—',
          amount: Number(w.amount || 0),
          status: w.status || 'pending',
          method: null,
          note: w.sender_note || w.user_note || null,
          createdAt: w.created_at,
        })))
      } catch (e2: any) {
        return NextResponse.json({ error: 'Server error', detail: e2.message }, { status: 500 })
      }
    }

    const rows = (data || []).map((w: any) => {
      const isDm = w.type === 'delivery_man' || (!w.vendor && w.delivery_man)
      const requesterName = isDm
        ? `${w.delivery_man?.f_name || ''} ${w.delivery_man?.l_name || ''}`.trim() || 'Delivery Man'
        : (w.vendor?.name || 'Vendor')
      const requesterEmail = isDm
        ? w.delivery_man?.email || ''
        : w.vendor?.email || ''
      return {
        id: String(w.id),
        type: isDm ? 'delivery_man' : 'vendor',
        requesterName,
        requesterEmail,
        amount: Number(w.amount || 0),
        status: w.status || 'pending',
        method: w.method?.name || (w.withdrawal_method_id ? `Method #${w.withdrawal_method_id}` : null),
        note: w.sender_note || w.user_note || null,
        createdAt: w.created_at,
      }
    })

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/payout-requests
// Body: {id, status} — admin approves/rejects
// status: pending|approved|paid|rejected
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status, userNote } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

    const allowed = ['pending', 'approved', 'paid', 'rejected']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${allowed.join(', ')}` }, { status: 400 })
    }

    const patch: Record<string, any> = { status }
    if (userNote !== undefined) patch.user_note = userNote
    // Bump updated_at
    patch.updated_at = new Date().toISOString()

    const { error } = await adminSupabase
      .from('withdraw_requests')
      .update(patch)
      .eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
