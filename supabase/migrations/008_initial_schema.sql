-- ============================================================
-- Migration 008: Initial Schema (retroactive documentation)
-- Roue des Besoins Assurance — Luxembourg
--
-- This migration documents the initial CREATE TABLE statements
-- that were created via Supabase Dashboard but never versioned.
-- All statements use IF NOT EXISTS for idempotency.
-- ============================================================

-- ── Profiles ──
-- Created automatically by Supabase Auth trigger (handle_new_user).
-- Stores user metadata and role assignment.
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'advisor')),
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Questionnaire Responses ──
-- Stores in-progress and completed questionnaire answers as JSONB.
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  completed_universes jsonb NOT NULL DEFAULT '{}'::jsonb,
  profil_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_profile_id ON questionnaire_responses(profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_profile_completed ON questionnaire_responses(profile_id, completed);

-- ── Diagnostics ──
-- Computed diagnostic results linked to a questionnaire response.
CREATE TABLE IF NOT EXISTS diagnostics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  questionnaire_id uuid REFERENCES questionnaire_responses(id) ON DELETE SET NULL,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scores jsonb NOT NULL,
  global_score integer NOT NULL CHECK (global_score >= 0 AND global_score <= 100),
  weightings jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diagnostics_profile_id ON diagnostics(profile_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_questionnaire ON diagnostics(questionnaire_id);

-- ── Actions ──
-- Recommended actions generated from a diagnostic.
CREATE TABLE IF NOT EXISTS actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id uuid NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('immediate', 'deferred', 'event')),
  universe text NOT NULL CHECK (universe IN ('auto', 'habitation', 'prevoyance', 'objets_valeur')),
  priority integer NOT NULL CHECK (priority >= 0),
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_actions_diagnostic_id ON actions(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_actions_profile_id ON actions(profile_id);

-- ── Advisor-Client Relationships ──
-- Managed exclusively by admin/service_role.
CREATE TABLE IF NOT EXISTS advisor_clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (advisor_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_advisor_clients_advisor ON advisor_clients(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisor_clients_client ON advisor_clients(client_id);

-- ── Auth trigger: handle_new_user ──
-- Creates a profile row when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'client'),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Attach to auth.users (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
