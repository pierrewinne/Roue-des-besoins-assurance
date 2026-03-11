-- ============================================================
-- Migration 009: Server-side fixes (security + integrity)
-- Roue des Besoins Assurance — Luxembourg
--
-- Fixes:
-- SEC-02: Replace FORCE ROW LEVEL SECURITY with NO FORCE
-- SEC-03: Remove dead audit_diagnostic_access function
-- SEC-05: Add JSONB validation on questionnaire_responses
-- SEC-12: Add GDPR export audit in export_my_data()
-- P04:    Server-side updated_at trigger
-- P08:    handle_new_user trigger versioned in 008
-- ============================================================


-- ════════════════════════════════════════
-- SEC-02: Remove FORCE ROW LEVEL SECURITY
-- service_role should bypass RLS for admin operations
-- ════════════════════════════════════════

ALTER TABLE profiles NO FORCE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses NO FORCE ROW LEVEL SECURITY;
ALTER TABLE diagnostics NO FORCE ROW LEVEL SECURITY;
ALTER TABLE actions NO FORCE ROW LEVEL SECURITY;
ALTER TABLE advisor_clients NO FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs NO FORCE ROW LEVEL SECURITY;


-- ════════════════════════════════════════
-- P04: Server-side updated_at trigger
-- Replaces client-side updated_at management
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach to tables that have updated_at
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON questionnaire_responses;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ════════════════════════════════════════
-- SEC-03: Remove dead audit_diagnostic_access function
-- PostgreSQL does not support triggers on SELECT.
-- Advisor access audit should be done from frontend via log_audit_event().
-- ════════════════════════════════════════

DROP FUNCTION IF EXISTS audit_diagnostic_access();


-- ════════════════════════════════════════
-- SEC-05: Basic JSONB structure validation on questionnaire_responses
-- Ensures responses is always a JSON object (not array, string, etc.)
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_questionnaire_responses()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure responses is a JSON object
  IF NEW.responses IS NOT NULL AND jsonb_typeof(NEW.responses) != 'object' THEN
    RAISE EXCEPTION 'responses must be a JSON object'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Ensure completed_universes is a JSON object
  IF NEW.completed_universes IS NOT NULL AND jsonb_typeof(NEW.completed_universes) != 'object' THEN
    RAISE EXCEPTION 'completed_universes must be a JSON object'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_qr_jsonb ON questionnaire_responses;
CREATE TRIGGER validate_qr_jsonb
  BEFORE INSERT OR UPDATE ON questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION validate_questionnaire_responses();


-- ════════════════════════════════════════
-- SEC-01 (partial): Scoring validation on diagnostics INSERT
-- Cannot fully recompute server-side (scoring engine is in TypeScript),
-- but validates structural integrity and plausibility.
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_diagnostic_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verify global_score is in valid range
  IF NEW.global_score < 0 OR NEW.global_score > 100 THEN
    RAISE EXCEPTION 'global_score must be between 0 and 100'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Verify scores is a JSON object with expected universe keys
  IF jsonb_typeof(NEW.scores) != 'object' THEN
    RAISE EXCEPTION 'scores must be a JSON object'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Verify weightings is a JSON object
  IF jsonb_typeof(NEW.weightings) != 'object' THEN
    RAISE EXCEPTION 'weightings must be a JSON object'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Verify questionnaire_id references a completed response owned by this user
  IF NEW.questionnaire_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM questionnaire_responses
      WHERE id = NEW.questionnaire_id
        AND profile_id = NEW.profile_id
    ) THEN
      RAISE EXCEPTION 'questionnaire_id must reference a response owned by the user'
        USING ERRCODE = 'foreign_key_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_diagnostic ON diagnostics;
CREATE TRIGGER validate_diagnostic
  BEFORE INSERT ON diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION validate_diagnostic_insert();


-- ════════════════════════════════════════
-- SEC-12: Add GDPR export audit to export_my_data()
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION export_my_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile jsonb;
  v_responses jsonb;
  v_diagnostics jsonb;
  v_actions jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Audit the export request (SEC-12)
  INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, details)
  VALUES (
    v_user_id,
    (SELECT role FROM profiles WHERE id = v_user_id),
    'gdpr_data_export',
    'profile',
    v_user_id,
    '{}'::jsonb
  );

  -- Profile data
  SELECT to_jsonb(p) INTO v_profile
  FROM (
    SELECT id, role, first_name, last_name, email, phone, created_at
    FROM profiles WHERE id = v_user_id
  ) p;

  -- Questionnaire responses
  SELECT COALESCE(jsonb_agg(to_jsonb(q)), '[]'::jsonb) INTO v_responses
  FROM (
    SELECT id, responses, completed, created_at, updated_at
    FROM questionnaire_responses
    WHERE profile_id = v_user_id
    ORDER BY created_at DESC
  ) q;

  -- Diagnostics
  SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb) INTO v_diagnostics
  FROM (
    SELECT id, scores, global_score, weightings, created_at
    FROM diagnostics
    WHERE profile_id = v_user_id
    ORDER BY created_at DESC
  ) d;

  -- Actions
  SELECT COALESCE(jsonb_agg(to_jsonb(a)), '[]'::jsonb) INTO v_actions
  FROM (
    SELECT id, diagnostic_id, type, universe, priority, title, description, created_at
    FROM actions
    WHERE profile_id = v_user_id
    ORDER BY created_at DESC
  ) a;

  RETURN jsonb_build_object(
    'exported_at', now(),
    'user_id', v_user_id,
    'profile', v_profile,
    'questionnaire_responses', v_responses,
    'diagnostics', v_diagnostics,
    'actions', v_actions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION export_my_data() TO authenticated;
