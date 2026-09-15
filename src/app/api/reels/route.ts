import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/reels — list reels (schema may vary; SELECT * and return as-is)
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Return rows as-is; defensively coerce id to string for client stability.
    return NextResponse.json((data || []).map((r: any) => ({
      ...r,
      id: r.id != null ? String(r.id) : r.id,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// POST /api/reels — create a reel.
// Be defensive: only set columns the caller provided; if a column doesn't
// exist on the table, the insert will fail and we return 500 (acceptable).
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, videoUrl, thumbnail, status } = body

    const insert: Record<string, any> = {}
    if (title !== undefined) insert.title = title
    if (description !== undefined) insert.description = description
    if (videoUrl !== undefined) {
      insert.video_url = videoUrl
      insert.video = videoUrl // cover both possible column names
    }
    if (thumbnail !== undefined) insert.thumbnail = thumbnail
    if (status !== undefined) insert.status = status

    const { data, error } = await adminSupabase
      .from('reels')
      .insert(insert)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: data?.id != null ? String(data.id) : null, ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/reels — update a reel.
// Defensive: only attempt known snake_case columns; ignore unknown ones.
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.title !== undefined) patch.title = updates.title
    if (updates.description !== undefined) patch.description = updates.description
    if (updates.videoUrl !== undefined) {
      patch.video_url = updates.videoUrl
      patch.video = updates.videoUrl
    }
    if (updates.thumbnail !== undefined) patch.thumbnail = updates.thumbnail
    if (updates.status !== undefined) patch.status = updates.status
    // Allow direct snake_case passthrough for unknown columns.
    for (const k of Object.keys(updates)) {
      if (k === 'id' || ['title', 'description', 'videoUrl', 'thumbnail', 'status'].includes(k)) continue
      if (patch[k] === undefined) patch[k] = updates[k]
    }

    const { error } = await adminSupabase.from('reels').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/reels?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('reels').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
