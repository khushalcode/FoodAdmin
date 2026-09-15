import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/pages-cms — list all CMS pages ordered by slug
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('cms_pages')
      .select('id, slug, title, body, meta_title, meta_description, meta_image, is_published, show_in_footer, created_at, updated_at')
      .order('slug', { ascending: true })

    if (error) throw error

    return NextResponse.json((data || []).map((p: any) => ({
      id: String(p.id),
      slug: p.slug,
      title: p.title,
      body: p.body,
      metaTitle: p.meta_title,
      metaDescription: p.meta_description,
      metaImage: p.meta_image,
      isPublished: p.is_published,
      showInFooter: p.show_in_footer,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/pages-cms — create a new CMS page
export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { slug, title, body, metaTitle, metaDescription, metaImage, isPublished, showInFooter } = payload
    if (!slug || !title) return NextResponse.json({ error: 'slug and title required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('cms_pages')
      .insert({
        slug,
        title,
        body: body || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_image: metaImage || null,
        is_published: isPublished ?? true,
        show_in_footer: showInFooter ?? false,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/pages-cms — update an existing CMS page
export async function PATCH(req: Request) {
  try {
    const payload = await req.json()
    const { id, slug, title, body, metaTitle, metaDescription, metaImage, isPublished, showInFooter } = payload
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (slug !== undefined) patch.slug = slug
    if (title !== undefined) patch.title = title
    if (body !== undefined) patch.body = body
    if (metaTitle !== undefined) patch.meta_title = metaTitle
    if (metaDescription !== undefined) patch.meta_description = metaDescription
    if (metaImage !== undefined) patch.meta_image = metaImage
    if (isPublished !== undefined) patch.is_published = isPublished
    if (showInFooter !== undefined) patch.show_in_footer = showInFooter

    const { error } = await adminSupabase.from('cms_pages').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/pages-cms?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await adminSupabase.from('cms_pages').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
