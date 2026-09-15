import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/coupons — list coupons (optionally filter by storeId / moduleId)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const storeId = url.searchParams.get('storeId')
    const moduleId = url.searchParams.get('moduleId')
    const onlyActive = url.searchParams.get('active') === '1'

    let q = adminSupabase
      .from('coupons')
      .select('id, title, code, start_date, expire_date, min_purchase, max_discount, discount, discount_type, coupon_type, limit, total_uses, status, data, module_id, store_id')
      .order('created_at', { ascending: false })

    if (storeId) q = q.eq('store_id', storeId)
    if (moduleId) q = q.eq('module_id', moduleId)
    if (onlyActive) q = q.eq('status', true)

    const { data, error } = await q.limit(100)
    if (error) throw error

    return NextResponse.json((data || []).map((c: any) => ({
      id: String(c.id),
      title: c.title,
      code: c.code,
      discountType: c.discount_type,
      discount: Number(c.discount),
      minPurchase: Number(c.min_purchase || 0),
      maxDiscount: Number(c.max_discount || 0),
      couponType: c.coupon_type,
      limit: c.limit,
      used: c.total_uses || 0,
      startDate: c.start_date,
      endDate: c.expire_date,
      status: c.status,
      active: c.status,
      moduleId: c.module_id,
      storeId: c.store_id,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/coupons — create a coupon (admin-controlled, customer applies at checkout)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, code, discountType, discount, minPurchase, maxDiscount, couponType, limit, startDate, endDate, moduleId, storeId, status } = body
    if (!title || !code || discount === undefined) return NextResponse.json({ error: 'title, code, discount required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('coupons')
      .insert({
        title,
        code: String(code).toUpperCase(),
        discount_type: discountType || 'percentage',
        discount: Number(discount),
        min_purchase: Number(minPurchase || 0),
        max_discount: Number(maxDiscount || 0),
        coupon_type: couponType || 'default',
        limit: limit || null,
        total_uses: 0,
        status: status ?? true,
        start_date: startDate || new Date().toISOString(),
        expire_date: endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        module_id: moduleId || null,
        store_id: storeId || null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/coupons — update coupon
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.title !== undefined) patch.title = updates.title
    if (updates.code !== undefined) patch.code = String(updates.code).toUpperCase()
    if (updates.discountType !== undefined) patch.discount_type = updates.discountType
    if (updates.discount !== undefined) patch.discount = Number(updates.discount)
    if (updates.minPurchase !== undefined) patch.min_purchase = Number(updates.minPurchase)
    if (updates.maxDiscount !== undefined) patch.max_discount = Number(updates.maxDiscount)
    if (updates.couponType !== undefined) patch.coupon_type = updates.couponType
    if (updates.limit !== undefined) patch.limit = updates.limit
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.startDate !== undefined) patch.start_date = updates.startDate
    if (updates.endDate !== undefined) patch.expire_date = updates.endDate
    if (updates.moduleId !== undefined) patch.module_id = updates.moduleId
    if (updates.storeId !== undefined) patch.store_id = updates.storeId

    const { error } = await adminSupabase.from('coupons').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/coupons?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('coupons').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
