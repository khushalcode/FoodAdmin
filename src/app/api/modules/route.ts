import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/modules — list all modules ordered by id
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('modules')
      .select('id, module_name, module_type, status, default_module')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json((data || []).map((m: any) => ({
      id: String(m.id),
      moduleName: m.module_name,
      moduleType: m.module_type,
      status: m.status,
      defaultModule: m.default_module,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/modules — create a new module
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { moduleName, moduleType, status, defaultModule } = body
    if (!moduleName) return NextResponse.json({ error: 'moduleName required' }, { status: 400 })

    // If creating a default module, unset existing defaults first
    if (defaultModule) {
      await adminSupabase.from('modules').update({ default_module: false }).eq('default_module', true)
    }

    const { data, error } = await adminSupabase
      .from('modules')
      .insert({
        module_name: moduleName,
        module_type: moduleType || 'grocery',
        status: status ?? true,
        default_module: defaultModule ?? false,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/modules — update an existing module
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, moduleName, moduleType, status, defaultModule } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (moduleName !== undefined) patch.module_name = moduleName
    if (moduleType !== undefined) patch.module_type = moduleType
    if (status !== undefined) patch.status = status
    if (defaultModule !== undefined) {
      patch.default_module = defaultModule
      // If promoting this module to default, unset existing defaults
      if (defaultModule) {
        await adminSupabase.from('modules').update({ default_module: false }).neq('id', id).eq('default_module', true)
      }
    }

    const { error } = await adminSupabase.from('modules').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/modules?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await adminSupabase.from('modules').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
