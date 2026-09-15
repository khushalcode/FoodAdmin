import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/flash-sales — list flash sales
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const onlyPublished = url.searchParams.get('published') === '1'

    let q = adminSupabase
      .from('flash_sales')
      .select('id, module_id, title, is_publish, admin_discount_percentage, vendor_discount_percentage, start_date, end_date, slug, created_at')
      .order('created_at', { ascending: false })

    if (onlyPublished) q = q.eq('is_publish', true)

    const { data, error } = await q.limit(50)
    if (error) throw error

    return NextResponse.json((data || []).map((f: any) => ({
      id: String(f.id),
      title: f.title,
      moduleId: f.module_id,
      isPublished: f.is_publish,
      adminDiscountPercentage: Number(f.admin_discount_percentage || 0),
      vendorDiscountPercentage: Number(f.vendor_discount_percentage || 0),
      startDate: f.start_date,
      endDate: f.end_date,
      slug: f.slug,
      createdAt: f.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/flash-sales — create a flash sale (admin-controlled, shown to customer app)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, moduleId, adminDiscountPercentage, vendorDiscountPercentage, startDate, endDate, isPublished, slug } = body
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('flash_sales')
      .insert({
        title,
        module_id: moduleId || null,
        admin_discount_percentage: Number(adminDiscountPercentage || 0),
        vendor_discount_percentage: Number(vendorDiscountPercentage || 0),
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        is_publish: isPublished ?? true,
        slug: slug || String(title).toLowerCase().replace(/\s+/g, '-'),
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/flash-sales — update
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.title !== undefined) patch.title = updates.title
    if (updates.moduleId !== undefined) patch.module_id = updates.moduleId
    if (updates.adminDiscountPercentage !== undefined) patch.admin_discount_percentage = Number(updates.adminDiscountPercentage)
    if (updates.vendorDiscountPercentage !== undefined) patch.vendor_discount_percentage = Number(updates.vendorDiscountPercentage)
    if (updates.startDate !== undefined) patch.start_date = updates.startDate
    if (updates.endDate !== undefined) patch.end_date = updates.endDate
    if (updates.isPublished !== undefined) patch.is_publish = updates.isPublished

    const { error } = await adminSupabase.from('flash_sales').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/flash-sales?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('flash_sales').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
