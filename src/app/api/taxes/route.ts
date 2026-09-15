import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/taxes — list all taxes
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('taxes')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((t: any) => ({
      id: String(t.id),
      name: t.name,
      code: t.code ?? null,
      taxRate: t.tax_rate != null ? Number(t.tax_rate) : null,
      taxType: t.tax_type ?? null,
      status: t.status,
      // defensive: include any other columns that exist
      countryCode: t.country_code ?? null,
      isDefault: t.is_default ?? null,
      isActive: t.is_active ?? null,
      createdAt: t.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// POST /api/taxes — create a tax
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, code, taxRate, taxType, status } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const insert: Record<string, any> = { name }
    if (code !== undefined) insert.code = code
    if (taxRate !== undefined) insert.tax_rate = Number(taxRate)
    if (taxType !== undefined) insert.tax_type = taxType
    if (status !== undefined) insert.status = status

    const { data, error } = await adminSupabase
      .from('taxes')
      .insert(insert)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/taxes — update a tax
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.code !== undefined) patch.code = updates.code
    if (updates.taxRate !== undefined) patch.tax_rate = Number(updates.taxRate)
    if (updates.taxType !== undefined) patch.tax_type = updates.taxType
    if (updates.status !== undefined) patch.status = updates.status

    const { error } = await adminSupabase.from('taxes').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/taxes?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('taxes').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
