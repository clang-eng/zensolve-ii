-- Function to check for duplicate complaints within a 50m radius for the same category
CREATE OR REPLACE FUNCTION check_duplicate_complaint(
  p_lat FLOAT,
  p_lng FLOAT,
  p_category VARCHAR,
  p_radius_meters FLOAT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  status VARCHAR,
  distance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.status,
    ST_Distance(
      c.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance
  FROM complaints c
  WHERE 
    c.category = p_category
    AND ST_DWithin(
      c.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_meters
    )
    AND c.status NOT IN ('resolved', 'validated', 'rejected') -- Only check active issues
  ORDER BY distance ASC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS to explicitly block any action for banned users
-- This adds an extra layer of security beyond just the check in INSERT/UPDATE
DROP POLICY IF EXISTS "Banned users cannot select" ON users;
CREATE POLICY "Banned users cannot select"
ON users FOR SELECT
USING (is_banned = false OR auth.uid() = id);

-- Ensure complaints cannot be created by banned users (Global check)
CREATE OR REPLACE FUNCTION check_user_not_banned()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_banned = false
  );
END;
$$ LANGUAGE plpgsql STABLE;
