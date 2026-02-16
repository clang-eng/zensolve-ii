-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'department')),
  points INTEGER DEFAULT 0,
  badge VARCHAR(50) DEFAULT 'none',
  location GEOGRAPHY(POINT, 4326),
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'assigned', 'in_progress', 
    'resolved', 'validated', 'rejected', 'reopened'
  )),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  images TEXT[],
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create validations table
CREATE TABLE IF NOT EXISTS validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  validator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  validation_type VARCHAR(50) NOT NULL CHECK (validation_type IN ('verified', 'not_resolved')),
  comment TEXT,
  proof_images TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(complaint_id, validator_id)
);

-- Create point transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('complaint_resolved', 'validation', 'redemption', 'fraud_penalty', 'manual_adjustment')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create business partners table
CREATE TABLE IF NOT EXISTS business_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  offers JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create status history table
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_validations_complaint_id ON validations(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);

-- Function to find nearby users
CREATE OR REPLACE FUNCTION find_nearby_users(
  complaint_location GEOGRAPHY,
  radius_meters FLOAT
)
RETURNS TABLE (
  id UUID,
  full_name VARCHAR,
  email VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.full_name, u.email
  FROM users u
  WHERE ST_DWithin(
    u.location::geography,
    complaint_location,
    radius_meters
  )
  AND u.is_banned = false;
END;
$$ LANGUAGE plpgsql;

-- Trigger for complaint reopening logic
CREATE OR REPLACE FUNCTION check_complaint_reopening()
RETURNS TRIGGER AS $$
DECLARE
  not_resolved_count INTEGER;
BEGIN
  -- Count "not_resolved" validations for this complaint
  SELECT COUNT(*) INTO not_resolved_count
  FROM validations
  WHERE complaint_id = NEW.complaint_id
    AND validation_type = 'not_resolved';
  
  -- If threshold reached (3), reopen complaint
  IF not_resolved_count >= 3 THEN
    UPDATE complaints
    SET status = 'reopened'
    WHERE id = NEW.complaint_id
      AND status = 'resolved';
    
    -- Create notification for department
    INSERT INTO notifications (user_id, type, title, message, reference_id)
    SELECT 
      assigned_to,
      'complaint_reopened',
      'Complaint Reopened',
      'Complaint has been reopened due to community feedback',
      NEW.complaint_id
    FROM complaints
    WHERE id = NEW.complaint_id
      AND assigned_to IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validation_reopening_trigger
AFTER INSERT ON validations
FOR EACH ROW
EXECUTE FUNCTION check_complaint_reopening();
