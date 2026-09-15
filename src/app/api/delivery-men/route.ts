import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/delivery-men — list all delivery men
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search')
    const zoneId = url.searchParams.get('zoneId')

    let q = adminSupabase
      .from('delivery_men')
      .select('id, f_name, l_name, email, phone, image, earning, active, status, application_status, type, store_id, zone_id, current_orders, is_delivery, is_ride, created_at')
      .order('created_at', { ascending: false })

    if (search) {
      q = q.or(`f_name.ilike.%${search}%,l_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (zoneId) q = q.eq('zone_id', zoneId)

    const { data, error } = await q.limit(200)
    if (error) throw error

    return NextResponse.json((data || []).map((d: any) => ({
      id: String(d.id),
      name: `${d.f_name || ''} ${d.l_name || ''}`.trim() || 'Delivery Boy',
      firstName: d.f_name,
      lastName: d.l_name,
      email: d.email || '',
      phone: d.phone || '',
      image: d.image || null,
      earning: Number(d.earning || 0),
      active: d.active,
      status: d.status,
      applicationStatus: d.application_status,
      type: d.type,
      storeId: d.store_id,
      zoneId: d.zone_id,
      currentOrders: d.current_orders || 0,
      isDelivery: d.is_delivery,
      isRide: d.is_ride,
      createdAt: d.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/delivery-men — update delivery man status (approve/suspend/toggle active)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.active !== undefined) patch.active = updates.active
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.applicationStatus !== undefined) patch.application_status = updates.applicationStatus
    if (updates.type !== undefined) patch.type = updates.type
    if (updates.zoneId !== undefined) patch.zone_id = updates.zoneId
    if (updates.fName !== undefined) patch.f_name = updates.fName
    if (updates.lName !== undefined) patch.l_name = updates.lName
    if (updates.phone !== undefined) patch.phone = updates.phone
    if (updates.image !== undefined) patch.image = updates.image

    const { error } = await adminSupabase.from('delivery_men').update(patch).eq('id', id)
    if (error) throw error

    // Notify delivery man of status change
    if (updates.status || updates.applicationStatus) {
      await adminSupabase.from('user_notifications').insert({
        user_id: String(id),
        title: 'Account status updated',
        description: `Your account status is now: ${updates.status || updates.applicationStatus}`,
        notification_type: 'account',
        is_seen: false,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/delivery-men — create a new delivery man (admin creates account)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fName, lName, email, phone, password, zoneId, type } = body
    if (!fName || !email || !phone || !password) {
      return NextResponse.json({ error: 'fName, email, phone, password required' }, { status: 400 })
    }

    // Create auth user via admin API
    const { data: authUser, error: authErr } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: `${fName} ${lName || ''}`, role: 'delivery-man' },
    })
    if (authErr) throw authErr

    // Update user_profiles role
    await adminSupabase
      .from('user_profiles')
      .update({ role: 'delivery-man', is_active: true })
      .eq('user_id', authUser.user.id)

    // Insert delivery_men row.
    // NOTE: delivery_men.status is BOOLEAN (not varchar), and
    // application_status is a vendor_status enum (pending|approved|suspended|rejected).
    // Use compatible types so the insert doesn't fail.
    const { data, error } = await adminSupabase
      .from('delivery_men')
      .insert({
        f_name: fName,
        l_name: lName || null,
        email,
        phone,
        zone_id: zoneId || null,
        type: type || 'delivery_man',
        status: true,                          // boolean column
        active: false,
        application_status: 'approved',         // vendor_status enum value
        is_delivery: true,
        is_ride: false,
        earning: 0,
        current_orders: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
