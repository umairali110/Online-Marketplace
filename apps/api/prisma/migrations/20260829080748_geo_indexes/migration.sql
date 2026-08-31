CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE INDEX IF NOT EXISTS provider_profiles_geo_idx
  ON provider_profiles USING gist (ll_to_earth(latitude, longitude));

CREATE INDEX IF NOT EXISTS stores_geo_idx
  ON stores USING gist (ll_to_earth(latitude, longitude));