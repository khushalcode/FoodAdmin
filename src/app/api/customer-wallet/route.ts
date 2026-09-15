import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/customer-wallet?customerId=&limit=50 OR no params (returns all)
// Returns list of {id, userId, userName, credit, debit, balance, transactionType, reference, createdAt}
// Source: wallet_transactions joined with users(name)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const customerId = url.searchParams.get('customerId')
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 500)

    let q = adminSupabase
      .from('wallet_transactions')
      .select(`
        id, user_id, credit, debit, balance, transaction_type, reference, created_at,
        user:users!wallet_transactions_user_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (customerId) q = q.eq('user_id', customerId)

    const { data, error } = await q
    if (error) throw error

    const rows = (data || []).map((t: any) => ({
      id: String(t.id),
      userId: String(t.user_id ?? ''),
      userName: t.user?.name || t.user?.email || '—',
      credit: Number(t.credit || 0),
      debit: Number(t.debit || 0),
      balance: Number(t.balance || 0),
      transactionType: t.transaction_type || null,
      reference: t.reference || null,
      createdAt: t.created_at,
    }))

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
