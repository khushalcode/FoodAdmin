import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/restaurant-categories?storeId=
// List `store_categories` joined with stores(name)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const storeId = url.searchParams.get('storeId')

    let q = adminSupabase
      .from('store_categories')
      .select(`
        id, store_id, name, slug, priority, status, module_id, created_at,
        store:stores!store_categories_store_id_fkey(name)
      `)
      .order('priority', { ascending: true })

    if (storeId) q = q.eq('store_id', storeId)

    const { data, error } = await q.limit(500)
    if (error) {
      // Defensive fallback without join
      try {
        const fallback = await adminSupabase
          .from('store_categories')
          .select('*')
          .order('priority', { ascending: true })
          .limit(500)
        return NextResponse.json((fallback.data || []).map((c: any) => ({
          id: String(c.id),
          storeId: c.store_id ? String(c.store_id) : null,
          storeName: '—',
          name: c.name,
          slug: c.slug,
          priority: c.priority ?? 0,
          status: c.status,
          moduleId: c.module_id ?? null,
          createdAt: c.created_at,
        })))
      } catch (e2: any) {
        return NextResponse.json({ error: 'Server error', detail: e2.message }, { status: 500 })
      }
    }

    const rows = (data || []).map((c: any) => ({
      id: String(c.id),
      storeId: c.store_id ? String(c.store_id) : null,
      storeName: c.store?.name || '—',
      name: c.name,
      slug: c.slug,
      priority: Number(c.priority ?? 0),
      status: c.status,
      moduleId: c.module_id ?? null,
      createdAt: c.created_at,
    }))

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/restaurant-categories
// Body: {storeId, name, slug, priority, status, moduleId}
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { storeId, name, slug, priority, status, moduleId } = body

    if (!storeId || !name) {
      return NextResponse.json({ error: 'storeId and name required' }, { status: 400 })
    }

    const insert: Record<string, any> = {
      store_id: Number(storeId),
      name,
      slug: slug || String(name).toLowerCase().replace(/\s+/g, '-'),
      priority: priority !== undefined ? Number(priority) : 0,
      status: status ?? true,
    }
    if (moduleId !== undefined) insert.module_id = moduleId

    const { data, error } = await adminSupabase
      .from('store_categories')
      .insert(insert)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/restaurant-categories
// Body: {id, ...updates}
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.storeId !== undefined) patch.store_id = Number(updates.storeId)
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.slug !== undefined) patch.slug = updates.slug
    if (updates.priority !== undefined) patch.priority = Number(updates.priority)
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.moduleId !== undefined) patch.module_id = updates.moduleId

    const { error } = await adminSupabase.from('store_categories').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/restaurant-categories?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('store_categories').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
