import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/transactions?type=all|orders|withdrawals|disbursements|wallet&limit=100
// Returns unified list of {id, type, amount, status, party, createdAt} mixing:
//   orders (revenue) -> type='order'
//   withdraw_requests (vendor + delivery_man payouts) -> type='withdrawal'
//   disbursements (vendor payouts) -> type='disbursement'
//   wallet_transactions (customer wallet) -> type='wallet'
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'all'
    const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500)

    const fetchers: Promise<any[]>[] = []

    if (type === 'all' || type === 'orders') {
      fetchers.push((async () => {
        try {
          const { data } = await adminSupabase
            .from('orders')
            .select(`
              id, order_amount, order_status, payment_status, created_at,
              store:stores!orders_store_id_fkey(name)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
          return (data || []).map((o: any) => ({
            id: `order-${o.id}`,
            type: 'order',
            amount: Number(o.order_amount || 0),
            status: o.order_status,
            party: o.store?.name || 'Store',
            createdAt: o.created_at,
          }))
        } catch { return [] }
      })())
    }

    if (type === 'all' || type === 'withdrawals') {
      fetchers.push((async () => {
        try {
          const { data } = await adminSupabase
            .from('withdraw_requests')
            .select(`
              id, amount, status, type, created_at,
              vendor:vendors!withdraw_requests_vendor_id_fkey(name),
              delivery_man:delivery_men!withdraw_requests_delivery_man_id_fkey(f_name, l_name)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
          return (data || []).map((w: any) => {
            const party = w.type === 'delivery_man'
              ? `${w.delivery_man?.f_name || ''} ${w.delivery_man?.l_name || ''}`.trim() || 'Delivery Man'
              : w.vendor?.name || 'Vendor'
            return {
              id: `withdraw-${w.id}`,
              type: 'withdrawal',
              amount: Number(w.amount || 0),
              status: w.status || 'pending',
              party,
              createdAt: w.created_at,
            }
          })
        } catch { return [] }
      })())
    }

    if (type === 'all' || type === 'disbursements') {
      fetchers.push((async () => {
        try {
          const { data } = await adminSupabase
            .from('disbursements')
            .select(`
              id, amount, status, disbursement_date, created_at, type,
              store:stores!disbursements_store_id_fkey(name)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
          return (data || []).map((d: any) => ({
            id: `disb-${d.id}`,
            type: 'disbursement',
            amount: Number(d.amount || d.total_amount || 0),
            status: d.status,
            party: d.store?.name || (d.created_for ? String(d.created_for) : 'Disbursement'),
            createdAt: d.disbursement_date || d.created_at,
          }))
        } catch { return [] }
      })())
    }

    if (type === 'all' || type === 'wallet') {
      fetchers.push((async () => {
        try {
          const { data } = await adminSupabase
            .from('wallet_transactions')
            .select(`
              id, credit, debit, balance, transaction_type, reference, created_at,
              user:users!wallet_transactions_user_id_fkey(name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
          return (data || []).map((w: any) => ({
            id: `wallet-${w.id}`,
            type: 'wallet',
            amount: Number(w.credit || 0) - Number(w.debit || 0),
            status: w.transaction_type || 'completed',
            party: w.user?.name || w.user?.email || 'Customer',
            createdAt: w.created_at,
          }))
        } catch { return [] }
      })())
    }

    const groups = await Promise.all(fetchers)
    const merged = groups.flat()

    // Sort merged by createdAt desc, apply limit
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(merged.slice(0, limit))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
