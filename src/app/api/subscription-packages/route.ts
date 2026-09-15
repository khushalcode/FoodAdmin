import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/subscription-packages — list all packages
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('subscription_packages')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      price: p.price != null ? Number(p.price) : null,
      duration: p.duration ?? null,
      status: p.status,
      isPopular: p.is_popular ?? null,
      features: p.features ?? null,
      createdAt: p.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// POST /api/subscription-packages — create a package
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, price, duration, status, isPopular, features } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const insert: Record<string, any> = { name }
    if (price !== undefined) insert.price = Number(price)
    if (duration !== undefined) insert.duration = Number(duration)
    if (status !== undefined) insert.status = status
    if (isPopular !== undefined) insert.is_popular = isPopular
    if (features !== undefined) insert.features = features

    const { data, error } = await adminSupabase
      .from('subscription_packages')
      .insert(insert)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/subscription-packages — update a package
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.price !== undefined) patch.price = Number(updates.price)
    if (updates.duration !== undefined) patch.duration = Number(updates.duration)
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.isPopular !== undefined) patch.is_popular = updates.isPopular
    if (updates.features !== undefined) patch.features = updates.features

    const { error } = await adminSupabase.from('subscription_packages').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/subscription-packages?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('subscription_packages').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
