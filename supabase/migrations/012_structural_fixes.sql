-- ════════════════════════════════════════════════════════════
-- Migration 012: Structural fixes (P2-04, P2-05, CRIT-1 prep)
-- ════════════════════════════════════════════════════════════

-- P2-04: Prevent duplicate active questionnaires per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_one_active_per_user
  ON questionnaire_responses(profile_id)
  WHERE completed = false;

-- P2-05: Track scoring engine version for auditability
ALTER TABLE diagnostics ADD COLUMN IF NOT EXISTS scoring_version text NOT NULL DEFAULT 'v1';

-- CRIT-1 prep: Update actions.universe CHECK to V1 product identifiers
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_universe_check;
ALTER TABLE actions ADD CONSTRAINT actions_universe_check
  CHECK (universe IN ('drive', 'home', 'travel', 'bsafe'));

-- Migrate any existing action rows from old to new universe values
UPDATE actions SET universe = 'drive' WHERE universe = 'auto';
UPDATE actions SET universe = 'home' WHERE universe = 'habitation';
UPDATE actions SET universe = 'bsafe' WHERE universe = 'prevoyance';
UPDATE actions SET universe = 'bsafe' WHERE universe = 'objets_valeur';
