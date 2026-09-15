import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/banners — list all banners (admin) or filtered by module/zone (mobile)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const moduleId = url.searchParams.get('moduleId')
    const zoneId = url.searchParams.get('zoneId')
    const onlyActive = url.searchParams.get('active') === '1'

    let q = adminSupabase
      .from('banners')
      .select('id, title, type, image, status, data, zone_id, module_id, featured, default_link, created_by, start_date, end_date, background_color')
      .order('created_at', { ascending: false })

    if (moduleId) q = q.eq('module_id', moduleId)
    if (zoneId) q = q.eq('zone_id', zoneId)
    if (onlyActive) q = q.eq('status', true)

    const { data, error } = await q.limit(100)
    if (error) throw error

    return NextResponse.json((data || []).map((b: any) => ({
      id: String(b.id),
      title: b.title,
      type: b.type,
      image: b.image,
      url: b.default_link || b.data,
      status: b.status,
      active: b.status,
      featured: b.featured,
      priority: b.featured ? 1 : 0,
      moduleId: b.module_id,
      zoneId: b.zone_id,
      redirectLink: b.default_link,
      backgroundColor: b.background_color,
      startDate: b.start_date,
      endDate: b.end_date,
      createdBy: b.created_by,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/banners — create a new banner (admin-controlled, shown to customer/vendor apps)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, type, image, redirectLink, status, featured, moduleId, zoneId, backgroundColor, startDate, endDate } = body
    if (!title || !image) return NextResponse.json({ error: 'title and image required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('banners')
      .insert({
        title,
        type: type || 'web_url',
        image,
        default_link: redirectLink || null,
        data: redirectLink || null,
        status: status ?? true,
        featured: featured ?? false,
        module_id: moduleId || null,
        zone_id: zoneId || null,
        background_color: backgroundColor || null,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/banners — update an existing banner
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.title !== undefined) patch.title = updates.title
    if (updates.type !== undefined) patch.type = updates.type
    if (updates.image !== undefined) patch.image = updates.image
    if (updates.redirectLink !== undefined) { patch.default_link = updates.redirectLink; patch.data = updates.redirectLink }
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.featured !== undefined) patch.featured = updates.featured
    if (updates.moduleId !== undefined) patch.module_id = updates.moduleId
    if (updates.zoneId !== undefined) patch.zone_id = updates.zoneId
    if (updates.backgroundColor !== undefined) patch.background_color = updates.backgroundColor
    if (updates.startDate !== undefined) patch.start_date = updates.startDate
    if (updates.endDate !== undefined) patch.end_date = updates.endDate

    const { error } = await adminSupabase.from('banners').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/banners?id=... — delete a banner
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('banners').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
