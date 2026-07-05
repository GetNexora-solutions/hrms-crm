-- Enable pgcrypto for generating secure password hashes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_company_id uuid;
  v_user_id uuid := gen_random_uuid();
  v_admin_email text := 'getnexora.solutions@gmail.com';
  v_admin_password text := 'NexoraAdmin@21';
BEGIN
  -- 1. Get the default company ID seeded from 002_seed_data.sql
  SELECT id INTO v_company_id FROM public.companies LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Default company not found. Please run 002_seed_data.sql first.';
  END IF;

  -- 2. Create the user in auth.users
  -- We use crypt() to securely hash the password so Supabase can verify it.
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_admin_email,
    crypt(v_admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 3. Create the corresponding identities record (required for Supabase login to work)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    provider_id
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    format('{"sub":"%s","email":"%s"}', v_user_id::text, v_admin_email)::jsonb,
    'email',
    now(),
    now(),
    now(),
    v_user_id::text
  );

  -- 4. Create the corresponding employee record in our public schema
  INSERT INTO public.employees (
    id,
    user_id,
    company_id,
    emp_id,
    full_name,
    email,
    role,
    status,
    is_temp_password,
    salary
  ) VALUES (
    v_user_id, -- Keep IDs in sync
    v_user_id,
    v_company_id,
    'EMP-0001',
    'System Admin',
    v_admin_email,
    'super_admin',
    'active',
    false, -- Admin doesn't need to change password on first login
    0
  );

END $$;
