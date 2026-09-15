import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/stores — list stores/vendors (already in /api/vendors but this exposes status update)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const onlyActive = url.searchParams.get('active') === '1'
    const moduleId = url.searchParams.get('moduleId')

    let q = adminSupabase
      .from('stores')
      .select(`
        id, name, phone, email, logo, cover_photo, lat, lng, address, minimum_order,
        comission, schedule_order, status, active, vendor_id, free_delivery, rating,
        rating_count, order_count, store_business_model, per_km_shipping_charge,
        maximum_shipping_charge, featured, slug, delivery, take_away, tax, zone_id,
        module_id, announcement, created_at,
        vendor:vendors!stores_vendor_id_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (onlyActive) q = q.eq('status', true)
    if (moduleId) q = q.eq('module_id', moduleId)

    const { data, error } = await q.limit(200)
    if (error) throw error

    return NextResponse.json((data || []).map((s: any) => ({
      id: String(s.id),
      name: s.name,
      phone: s.phone,
      email: s.email,
      logo: s.logo,
      coverPhoto: s.cover_photo,
      lat: s.lat,
      lng: s.lng,
      address: s.address,
      minimumOrder: Number(s.minimum_order || 0),
      commission: Number(s.comission || 0),
      scheduleOrder: s.schedule_order,
      status: s.status,
      active: s.active,
      vendorId: s.vendor_id,
      vendorName: s.vendor?.name,
      freeDelivery: s.free_delivery,
      rating: Number(s.rating || 0),
      ratingCount: s.rating_count || 0,
      orderCount: s.order_count || 0,
      businessModel: s.store_business_model,
      perKmShippingCharge: Number(s.per_km_shipping_charge || 0),
      maximumShippingCharge: Number(s.maximum_shipping_charge || 0),
      featured: s.featured,
      slug: s.slug,
      delivery: s.delivery,
      takeAway: s.take_away,
      tax: Number(s.tax || 0),
      zoneId: s.zone_id,
      moduleId: s.module_id,
      announcement: s.announcement,
      createdAt: s.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/stores — update store status (approve/suspend/feature toggle)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.active !== undefined) patch.active = updates.active
    if (updates.featured !== undefined) patch.featured = updates.featured
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.phone !== undefined) patch.phone = updates.phone
    if (updates.email !== undefined) patch.email = updates.email
    if (updates.logo !== undefined) patch.logo = updates.logo
    if (updates.coverPhoto !== undefined) patch.cover_photo = updates.coverPhoto
    if (updates.address !== undefined) patch.address = updates.address
    if (updates.minimumOrder !== undefined) patch.minimum_order = Number(updates.minimumOrder)
    if (updates.commission !== undefined) patch.comission = Number(updates.commission)
    if (updates.delivery !== undefined) patch.delivery = updates.delivery
    if (updates.takeAway !== undefined) patch.take_away = updates.takeAway
    if (updates.tax !== undefined) patch.tax = Number(updates.tax)
    if (updates.freeDelivery !== undefined) patch.free_delivery = updates.freeDelivery
    if (updates.zoneId !== undefined) patch.zone_id = updates.zoneId
    if (updates.announcement !== undefined) patch.announcement = updates.announcement

    const { error } = await adminSupabase.from('stores').update(patch).eq('id', id)
    if (error) throw error

    // Notify vendor of status change
    if (updates.status !== undefined) {
      const { data: store } = await adminSupabase
        .from('stores')
        .select('vendor_id')
        .eq('id', id)
        .single()
      if (store?.vendor_id) {
        await adminSupabase.from('user_notifications').insert({
          user_id: String(store.vendor_id),
          title: 'Store status updated',
          description: `Your store status is now: ${updates.status}`,
          notification_type: 'store',
          is_seen: false,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
