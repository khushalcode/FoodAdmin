import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/expenses — list expenses ordered by date desc, limit 100
// Defensive: try to order by `date` column; if it doesn't exist fall back to created_at.
export async function GET() {
  const tryQueries = [
    () => adminSupabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .limit(100),
    () => adminSupabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ]

  for (const run of tryQueries) {
    try {
      const { data, error } = await run()
      if (error) continue
      return NextResponse.json((data || []).map((e: any) => ({
        id: String(e.id),
        type: e.type ?? null,
        amount: e.amount != null ? Number(e.amount) : null,
        description: e.description ?? null,
        date: e.date ?? e.created_at ?? null,
        createdAt: e.created_at,
      })))
    } catch {
      // try next fallback
    }
  }

  return NextResponse.json([])
}

// POST /api/expenses — create an expense
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, amount, description, date } = body
    if (amount === undefined) return NextResponse.json({ error: 'amount required' }, { status: 400 })

    const insert: Record<string, any> = { amount: Number(amount) }
    if (type !== undefined) insert.type = type
    if (description !== undefined) insert.description = description
    if (date !== undefined) insert.date = date

    const { data, error } = await adminSupabase
      .from('expenses')
      .insert(insert)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/expenses — update an expense
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, type, amount, description, date } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (type !== undefined) patch.type = type
    if (amount !== undefined) patch.amount = Number(amount)
    if (description !== undefined) patch.description = description
    if (date !== undefined) patch.date = date

    const { error } = await adminSupabase.from('expenses').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/expenses?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('expenses').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
