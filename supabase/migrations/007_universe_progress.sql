-- Migration 007: Add per-universe progress tracking
-- Supports the new Trivial Pursuit wheel flow

ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS completed_universes jsonb DEFAULT '{}'::jsonb;

ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS profil_completed boolean DEFAULT false;
