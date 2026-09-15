import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/languages — list all languages ordered by name
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('languages')
      .select('id, code, name, direction, is_active, is_default, flag')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json((data || []).map((l: any) => ({
      id: String(l.id),
      code: l.code,
      name: l.name,
      direction: l.direction,
      isActive: l.is_active,
      isDefault: l.is_default,
      flag: l.flag,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/languages — create a new language
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, name, direction, isActive, isDefault, flag } = body
    if (!code || !name) return NextResponse.json({ error: 'code and name required' }, { status: 400 })

    // If creating a default language, unset existing defaults first
    if (isDefault) {
      await adminSupabase.from('languages').update({ is_default: false }).eq('is_default', true)
    }

    const { data, error } = await adminSupabase
      .from('languages')
      .insert({
        code,
        name,
        direction: direction || 'ltr',
        is_active: isActive ?? true,
        is_default: isDefault ?? false,
        flag: flag || null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/languages — update an existing language
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, name, direction, isActive, isDefault, flag } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (name !== undefined) patch.name = name
    if (direction !== undefined) patch.direction = direction
    if (isActive !== undefined) patch.is_active = isActive
    if (flag !== undefined) patch.flag = flag
    if (isDefault !== undefined) {
      patch.is_default = isDefault
      // If promoting this language to default, unset existing defaults
      if (isDefault) {
        await adminSupabase.from('languages').update({ is_default: false }).neq('id', id).eq('is_default', true)
      }
    }

    const { error } = await adminSupabase.from('languages').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/languages?id=... — blocks deletion of the default language
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Block deletion of the default language
    const { data: lang, error: findError } = await adminSupabase
      .from('languages')
      .select('is_default')
      .eq('id', id)
      .single()
    if (findError) throw findError
    if (lang?.is_default) {
      return NextResponse.json({ error: 'Cannot delete the default language' }, { status: 400 })
    }

    const { error } = await adminSupabase.from('languages').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
