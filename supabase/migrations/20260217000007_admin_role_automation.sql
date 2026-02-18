-- Automated staff role assignment via email allowlist
CREATE TABLE IF NOT EXISTS staff_role_allowlist (
  email VARCHAR(255) PRIMARY KEY,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'department')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_role_allowlist_active
  ON staff_role_allowlist(is_active);

ALTER TABLE staff_role_allowlist ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view allowlist" ON staff_role_allowlist;
  CREATE POLICY "Admins can view allowlist"
    ON staff_role_allowlist FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    );

  DROP POLICY IF EXISTS "Admins can manage allowlist" ON staff_role_allowlist;
  CREATE POLICY "Admins can manage allowlist"
    ON staff_role_allowlist FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
END $$;

-- Keep updated_at current for allowlist records
CREATE OR REPLACE FUNCTION set_staff_allowlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_staff_allowlist_updated_at ON staff_role_allowlist;
CREATE TRIGGER trg_staff_allowlist_updated_at
  BEFORE UPDATE ON staff_role_allowlist
  FOR EACH ROW
  EXECUTE FUNCTION set_staff_allowlist_updated_at();

-- Sync existing users when allowlist entries are created/changed
CREATE OR REPLACE FUNCTION sync_staff_role_on_allowlist_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE users
    SET role = NEW.role,
        updated_at = NOW()
    WHERE LOWER(email) = LOWER(NEW.email)
      AND role <> NEW.role;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true THEN
    UPDATE users
    SET role = 'citizen',
        updated_at = NOW()
    WHERE LOWER(email) = LOWER(NEW.email)
      AND role IN ('admin', 'department');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_staff_role_on_allowlist_change ON staff_role_allowlist;
CREATE TRIGGER trg_sync_staff_role_on_allowlist_change
  AFTER INSERT OR UPDATE ON staff_role_allowlist
  FOR EACH ROW
  EXECUTE FUNCTION sync_staff_role_on_allowlist_change();

-- Override auth profile creation to assign role from allowlist automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  resolved_role VARCHAR(50) := 'citizen';
BEGIN
  SELECT s.role
    INTO resolved_role
  FROM public.staff_role_allowlist s
  WHERE LOWER(s.email) = LOWER(NEW.email)
    AND s.is_active = true
  LIMIT 1;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(resolved_role, 'citizen')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill currently registered users who are now allowlisted
UPDATE users u
SET role = s.role,
    updated_at = NOW()
FROM staff_role_allowlist s
WHERE LOWER(u.email) = LOWER(s.email)
  AND s.is_active = true
  AND u.role <> s.role;
