-- =====================================================================
-- FoodHub — Cleanup broken demo auth users (run in Supabase SQL Editor)
-- =====================================================================
-- WHY THIS FILE EXISTS
-- --------------------
-- The original `supabase/schema.sql` created demo auth users via a helper
-- function `public.create_auth_user()` that did a direct INSERT into
-- `auth.users` using dynamic SQL. On newer Supabase versions that
-- helper doesn't populate all the columns GoTrue expects (notably the
-- `auth.identities` rows that GoTrue joins with `auth.users` when
-- loading a user). The result: the demo users exist in `auth.users`
-- but GoTrue returns `Database error loading user` / `Invalid
-- credentials` whenever you try to sign in with them.
--
-- This script:
--   1. Drops the broken demo auth.users (cascade-deletes user_profiles).
--   2. Drops the buggy `create_auth_user()` function so it can be
--      re-defined with a fix that also inserts `auth.identities` rows.
--   3. Re-defines `create_auth_user()` with the fix.
--   4. Re-creates all 11 demo auth.users using the fixed function.
--   5. Re-inserts the matching `user_profiles` rows.
--
-- After running this script, sign-in via
--   admin1@example.com  / admin123
--   vendor1@demo.com    / Vendor@1234
--   dm1@demo.com        / Delivery@1234
--   etc.
-- will work in the admin web panel, the vendor app, and the delivery app.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → paste → Run.
-- Safe to re-run (idempotent).
-- =====================================================================


-- ---------------------------------------------------------------------
-- STEP 1: Drop the broken demo auth.users (cascade-deletes user_profiles)
-- ---------------------------------------------------------------------
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN
    SELECT id FROM auth.users
    WHERE email IN (
      'admin1@example.com','admin2@example.com',
      'customer1@demo.com','customer2@demo.com','customer3@demo.com',
      'vendor1@demo.com','vendor2@demo.com','vendor3@demo.com',
      'dm1@demo.com','dm2@demo.com','dm3@demo.com'
    )
  LOOP
    -- Delete identities first (the FK has ON DELETE CASCADE, but be explicit
    -- in case the cascade is missing on this Supabase version).
    BEGIN
      DELETE FROM auth.identities WHERE user_id = u.id;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Delete the auth.users row (cascade-deletes user_profiles + auth.identities).
    BEGIN
      DELETE FROM auth.users WHERE id = u.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not delete %: %', u.id, SQLERRM;
    END;
  END LOOP;
  RAISE NOTICE 'Step 1 done — broken demo auth.users dropped';
END $$;


-- ---------------------------------------------------------------------
-- STEP 2: Drop the buggy create_auth_user() function (we'll redefine it)
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_auth_user(TEXT, TEXT, TEXT, TEXT);


-- ---------------------------------------------------------------------
-- STEP 3: Re-define create_auth_user() with the fix
-- ---------------------------------------------------------------------
-- FIX: also INSERT into auth.identities (with dynamic column detection
--      so it works on both older and newer Supabase versions where
--      auth.identities has extra columns like `email`).
-- FIX: explicitly populate `is_anonymous` if it exists.
CREATE OR REPLACE FUNCTION public.create_auth_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'customer'
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_encrypted_pw TEXT := crypt(p_password, gen_salt('bf', 12));
  v_existing_id UUID;
  v_col_name TEXT;
  v_col_value TEXT;
  v_cols TEXT := '';
  v_vals TEXT := '';
  v_sql TEXT;
  v_meta jsonb := jsonb_build_object('name', p_name, 'role', p_role);
  v_id_cols TEXT := '';
  v_id_vals TEXT := '';
  v_id_col_name TEXT;
  v_id_col_value TEXT;
  v_id_sql TEXT;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_existing_id FROM auth.users WHERE email = p_email;
  IF v_existing_id IS NOT NULL THEN
    -- Update existing user with fresh password + metadata
    v_encrypted_pw := crypt(p_password, gen_salt('bf', 12));
    UPDATE auth.users SET
      encrypted_password = v_encrypted_pw,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || v_meta,
      updated_at = NOW()
    WHERE id = v_existing_id;

    -- Also ensure an auth.identities row exists for this user
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_existing_id) THEN
      BEGIN
        INSERT INTO auth.identities (user_id, identity_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
        VALUES (v_existing_id, v_existing_id::text, 'email',
          jsonb_build_object('sub', v_existing_id::text, 'email', p_email, 'email_verified', true),
          NOW(), NOW(), NOW());
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'identities insert (existing user) skipped: %', SQLERRM;
      END;
    END IF;

    RETURN v_existing_id;
  END IF;

  -- INSERT new auth.users row — populate every column dynamically
  FOR v_col_name IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users'
    ORDER BY ordinal_position
  LOOP
    v_col_value := CASE v_col_name
      WHEN 'id' THEN quote_literal(v_user_id::text)
      WHEN 'instance_id' THEN quote_literal('00000000-0000-0000-0000-000000000000')
      WHEN 'aud' THEN quote_literal('authenticated')
      WHEN 'role' THEN quote_literal('authenticated')
      WHEN 'email' THEN quote_literal(p_email)
      WHEN 'encrypted_password' THEN quote_literal(v_encrypted_pw)
      WHEN 'email_confirmed_at' THEN 'NOW()'
      WHEN 'raw_app_meta_data' THEN quote_literal('{"provider":"email","providers":["email"]}') || '::jsonb'
      WHEN 'raw_user_meta_data' THEN quote_literal(v_meta::text) || '::jsonb'
      WHEN 'app_metadata' THEN quote_literal('{"provider":"email","providers":["email"]}') || '::jsonb'
      WHEN 'user_metadata' THEN quote_literal(v_meta::text) || '::jsonb'
      WHEN 'created_at' THEN 'NOW()'
      WHEN 'updated_at' THEN 'NOW()'
      WHEN 'is_sso_user' THEN 'FALSE'
      WHEN 'is_anonymous' THEN 'FALSE'
      WHEN 'phone' THEN 'NULL'
      WHEN 'phone_confirmed_at' THEN 'NULL'
      WHEN 'email_change' THEN quote_literal('')
      WHEN 'banned_until' THEN 'NULL'
      WHEN 'banned_reason' THEN 'NULL'
      WHEN 'deleted_at' THEN 'NULL'
      ELSE 'NULL'
    END;

    IF v_cols = '' THEN
      v_cols := v_col_name;
      v_vals := v_col_value;
    ELSE
      v_cols := v_cols || ', ' || v_col_name;
      v_vals := v_vals || ', ' || v_col_value;
    END IF;
  END LOOP;

  v_sql := 'INSERT INTO auth.users (' || v_cols || ') VALUES (' || v_vals || ')';
  EXECUTE v_sql;

  -- INSERT matching auth.identities row — also dynamically populate columns
  -- so this works on both older (id, user_id, identity_id, provider, identity_data, ...)
  -- and newer (also has `email` NOT NULL column) Supabase auth.identities schemas.
  FOR v_id_col_name IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'identities'
    ORDER BY ordinal_position
  LOOP
    v_id_col_value := CASE v_id_col_name
      WHEN 'id' THEN quote_literal(gen_random_uuid()::text)
      WHEN 'user_id' THEN quote_literal(v_user_id::text)
      WHEN 'identity_id' THEN quote_literal(v_user_id::text)
      WHEN 'identity_data' THEN quote_literal(jsonb_build_object(
        'sub', v_user_id::text,
        'email', p_email,
        'email_verified', true
      )::text) || '::jsonb'
      WHEN 'provider' THEN quote_literal('email')
      WHEN 'last_sign_in_at' THEN 'NOW()'
      WHEN 'created_at' THEN 'NOW()'
      WHEN 'updated_at' THEN 'NOW()'
      WHEN 'email' THEN quote_literal(p_email)
      ELSE 'NULL'
    END;

    IF v_id_cols = '' THEN
      v_id_cols := v_id_col_name;
      v_id_vals := v_id_col_value;
    ELSE
      v_id_cols := v_id_cols || ', ' || v_id_col_name;
      v_id_vals := v_id_vals || ', ' || v_id_col_value;
    END IF;
  END LOOP;

  IF v_id_cols <> '' THEN
    v_id_sql := 'INSERT INTO auth.identities (' || v_id_cols || ') VALUES (' || v_id_vals || ')';
    BEGIN
      EXECUTE v_id_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'auth.identities insert skipped: %', SQLERRM;
    END;
  END IF;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---------------------------------------------------------------------
-- STEP 4: Re-create all 11 demo auth.users + user_profiles
-- ---------------------------------------------------------------------
DO $$
DECLARE
  v_admin1_uuid UUID;  v_admin2_uuid UUID;
  v_cust1_uuid UUID;   v_cust2_uuid UUID;  v_cust3_uuid UUID;
  v_vendor1_uuid UUID; v_vendor2_uuid UUID; v_vendor3_uuid UUID;
  v_dm1_uuid UUID;     v_dm2_uuid UUID;    v_dm3_uuid UUID;
BEGIN
  -- Admins (2)
  SELECT public.create_auth_user('admin1@example.com', 'admin123', 'Rahul Sharma', 'admin') INTO v_admin1_uuid;
  SELECT public.create_auth_user('admin2@example.com', 'admin456', 'Priya Verma',  'admin') INTO v_admin2_uuid;

  -- Customers (3)
  SELECT public.create_auth_user('customer1@demo.com', 'Customer@1234', 'John Customer', 'customer') INTO v_cust1_uuid;
  SELECT public.create_auth_user('customer2@demo.com', 'Customer@1234', 'Sarah Buyer',   'customer') INTO v_cust2_uuid;
  SELECT public.create_auth_user('customer3@demo.com', 'Customer@1234', 'Mike Shopper',  'customer') INTO v_cust3_uuid;

  -- Vendors (3)
  SELECT public.create_auth_user('vendor1@demo.com', 'Vendor@1234', 'Burger Junction Owner', 'vendor') INTO v_vendor1_uuid;
  SELECT public.create_auth_user('vendor2@demo.com', 'Vendor@1234', 'Pizza Palace Owner',    'vendor') INTO v_vendor2_uuid;
  SELECT public.create_auth_user('vendor3@demo.com', 'Vendor@1234', 'Sushi World Owner',    'vendor') INTO v_vendor3_uuid;

  -- Delivery Men (3)
  SELECT public.create_auth_user('dm1@demo.com', 'Delivery@1234', 'John Driver',   'delivery-man') INTO v_dm1_uuid;
  SELECT public.create_auth_user('dm2@demo.com', 'Delivery@1234', 'Sara Rider',    'delivery-man') INTO v_dm2_uuid;
  SELECT public.create_auth_user('dm3@demo.com', 'Delivery@1234', 'Mike Delivery', 'delivery-man') INTO v_dm3_uuid;

  -- Insert / re-insert user_profiles (the FK rows were cascade-deleted in Step 1)
  INSERT INTO public.user_profiles (user_id, role, is_active) VALUES
    (v_admin1_uuid,  'admin',        TRUE),
    (v_admin2_uuid,  'admin',        TRUE),
    (v_cust1_uuid,   'customer',     TRUE),
    (v_cust2_uuid,   'customer',     TRUE),
    (v_cust3_uuid,   'customer',     TRUE),
    (v_vendor1_uuid, 'vendor',       TRUE),
    (v_vendor2_uuid, 'vendor',       TRUE),
    (v_vendor3_uuid, 'vendor',       TRUE),
    (v_dm1_uuid,     'delivery-man', TRUE),
    (v_dm2_uuid,     'delivery-man', TRUE),
    (v_dm3_uuid,     'delivery-man', TRUE)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, is_active = TRUE, updated_at = NOW();

  RAISE NOTICE 'Step 4 done — 11 demo auth.users + user_profiles created';
END $$;


-- ---------------------------------------------------------------------
-- STEP 5: Verification
-- ---------------------------------------------------------------------
SELECT '========================================' AS status;
SELECT 'CLEANUP + RECREATE COMPLETE' AS status;
SELECT '========================================' AS status;

SELECT 'auth.users'         AS table_name, COUNT(*) AS cnt FROM auth.users
UNION ALL SELECT 'auth.identities',    COUNT(*) FROM auth.identities
UNION ALL SELECT 'user_profiles',      COUNT(*) FROM public.user_profiles;

SELECT 'Admins:    admin1@example.com / admin123'        AS credentials
UNION ALL SELECT '           admin2@example.com / admin456'
UNION ALL SELECT 'Customers: customer1@demo.com / Customer@1234'
UNION ALL SELECT 'Vendors:   vendor1@demo.com / Vendor@1234'
UNION ALL SELECT 'Delivery:  dm1@demo.com / Delivery@1234';
