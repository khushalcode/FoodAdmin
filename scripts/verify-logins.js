#!/usr/bin/env node
/**
 * FoodHub — Demo login verifier
 *
 * Run AFTER executing `supabase/cleanup.sql` in the Supabase SQL editor.
 *
 * Usage:
 *   node scripts/verify-logins.js
 *   bun scripts/verify-logins.js
 *
 * Reads credentials from .env (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * Signs in with each of the 11 demo accounts and verifies the role.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  // Try loading .env from current dir
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split('\n')) {
        const m = line.match(/^(\w+)=(.+)$/);
        if (m) {
          process.env[m[1]] = m[2];
        }
      }
    }
  } catch (e) {}
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const DEMO_ACCOUNTS = [
  ['admin1@example.com',  'admin123',      'admin',        'admin web'],
  ['admin2@example.com',  'admin456',      'admin',        'admin web'],
  ['customer1@demo.com',  'Customer@1234', 'customer',     'customer app'],
  ['customer2@demo.com',  'Customer@1234', 'customer',     'customer app'],
  ['customer3@demo.com',  'Customer@1234', 'customer',     'customer app'],
  ['vendor1@demo.com',    'Vendor@1234',   'vendor',       'vendor app'],
  ['vendor2@demo.com',    'Vendor@1234',   'vendor',       'vendor app'],
  ['vendor3@demo.com',    'Vendor@1234',   'vendor',       'vendor app'],
  ['dm1@demo.com',        'Delivery@1234', 'delivery-man', 'delivery app'],
  ['dm2@demo.com',        'Delivery@1234', 'delivery-man', 'delivery app'],
  ['dm3@demo.com',        'Delivery@1234', 'delivery-man', 'delivery app'],
];

async function signIn(email, password) {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const t = await r.text();
    return { ok: false, status: r.status, body: t };
  }
  const body = await r.json();
  return { ok: true, access_token: body.access_token, user_id: body.user?.id };
}

async function fetchProfile(accessToken, userId) {
  // Try anon + access_token first
  let r = await fetch(`${URL}/rest/v1/user_profiles?select=role,is_active&user_id=eq.${userId}&limit=1`, {
    headers: { 'apikey': ANON, 'Authorization': `Bearer ${accessToken}` },
  });
  if (!r.ok && SERVICE) {
    r = await fetch(`${URL}/rest/v1/user_profiles?select=role,is_active&user_id=eq.${userId}&limit=1`, {
      headers: { 'apikey': SERVICE, 'Authorization': `Bearer ${SERVICE}` },
    });
  }
  if (!r.ok) return { ok: false, status: r.status };
  const rows = await r.json();
  if (!rows.length) return { ok: false, status: 'no_profile' };
  return { ok: true, role: rows[0].role, is_active: rows[0].is_active };
}

async function main() {
  console.log('='.repeat(84));
  console.log('FoodHub — Demo Login Verification');
  console.log('='.repeat(84));
  console.log();
  console.log(`${'Email'.padEnd(30)} ${'Status'.padEnd(10)} ${'Expected'.padEnd(20)} ${'DB role'.padEnd(15)} ${'Active'.padEnd(7)} Notes`);
  console.log('-'.repeat(84));

  let allPass = true;
  let passed = 0;
  for (const [email, password, expectedRole, app] of DEMO_ACCOUNTS) {
    const r = await signIn(email, password);
    if (!r.ok) {
      console.log(`${email.padEnd(30)} ${'FAIL'.padEnd(10)} ${expectedRole.padEnd(20)} ${'-'.padEnd(15)} ${'-'.padEnd(7)} HTTP ${r.status}: ${r.body.slice(0,100)}`);
      allPass = false;
      continue;
    }
    const p = await fetchProfile(r.access_token, r.user_id);
    if (!p.ok) {
      console.log(`${email.padEnd(30)} ${'PROFILE_ERR'.padEnd(10)} ${expectedRole.padEnd(20)} ${'-'.padEnd(15)} ${'-'.padEnd(7)} ${p.status}`);
      allPass = false;
      continue;
    }
    const roleOk = p.role === expectedRole ||
      (expectedRole === 'admin' && ['admin','super-admin'].includes(p.role)) ||
      (expectedRole === 'vendor' && ['vendor','store-owner'].includes(p.role)) ||
      (expectedRole === 'delivery-man' && ['delivery-man','rider'].includes(p.role));
    const activeOk = p.is_active === true;
    const status = roleOk && activeOk ? 'OK' : 'MISMATCH';
    const notes = [];
    if (!roleOk) notes.push(`role mismatch (got ${p.role})`);
    if (!activeOk) notes.push('not active');
    console.log(`${email.padEnd(30)} ${status.padEnd(10)} ${expectedRole.padEnd(20)} ${p.role.padEnd(15)} ${String(p.is_active).padEnd(7)} ${notes.join(', ')}`);
    if (status === 'OK') passed++;
  }
  console.log();
  console.log('='.repeat(84));
  console.log(`Total: ${DEMO_ACCOUNTS.length}  Passed: ${passed}  Failed: ${DEMO_ACCOUNTS.length - passed}`);
  console.log('='.repeat(84));
  if (allPass && passed === DEMO_ACCOUNTS.length) {
    console.log('ALL 11 DEMO ACCOUNTS WORKING');
    process.exit(0);
  } else {
    console.log('Some accounts failed. Re-run supabase/cleanup.sql in the Supabase SQL editor.');
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
