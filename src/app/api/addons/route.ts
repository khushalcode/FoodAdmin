import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/addons — list add_ons ordered by id desc, joining addon_categories(name)
export async function GET(req: Request) {
  try {
    const { data, error } = await adminSupabase
      .from('add_ons')
      .select('id, name, price, status, addon_category_id, addon_categories(name)')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((a: any) => ({
      id: String(a.id),
      name: a.name,
      price: a.price,
      status: a.status,
      addonCategoryId: a.addon_category_id,
      addonCategoryName: a.addon_categories?.name || null,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/addons — create a new add-on
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, price, status, addonCategoryId } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('add_ons')
      .insert({
        name,
        price: price ?? 0,
        status: status ?? true,
        addon_category_id: addonCategoryId || null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/addons — update an existing add-on
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.price !== undefined) patch.price = updates.price
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.addonCategoryId !== undefined) patch.addon_category_id = updates.addonCategoryId

    const { error } = await adminSupabase.from('add_ons').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/addons?id=... — delete an add-on
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('add_ons').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
