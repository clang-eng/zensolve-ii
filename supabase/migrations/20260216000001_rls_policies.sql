-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- USERS TABLE POLICIES
-------------------------------------------------------------------------------

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
END $$;

-------------------------------------------------------------------------------
-- COMPLAINTS TABLE POLICIES
-------------------------------------------------------------------------------

DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view complaints" ON complaints;
    CREATE POLICY "Anyone can view complaints" ON complaints FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can create complaints" ON complaints;
    CREATE POLICY "Users can create complaints" ON complaints FOR INSERT WITH CHECK (
      auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = true)
    );
    
    DROP POLICY IF EXISTS "Users can update own complaints" ON complaints;
    CREATE POLICY "Users can update own complaints" ON complaints FOR UPDATE USING (
      auth.uid() = user_id AND status = 'submitted'
    );
    
    DROP POLICY IF EXISTS "Staff can update complaints" ON complaints;
    CREATE POLICY "Staff can update complaints" ON complaints FOR UPDATE USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'department'))
    );
END $$;

-------------------------------------------------------------------------------
-- VALIDATIONS TABLE POLICIES
-------------------------------------------------------------------------------

DO $$ BEGIN
    DROP POLICY IF EXISTS "View validations" ON validations;
    CREATE POLICY "View validations" ON validations FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can validate" ON validations;
    CREATE POLICY "Users can validate" ON validations FOR INSERT WITH CHECK (
      auth.uid() = validator_id AND NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = true)
    );
END $$;

-------------------------------------------------------------------------------
-- NOTIFICATIONS TABLE POLICIES
-------------------------------------------------------------------------------

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
    CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
    CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
END $$;

-------------------------------------------------------------------------------
-- POINT TRANSACTIONS TABLE POLICIES
-------------------------------------------------------------------------------

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users view own transactions" ON point_transactions;
    CREATE POLICY "Users view own transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
END $$;

-------------------------------------------------------------------------------
-- BUSINESS PARTNERS TABLE POLICIES
-------------------------------------------------------------------------------

DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone view active partners" ON business_partners;
    CREATE POLICY "Anyone view active partners" ON business_partners FOR SELECT USING (is_active = true);
END $$;
