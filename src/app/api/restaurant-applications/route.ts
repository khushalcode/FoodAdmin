import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/restaurant-applications?status=pending|approved|rejected|suspended|all
// List `vendors` filtered by application_status (default: pending, supports 'all')
// Returns: list of {id, name, email, phone, address, applicationStatus, status, createdAt}
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const applicationStatus = url.searchParams.get('status') || 'pending'

    let q = adminSupabase
      .from('vendors')
      .select('id, name, email, phone, address, application_status, status, logo, created_at')
      .order('created_at', { ascending: false })

    if (applicationStatus !== 'all') {
      q = q.eq('application_status', applicationStatus)
    }

    const { data, error } = await q.limit(500)
    if (error) throw error

    const rows = (data || []).map((v: any) => ({
      id: String(v.id),
      name: v.name,
      email: v.email || '',
      phone: v.phone || '',
      address: v.address || '',
      applicationStatus: v.application_status || 'pending',
      status: v.status || 'pending',
      logo: v.logo || null,
      createdAt: v.created_at,
    }))

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/restaurant-applications
// Body: {id, applicationStatus, status} — admin approves/rejects
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, applicationStatus, status, rejectionNote } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const allowed = ['pending', 'approved', 'rejected', 'suspended']
    const patch: Record<string, any> = {}

    if (applicationStatus !== undefined) {
      if (!allowed.includes(applicationStatus)) {
        return NextResponse.json(
          { error: `applicationStatus must be one of: ${allowed.join(', ')}` },
          { status: 400 }
        )
      }
      patch.application_status = applicationStatus
    }
    if (status !== undefined) {
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${allowed.join(', ')}` },
          { status: 400 }
        )
      }
      patch.status = status
    }
    if (rejectionNote !== undefined) patch.rejection_note = rejectionNote

    patch.updated_at = new Date().toISOString()

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: 'no updates provided' }, { status: 400 })
    }

    const { error } = await adminSupabase.from('vendors').update(patch).eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
