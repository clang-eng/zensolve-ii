-- Function to handle point rewards for validation
CREATE OR REPLACE FUNCTION handle_validation_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_add INTEGER := 30; -- Reward for community validation
BEGIN
  -- 1. Add points to the validator
  UPDATE users
  SET points = points + points_to_add
  WHERE id = NEW.validator_id;

  -- 2. Record the transaction
  INSERT INTO point_transactions (
    user_id,
    points_change,
    transaction_type,
    reference_id,
    description
  ) VALUES (
    NEW.validator_id,
    points_to_add,
    'validation',
    NEW.complaint_id,
    'Earned ' || points_to_add || ' points for validating a complaint'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reward points when a validation is submitted
DROP TRIGGER IF EXISTS on_validation_submitted ON validations;
CREATE TRIGGER on_validation_submitted
  AFTER INSERT ON validations
  FOR EACH ROW
  EXECUTE FUNCTION handle_validation_points();

-- Function to find "Resolutions to Validate" near a user
CREATE OR REPLACE FUNCTION get_complaints_to_validate(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_meters FLOAT DEFAULT 1000
)
RETURNS SETOF complaints AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM complaints
  WHERE 
    status = 'resolved' -- Only resolved complaints need validation
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
    AND user_id != auth.uid() -- Can't validate your own complaint
  ORDER BY ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
  );
END;
$$ LANGUAGE plpgsql;
