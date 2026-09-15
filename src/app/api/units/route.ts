import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/units — list all units ordered by id desc
export async function GET(req: Request) {
  try {
    const { data, error } = await adminSupabase
      .from('units')
      .select('id, unit, description, status')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((u: any) => ({
      id: String(u.id),
      unit: u.unit,
      description: u.description,
      status: u.status,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/units — create a new unit
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { unit, description, status } = body
    if (!unit) return NextResponse.json({ error: 'unit required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('units')
      .insert({
        unit,
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

// PATCH /api/units — update an existing unit
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.unit !== undefined) patch.unit = updates.unit
    if (updates.description !== undefined) patch.description = updates.description
    if (updates.status !== undefined) patch.status = updates.status

    const { error } = await adminSupabase.from('units').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/units?id=... — delete a unit
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('units').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
