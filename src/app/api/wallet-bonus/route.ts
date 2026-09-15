import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/wallet-bonus — list wallet_bonuses (id, title, bonus_amount, target_amount,
// status, start_date, end_date)
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('wallet_bonuses')
      .select('id, title, description, bonus_type, bonus_amount, minimum_add_amount, maximum_bonus_amount, start_date, end_date, status, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    const rows = (data || []).map((b: any) => ({
      id: String(b.id),
      title: b.title,
      description: b.description,
      bonusType: b.bonus_type,
      bonusAmount: Number(b.bonus_amount || 0),
      // Expose target_amount as the deposit threshold (minimum_add_amount).
      targetAmount: Number(b.minimum_add_amount || 0),
      maximumBonusAmount: Number(b.maximum_bonus_amount || 0),
      status: b.status,
      startDate: b.start_date,
      endDate: b.end_date,
      createdAt: b.created_at,
    }))

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/wallet-bonus — create wallet bonus
// Body: {title, bonusAmount, targetAmount, status, startDate, endDate, ...}
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title, description, bonusType, bonusAmount, targetAmount,
      maximumBonusAmount, status, startDate, endDate,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'title required' }, { status: 400 })
    }

    const insert: Record<string, any> = {
      title,
      bonus_amount: Number(bonusAmount || 0),
      minimum_add_amount: Number(targetAmount || 0),
      maximum_bonus_amount: Number(maximumBonusAmount || 0),
      status: status ?? true,
    }
    if (description !== undefined) insert.description = description
    if (bonusType !== undefined) insert.bonus_type = bonusType
    if (startDate !== undefined) insert.start_date = startDate
    if (endDate !== undefined) insert.end_date = endDate

    const { data, error } = await adminSupabase
      .from('wallet_bonuses')
      .insert(insert)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/wallet-bonus — {id, ...updates}
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.title !== undefined) patch.title = updates.title
    if (updates.description !== undefined) patch.description = updates.description
    if (updates.bonusType !== undefined) patch.bonus_type = updates.bonusType
    if (updates.bonusAmount !== undefined) patch.bonus_amount = Number(updates.bonusAmount)
    if (updates.targetAmount !== undefined) patch.minimum_add_amount = Number(updates.targetAmount)
    if (updates.maximumBonusAmount !== undefined) patch.maximum_bonus_amount = Number(updates.maximumBonusAmount)
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.startDate !== undefined) patch.start_date = updates.startDate
    if (updates.endDate !== undefined) patch.end_date = updates.endDate

    const { error } = await adminSupabase.from('wallet_bonuses').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/wallet-bonus?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('wallet_bonuses').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
