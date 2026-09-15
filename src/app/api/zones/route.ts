import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/zones — list all zones ordered by name
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('zones')
      .select('id, name, is_default, status')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json((data || []).map((z: any) => ({
      id: String(z.id),
      name: z.name,
      isDefault: z.is_default,
      status: z.status,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/zones — create a new zone
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, isDefault, status } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    // If creating a default zone, unset existing defaults first
    if (isDefault) {
      await adminSupabase.from('zones').update({ is_default: false }).eq('is_default', true)
    }

    const { data, error } = await adminSupabase
      .from('zones')
      .insert({
        name,
        is_default: isDefault ?? false,
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

// PATCH /api/zones — update an existing zone
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, name, isDefault, status } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (name !== undefined) patch.name = name
    if (status !== undefined) patch.status = status
    if (isDefault !== undefined) {
      patch.is_default = isDefault
      // If promoting this zone to default, unset existing defaults
      if (isDefault) {
        await adminSupabase.from('zones').update({ is_default: false }).neq('id', id).eq('is_default', true)
      }
    }

    const { error } = await adminSupabase.from('zones').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/zones?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await adminSupabase.from('zones').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
