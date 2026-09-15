import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/business-settings — list all settings ordered by key (returned as key-value pairs)
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('business_settings')
      .select('id, key, value, data_type, description, is_active')
      .order('key', { ascending: true })

    if (error) throw error

    // Return as an array of records AND as a flat key-value map for convenience
    const items = (data || []).map((s: any) => ({
      id: String(s.id),
      key: s.key,
      value: s.value,
      dataType: s.data_type,
      description: s.description,
      isActive: s.is_active,
    }))

    const keyValueMap: Record<string, any> = {}
    for (const s of data || []) {
      keyValueMap[s.key] = s.value
    }

    return NextResponse.json({ items, ...keyValueMap })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/business-settings — upsert value by key (UPDATE only — no new keys)
// Body:  { key, value }                  → update single key
//        { items: [{ key, value }, ...] } → bulk update
//
// Update only — new keys should be added via SQL migration by an admin.
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { key, value, items } = body

    const updates: Array<{ key: string; value: any }> = []
    if (Array.isArray(items) && items.length) {
      for (const it of items) {
        if (it && it.key !== undefined && it.value !== undefined) {
          updates.push({ key: it.key, value: it.value })
        }
      }
    } else if (key !== undefined && value !== undefined) {
      updates.push({ key, value })
    } else {
      return NextResponse.json({ error: 'Provide { key, value } or { items: [...] }' }, { status: 400 })
    }

    let updated = 0
    for (const u of updates) {
      const { error } = await adminSupabase
        .from('business_settings')
        .update({ value: u.value })
        .eq('key', u.key)
      if (error) throw error
      updated += 1
    }

    return NextResponse.json({ ok: true, updated })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
