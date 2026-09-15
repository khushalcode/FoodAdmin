import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/sub-categories — list categories where parent_id IS NOT NULL, joining parent category name via self-FK
export async function GET(req: Request) {
  try {
    const { data, error } = await adminSupabase
      .from('categories')
      .select('id, name, image, parent_id, position, priority, status, module_id, slug, featured, parent:categories!parent_id(name)')
      .not('parent_id', 'is', null)
      .order('position', { ascending: true })

    if (error) throw error

    return NextResponse.json((data || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      image: c.image,
      parentId: c.parent_id,
      parentName: c.parent?.name || null,
      position: c.position,
      priority: c.priority,
      status: c.status,
      active: c.status,
      moduleId: c.module_id,
      slug: c.slug,
      featured: c.featured,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/sub-categories — create a new sub-category (parent_id required)
// NOTE: categories.priority is VARCHAR ('low'|'medium'|'high'), position is INTEGER.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, image, parentId, moduleId, priority, position, status, slug } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    if (!parentId) return NextResponse.json({ error: 'parentId required' }, { status: 400 })

    // Normalize priority — accept either int (0/1/2) or string ('low'/'medium'/'high')
    let priorityValue: string = 'low'
    if (typeof priority === 'string' && ['low','medium','high'].includes(priority.toLowerCase())) {
      priorityValue = priority.toLowerCase()
    } else if (typeof priority === 'number') {
      priorityValue = priority >= 2 ? 'high' : priority === 1 ? 'medium' : 'low'
    }

    const { data, error } = await adminSupabase
      .from('categories')
      .insert({
        name,
        image: image || null,
        parent_id: parentId,
        module_id: moduleId || null,
        priority: priorityValue,
        position: position || 0,
        status: status ?? true,
        slug: slug || String(name).toLowerCase().replace(/\s+/g, '-'),
        featured: false,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/sub-categories — update an existing sub-category
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.image !== undefined) patch.image = updates.image
    if (updates.parentId !== undefined) patch.parent_id = updates.parentId
    if (updates.moduleId !== undefined) patch.module_id = updates.moduleId
    if (updates.priority !== undefined) {
      const p = updates.priority
      patch.priority = (typeof p === 'string' && ['low','medium','high'].includes(p.toLowerCase()))
        ? p.toLowerCase()
        : (typeof p === 'number' && p >= 2 ? 'high' : typeof p === 'number' && p === 1 ? 'medium' : 'low')
    }
    if (updates.position !== undefined) patch.position = updates.position
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.slug !== undefined) patch.slug = updates.slug

    const { error } = await adminSupabase.from('categories').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/sub-categories?id=... — delete a sub-category
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('categories').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
