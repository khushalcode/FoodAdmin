import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/external-config — list all external configurations
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('external_configurations')
      .select('id, key, value, is_active, created_at, updated_at')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json((data || []).map((c: any) => ({
      id: String(c.id),
      key: c.key,
      value: c.value,
      isActive: c.is_active,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/external-config — create a new external configuration
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { key, value, isActive } = body
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('external_configurations')
      .insert({
        key,
        value: value ?? null,
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

// PATCH /api/external-config — update an existing external configuration
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, key, value, isActive } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (key !== undefined) patch.key = key
    if (value !== undefined) patch.value = value
    if (isActive !== undefined) patch.is_active = isActive

    const { error } = await adminSupabase.from('external_configurations').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/external-config?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await adminSupabase.from('external_configurations').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
