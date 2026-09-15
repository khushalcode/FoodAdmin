import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/addon-categories — list addon_categories ordered by id desc
export async function GET(req: Request) {
  try {
    const { data, error } = await adminSupabase
      .from('addon_categories')
      .select('id, name, description, status')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      description: c.description,
      status: c.status,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/addon-categories — create a new addon category
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, status } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('addon_categories')
      .insert({
        name,
        description: description || null,
        status: status ?? true,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/addon-categories — update an existing addon category
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.description !== undefined) patch.description = updates.description
    if (updates.status !== undefined) patch.status = updates.status

    const { error } = await adminSupabase.from('addon_categories').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/addon-categories?id=... — delete an addon category
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('addon_categories').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
