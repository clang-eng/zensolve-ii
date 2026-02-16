-- Function to update badge based on points
CREATE OR REPLACE FUNCTION update_user_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.points >= 2500 THEN
    NEW.badge := 'Zen Master';
  ELSIF NEW.points >= 1000 THEN
    NEW.badge := 'Urban Hero';
  ELSIF NEW.points >= 500 THEN
    NEW.badge := 'Community Pillar';
  ELSIF NEW.points >= 100 THEN
    NEW.badge := 'Active Citizen';
  ELSE
    NEW.badge := 'Novice';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update badge whenever points change
DROP TRIGGER IF EXISTS on_points_updated ON users;
CREATE TRIGGER on_points_updated
  BEFORE UPDATE OF points ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_badge();
