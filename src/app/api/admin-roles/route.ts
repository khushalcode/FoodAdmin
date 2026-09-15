import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/admin-roles — list all roles ordered by id desc
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('admin_roles')
      .select('id, name, description, permissions, is_active')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((r: any) => ({
      id: String(r.id),
      name: r.name,
      description: r.description,
      permissions: r.permissions,
      isActive: r.is_active,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/admin-roles — create a new role
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, permissions, isActive } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('admin_roles')
      .insert({
        name,
        description: description || null,
        permissions: permissions ?? {},
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

// PATCH /api/admin-roles — update an existing role
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, name, description, permissions, isActive } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (name !== undefined) patch.name = name
    if (description !== undefined) patch.description = description
    if (permissions !== undefined) patch.permissions = permissions
    if (isActive !== undefined) patch.is_active = isActive

    const { error } = await adminSupabase.from('admin_roles').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/admin-roles?id=... — blocks deletion of the 'Super Admin' role
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Block deletion of the 'Super Admin' role
    const { data: role, error: findError } = await adminSupabase
      .from('admin_roles')
      .select('name')
      .eq('id', id)
      .single()
    if (findError) throw findError
    if (role?.name === 'Super Admin') {
      return NextResponse.json({ error: "Cannot delete the 'Super Admin' role" }, { status: 400 })
    }

    const { error } = await adminSupabase.from('admin_roles').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
