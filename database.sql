-- Enable once per database (choose one UUID provider)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- OR: CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- then use gen_random_uuid()

-- 1) Enum for user roles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('chairperson', 'top_6', 'member');
  END IF;
END$$;

-- 2) Base tables in FK-safe order

-- Clubs first (referenced by others)
CREATE TABLE IF NOT EXISTS clubs (
  club_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- use gen_random_uuid() if using pgcrypto
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB
);
CREATE UNIQUE INDEX IF NOT EXISTS clubs_name_unique ON clubs (name);

-- Users next (FK to clubs). NOTE: removed UNIQUE from club_id.
CREATE TABLE IF NOT EXISTS cac_user (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  session_token TEXT UNIQUE,                 -- multiple NULLs allowed in Postgres
  display_name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  profile_pic TEXT,
  role user_role NOT NULL DEFAULT 'member',
  account_expiry TIMESTAMPTZ,
  club_id UUID,
  CONSTRAINT fk_user_club
    FOREIGN KEY (club_id)
    REFERENCES clubs(club_id)
    ON DELETE SET NULL
);

-- Events last (FK to clubs)
CREATE TABLE IF NOT EXISTS events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES clubs(club_id) ON DELETE CASCADE,
  image_link TEXT,
  title TEXT NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time   TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  sign_up_link TEXT,
  CONSTRAINT chk_event_time CHECK (end_date_time >= start_date_time)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_events_club   ON events (club_id);
CREATE INDEX IF NOT EXISTS idx_events_start  ON events (start_date_time);
CREATE INDEX IF NOT EXISTS idx_events_end    ON events (end_date_time);

-- 3) updated_at trigger (create function once, then attach to tables)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cac_user_updated_at ON cac_user;
CREATE TRIGGER trg_cac_user_updated_at
BEFORE UPDATE ON cac_user
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
