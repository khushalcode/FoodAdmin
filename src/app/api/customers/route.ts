import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/customers — list all customers (with wallet/loyalty/order stats)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')

    let q = adminSupabase
      .from('users')
      .select('id, name, email, phone, image, status, order_count, wallet_balance, loyalty_point, refer_code, cm_firebase_token, is_phone_verified, is_email_verified, zone_id, module_id, created_at')
      .order('created_at', { ascending: false })

    if (search) {
      q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (status) q = q.eq('status', status)

    const { data, error } = await q.limit(200)
    if (error) throw error

    return NextResponse.json((data || []).map((u: any) => ({
      id: String(u.id),
      name: u.name || 'Customer',
      email: u.email || '',
      phone: u.phone || '',
      image: u.image || null,
      status: u.status || 'active',
      active: u.status === 'approved' || u.status === 'active',
      orderCount: u.order_count || 0,
      walletBalance: Number(u.wallet_balance || 0),
      loyaltyPoints: Number(u.loyalty_point || 0),
      referCode: u.refer_code,
      phoneVerified: u.is_phone_verified,
      emailVerified: u.is_email_verified,
      zoneId: u.zone_id,
      moduleId: u.module_id,
      createdAt: u.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/customers — update customer status (block/unblock/verify)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.phone !== undefined) patch.phone = updates.phone
    if (updates.image !== undefined) patch.image = updates.image
    if (updates.walletBalance !== undefined) patch.wallet_balance = Number(updates.walletBalance)
    if (updates.loyaltyPoints !== undefined) patch.loyalty_point = Number(updates.loyaltyPoints)
    if (updates.isPhoneVerified !== undefined) patch.is_phone_verified = updates.isPhoneVerified
    if (updates.isEmailVerified !== undefined) patch.is_email_verified = updates.isEmailVerified
    if (updates.zoneId !== undefined) patch.zone_id = updates.zoneId

    const { error } = await adminSupabase.from('users').update(patch).eq('id', id)
    if (error) throw error

    // Optional: notify the user of status change
    if (updates.status === 'blocked' || updates.status === 'suspended') {
      await adminSupabase.from('user_notifications').insert({
        user_id: String(id),
        title: 'Account status updated',
        description: `Your account status is now: ${updates.status}`,
        notification_type: 'account',
        is_seen: false,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
