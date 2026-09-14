import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const ROLE_MAP: Record<string, string[]> = {
  admin: ['admin', 'super-admin'],
  vendor: ['vendor', 'store-owner'],
  customer: ['customer'],
  delivery: ['delivery-man', 'rider'],
}

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password and role are required' }, { status: 400 })
    }

    // Validate credentials via Supabase Auth
    const { data: signInData, error: signInError } = await adminSupabase.auth.signInWithPassword({
      email: String(email).toLowerCase().trim(),
      password,
    })

    if (signInError || !signInData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const userId = signInData.user.id

    // Fetch profile from user_profiles (auth.users ↔ role)
    const { data: profile } = await adminSupabase
      .from('user_profiles')
      .select('user_id, role, is_active')
      .eq('user_id', userId)
      .single()

    if (!profile || !profile.is_active) {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 })
    }

    // Normalize role — support legacy role names
    const allowedRoles = ROLE_MAP[role] || [role]
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: `This account is not a ${role} account. Please select the correct role.` },
        { status: 403 }
      )
    }

    // Fetch display name from auth.users metadata (we already have it via signInData)
    const name = (signInData.user.user_metadata as any)?.name || signInData.user.email?.split('@')[0] || 'User'

    const user = {
      id: userId,
      email: signInData.user.email!,
      name,
      phone: (signInData.user.user_metadata as any)?.phone || null,
      role: profile.role,
      avatar: (signInData.user.user_metadata as any)?.avatar || null,
    }

    // If vendor role, look up the vendor's store(s)
    let vendor: {
      id: string
      storeName: string
      slug: string
      rating: number
      balance: number
      isVerified: boolean
    } | null = null

    if (profile.role === 'vendor' || profile.role === 'store-owner') {
      // Try vendors table (by email)
      const { data: vendorRow } = await adminSupabase
        .from('vendors')
        .select('id, name, email')
        .eq('email', signInData.user.email!)
        .single()

      if (vendorRow) {
        // Fetch the vendor's store
        const { data: store } = await adminSupabase
          .from('stores')
          .select('id, name, slug, rating, balance, active, featured')
          .eq('vendor_id', vendorRow.id)
          .eq('active', true)
          .order('id', { ascending: true })
          .limit(1)
          .single()

        if (store) {
          vendor = {
            id: String(store.id),
            storeName: store.name,
            slug: store.slug || String(store.id),
            rating: Number(store.rating) || 4.5,
            balance: Number(store.balance) || 0,
            isVerified: Boolean(store.active),
          }
        } else {
          // Vendor exists but no store yet — return minimal vendor info
          vendor = {
            id: String(vendorRow.id),
            storeName: vendorRow.name,
            slug: String(vendorRow.id),
            rating: 4.5,
            balance: 0,
            isVerified: false,
          }
        }
      }
    }

    return NextResponse.json({ user, vendor })
  } catch (e: any) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
