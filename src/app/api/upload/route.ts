import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// POST /api/upload
//
// Upload a file to the shared `public-assets` Supabase Storage bucket.
// Returns the public URL so the admin UI can store it in a DB column.
//
// Body: multipart/form-data with fields:
//   - file: File (required)
//   - folder: string (e.g. "banners", "products", "avatars")
//
// Response: { url, path }
export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string) || 'uploads'

    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `unsupported file type: ${file.type}` }, { status: 400 })
    }

    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'file too large (max 5MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const bytes = Buffer.from(await file.arrayBuffer())

    // Ensure the public-assets bucket exists
    const { data: buckets } = await adminSupabase.storage.listBuckets()
    if (!buckets?.find((b: any) => b.name === 'public-assets')) {
      await adminSupabase.storage.createBucket('public-assets', { public: true })
    }

    const { error: uploadErr } = await adminSupabase.storage
      .from('public-assets')
      .upload(path, bytes, { contentType: file.type, upsert: true })
    if (uploadErr) throw uploadErr

    const { data } = adminSupabase.storage.from('public-assets').getPublicUrl(path)

    return NextResponse.json({ url: data.publicUrl, path })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
