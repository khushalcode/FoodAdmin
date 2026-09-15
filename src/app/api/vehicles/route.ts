import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/vehicles — list all delivery / ride vehicles
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('d_m_vehicles')
      .select('id, name, description, image, is_delivery, is_ride, starting_coverage_area, maximum_coverage_area, extra_charges, status, created_at')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((v: any) => ({
      id: String(v.id),
      name: v.name,
      description: v.description,
      image: v.image,
      isDelivery: v.is_delivery,
      isRide: v.is_ride,
      startingCoverageArea: Number(v.starting_coverage_area || 0),
      maximumCoverageArea: Number(v.maximum_coverage_area || 0),
      extraCharges: Number(v.extra_charges || 0),
      status: v.status,
      createdAt: v.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json([])
  }
}

// POST /api/vehicles — create a vehicle
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name, description, image, isDelivery, isRide,
      startingCoverageArea, maximumCoverageArea, extraCharges, status,
    } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('d_m_vehicles')
      .insert({
        name,
        description: description || null,
        image: image || null,
        is_delivery: isDelivery ?? true,
        is_ride: isRide ?? false,
        starting_coverage_area: Number(startingCoverageArea || 0),
        maximum_coverage_area: Number(maximumCoverageArea || 0),
        extra_charges: Number(extraCharges || 0),
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

// PATCH /api/vehicles — update vehicle
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.description !== undefined) patch.description = updates.description
    if (updates.image !== undefined) patch.image = updates.image
    if (updates.isDelivery !== undefined) patch.is_delivery = updates.isDelivery
    if (updates.isRide !== undefined) patch.is_ride = updates.isRide
    if (updates.startingCoverageArea !== undefined) patch.starting_coverage_area = Number(updates.startingCoverageArea)
    if (updates.maximumCoverageArea !== undefined) patch.maximum_coverage_area = Number(updates.maximumCoverageArea)
    if (updates.extraCharges !== undefined) patch.extra_charges = Number(updates.extraCharges)
    if (updates.status !== undefined) patch.status = updates.status

    const { error } = await adminSupabase.from('d_m_vehicles').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/vehicles?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('d_m_vehicles').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
