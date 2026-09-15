import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/brands — list all brands ordered by id desc
export async function GET(req: Request) {
  try {
    const { data, error } = await adminSupabase
      .from('brands')
      .select('id, name, slug, image, status, module_id')
      .order('id', { ascending: false })
      .limit(200)

    if (error) throw error

    return NextResponse.json((data || []).map((b: any) => ({
      id: String(b.id),
      name: b.name,
      slug: b.slug,
      image: b.image,
      status: b.status,
      moduleId: b.module_id,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/brands — create a new brand (slug auto-derived from name)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, image, status, moduleId } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const slug = String(name).toLowerCase().replace(/\s+/g, '-')

    const { data, error } = await adminSupabase
      .from('brands')
      .insert({
        name,
        slug,
        image: image || null,
        status: status ?? true,
        module_id: moduleId || null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/brands — update an existing brand
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) {
      patch.name = updates.name
      patch.slug = String(updates.name).toLowerCase().replace(/\s+/g, '-')
    }
    if (updates.image !== undefined) patch.image = updates.image
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.moduleId !== undefined) patch.module_id = updates.moduleId

    const { error } = await adminSupabase.from('brands').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/brands?id=... — delete a brand
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('brands').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
