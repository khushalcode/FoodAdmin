import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/faqs — list FAQs ordered by ranking (asc), then id desc
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('faqs')
      .select('id, question, answer, status, ranking, created_at, updated_at')
      .order('ranking', { ascending: true })
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((f: any) => ({
      id: String(f.id),
      question: f.question,
      answer: f.answer,
      status: f.status,
      ranking: f.ranking,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/faqs — create a new FAQ
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, answer, status, ranking } = body
    if (!question || !answer) return NextResponse.json({ error: 'question and answer required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('faqs')
      .insert({
        question,
        answer,
        status: status ?? true,
        ranking: ranking ?? 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/faqs — update an existing FAQ
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, question, answer, status, ranking } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (question !== undefined) patch.question = question
    if (answer !== undefined) patch.answer = answer
    if (status !== undefined) patch.status = status
    if (ranking !== undefined) patch.ranking = ranking

    const { error } = await adminSupabase.from('faqs').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/faqs?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await adminSupabase.from('faqs').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
