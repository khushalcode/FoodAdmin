import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/employees — list vendor employees ordered by id desc, joining vendors(name)
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('vendor_employees')
      .select(`
        id, vendor_id, f_name, l_name, phone, email, image, role, is_active, created_at,
        vendor:vendors!vendor_employees_vendor_id_fkey(name)
      `)
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((e: any) => ({
      id: String(e.id),
      vendorId: e.vendor_id ? String(e.vendor_id) : null,
      vendorName: e.vendor?.name || '—',
      fName: e.f_name,
      lName: e.l_name,
      phone: e.phone,
      email: e.email,
      image: e.image,
      role: e.role,
      isActive: e.is_active,
      createdAt: e.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/employees — create a new vendor employee
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { vendorId, fName, lName, phone, email, password, role, isActive } = body
    if (!vendorId || !email) return NextResponse.json({ error: 'vendorId and email required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('vendor_employees')
      .insert({
        vendor_id: vendorId,
        f_name: fName || null,
        l_name: lName || null,
        phone: phone || null,
        email,
        password: password || null,
        role: role || 'employee',
        is_active: isActive ?? true,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/employees — update a vendor employee
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, vendorId, fName, lName, phone, email, password, image, role, isActive } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (vendorId !== undefined) patch.vendor_id = vendorId
    if (fName !== undefined) patch.f_name = fName
    if (lName !== undefined) patch.l_name = lName
    if (phone !== undefined) patch.phone = phone
    if (email !== undefined) patch.email = email
    if (password !== undefined) patch.password = password
    if (image !== undefined) patch.image = image
    if (role !== undefined) patch.role = role
    if (isActive !== undefined) patch.is_active = isActive

    const { error } = await adminSupabase.from('vendor_employees').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/employees?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await adminSupabase.from('vendor_employees').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
