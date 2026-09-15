import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/campaigns — list campaigns (optionally filtered by status)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const onlyRunning = url.searchParams.get('running') === '1'

    let q = adminSupabase
      .from('campaigns')
      .select('id, title, image, description, status, admin_id, start_date, end_date, start_time, end_time, module_id, slug')
      .order('created_at', { ascending: false })

    if (status) q = q.eq('status', status)
    if (onlyRunning) q = q.eq('status', 'running')

    const { data, error } = await q.limit(100)
    if (error) throw error

    return NextResponse.json((data || []).map((c: any) => ({
      id: String(c.id),
      title: c.title,
      image: c.image,
      description: c.description,
      status: c.status,
      adminId: c.admin_id,
      startDate: c.start_date,
      endDate: c.end_date,
      startTime: c.start_time,
      endTime: c.end_time,
      moduleId: c.module_id,
      slug: c.slug,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/campaigns — create a new campaign
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, image, description, status, startDate, endDate, startTime, endTime, moduleId, slug } = body
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('campaigns')
      .insert({
        title,
        image: image || null,
        description: description || null,
        status: status || 'running',
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        start_time: startTime || null,
        end_time: endTime || null,
        module_id: moduleId || null,
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

// PATCH /api/campaigns — update campaign
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.title !== undefined) patch.title = updates.title
    if (updates.image !== undefined) patch.image = updates.image
    if (updates.description !== undefined) patch.description = updates.description
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.startDate !== undefined) patch.start_date = updates.startDate
    if (updates.endDate !== undefined) patch.end_date = updates.endDate
    if (updates.moduleId !== undefined) patch.module_id = updates.moduleId

    const { error } = await adminSupabase.from('campaigns').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/campaigns?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('campaigns').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
