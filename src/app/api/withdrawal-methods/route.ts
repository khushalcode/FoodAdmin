import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/withdrawal-methods — list all withdrawal methods
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('withdrawal_methods')
      .select('id, name, fields, is_active, created_at')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((w: any) => ({
      id: String(w.id),
      name: w.name,
      fields: w.fields ?? null,
      isActive: w.is_active,
      createdAt: w.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// POST /api/withdrawal-methods — create a withdrawal method
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, fields, isActive } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('withdrawal_methods')
      .insert({
        name,
        fields: fields ?? null,
        is_active: isActive ?? true,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/withdrawal-methods — update a withdrawal method
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, name, fields, isActive } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (name !== undefined) patch.name = name
    if (fields !== undefined) patch.fields = fields
    if (isActive !== undefined) patch.is_active = isActive

    const { error } = await adminSupabase.from('withdrawal_methods').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/withdrawal-methods?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('withdrawal_methods').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
