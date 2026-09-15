import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/attributes — list all attributes ordered by id desc
export async function GET(req: Request) {
  try {
    const { data, error } = await adminSupabase
      .from('attributes')
      .select('id, name, values')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((a: any) => ({
      id: String(a.id),
      name: a.name,
      values: a.values,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/attributes — create a new attribute (values = JSON array like ["Small","Medium","Large"])
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, values } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('attributes')
      .insert({
        name,
        values: Array.isArray(values) ? values : [],
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/attributes — update an existing attribute
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.values !== undefined) patch.values = Array.isArray(updates.values) ? updates.values : []

    const { error } = await adminSupabase.from('attributes').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/attributes?id=... — delete an attribute
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('attributes').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
