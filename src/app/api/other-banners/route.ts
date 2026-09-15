import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/other-banners — list admin promotional banners
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('admin_promotional_banners')
      .select('id, title, sub_title, image, status, created_at')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((b: any) => ({
      id: String(b.id),
      title: b.title,
      subTitle: b.sub_title ?? null,
      image: b.image,
      status: b.status,
      createdAt: b.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// POST /api/other-banners — create a promotional banner
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, subTitle, image, status } = body
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('admin_promotional_banners')
      .insert({
        title,
        sub_title: subTitle ?? null,
        image: image ?? null,
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

// PATCH /api/other-banners — update a promotional banner
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, title, subTitle, image, status } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (title !== undefined) patch.title = title
    if (subTitle !== undefined) patch.sub_title = subTitle
    if (image !== undefined) patch.image = image
    if (status !== undefined) patch.status = status

    const { error } = await adminSupabase.from('admin_promotional_banners').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/other-banners?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('admin_promotional_banners').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
