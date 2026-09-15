import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/pro-customer-subscriptions
// List pro_customer_subscriptions joined with users(name) and pro_customer_subscription_plans(name)
// Returns: list of {id, userId, userName, planId, planName, status, startDate, endDate}
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('pro_customer_subscriptions')
      .select(`
        id, user_id, plan_id, plan_name, status, start_at, end_at, auto_renew, created_at,
        user:users!pro_customer_subscriptions_user_id_fkey(name, email),
        plan:pro_customer_subscription_plans!pro_customer_subscriptions_plan_id_fkey(plan_name)
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    const rows = (data || []).map((s: any) => ({
      id: String(s.id),
      userId: String(s.user_id ?? ''),
      userName: s.user?.name || s.user?.email || '—',
      planId: s.plan_id ? String(s.plan_id) : null,
      planName: s.plan_name || s.plan?.plan_name || '—',
      status: s.status,
      startDate: s.start_at,
      endDate: s.end_at,
      autoRenew: Boolean(s.auto_renew),
      createdAt: s.created_at,
    }))

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/pro-customer-subscriptions — admin can PATCH status only
// Body: {id, status} (status: active|expired|canceled)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

    const allowed = ['active', 'expired', 'canceled']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${allowed.join(', ')}` }, { status: 400 })
    }

    const { error } = await adminSupabase
      .from('pro_customer_subscriptions')
      .update({ status })
      .eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
