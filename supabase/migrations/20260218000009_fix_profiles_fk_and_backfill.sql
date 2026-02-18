-- Repair profiles FK target and make backfill resilient to non-auth rows in public.users.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill from public.users only when the id also exists in auth.users.
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.full_name, au.raw_user_meta_data->>'full_name') AS full_name,
  CASE
    WHEN u.role::text IN ('citizen', 'admin', 'department') THEN u.role::text
    ELSE 'citizen'
  END AS role,
  COALESCE(u.created_at::timestamptz, NOW()) AS created_at,
  COALESCE(u.updated_at::timestamptz, NOW()) AS updated_at
FROM public.users u
INNER JOIN auth.users au ON au.id = u.id
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Ensure every auth user has a profile even if no matching public.users row exists.
INSERT INTO public.profiles (id, full_name, role)
SELECT
  au.id,
  au.raw_user_meta_data->>'full_name' AS full_name,
  'citizen' AS role
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
