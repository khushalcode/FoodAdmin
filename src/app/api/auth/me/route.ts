import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const { data: profile, error } = await adminSupabase
      .from('user_profiles')
      .select('user_id, role, is_active')
      .eq('user_id', userId)
      .single()

    if (error || !profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Fetch user details from auth.users via admin API
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(userId)
    const name = (authUser?.user?.user_metadata as any)?.name || authUser?.user?.email?.split('@')[0] || 'User'

    const user = {
      id: userId,
      email: authUser?.user?.email || '',
      name,
      phone: (authUser?.user?.user_metadata as any)?.phone || null,
      role: profile.role,
      avatar: (authUser?.user?.user_metadata as any)?.avatar || null,
    }

    let vendor: { id: string; storeName: string; slug: string; rating: number; balance: number; isVerified: boolean } | null = null
    if (profile.role === 'vendor' || profile.role === 'store-owner') {
      const { data: vendorRow } = await adminSupabase
        .from('vendors')
        .select('id, name, email')
        .eq('email', authUser?.user?.email || '')
        .single()
      if (vendorRow) {
        const { data: store } = await adminSupabase
          .from('stores')
          .select('id, name, slug, rating, balance, active')
          .eq('vendor_id', vendorRow.id)
          .eq('active', true)
          .limit(1)
          .single()
        if (store) {
          vendor = {
            id: String(store.id), storeName: store.name, slug: store.slug || String(store.id),
            rating: Number(store.rating) || 4.5, balance: Number(store.balance) || 0,
            isVerified: Boolean(store.active),
          }
        }
      }
    }

    return NextResponse.json({ user, vendor })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
