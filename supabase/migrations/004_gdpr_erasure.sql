-- ============================================================
-- Migration 004: GDPR Right to Erasure (Article 17)
-- Roue des Besoins Assurance — Luxembourg
--
-- Provides a function callable by authenticated users to
-- delete all their personal data. This implements:
-- - Right to erasure (GDPR Art. 17)
-- - Data minimization principle
--
-- The function deletes in cascading order to respect FK constraints.
-- The auth.users record is NOT deleted here (requires service_role).
-- ============================================================

CREATE OR REPLACE FUNCTION delete_my_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_actions_count int;
  v_diagnostics_count int;
  v_responses_count int;
  v_advisor_relations_count int;
BEGIN
  -- Ensure the user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 1. Delete actions (depends on diagnostics)
  DELETE FROM actions WHERE profile_id = v_user_id;
  GET DIAGNOSTICS v_actions_count = ROW_COUNT;

  -- 2. Delete diagnostics (depends on questionnaire_responses)
  DELETE FROM diagnostics WHERE profile_id = v_user_id;
  GET DIAGNOSTICS v_diagnostics_count = ROW_COUNT;

  -- 3. Delete questionnaire responses
  DELETE FROM questionnaire_responses WHERE profile_id = v_user_id;
  GET DIAGNOSTICS v_responses_count = ROW_COUNT;

  -- 4. Remove advisor-client relationships
  DELETE FROM advisor_clients WHERE client_id = v_user_id;
  GET DIAGNOSTICS v_advisor_relations_count = ROW_COUNT;

  -- 5. Anonymize profile (keep record for FK integrity with auth.users)
  UPDATE profiles
  SET
    first_name = NULL,
    last_name = NULL,
    email = NULL,
    phone = NULL,
    updated_at = now()
  WHERE id = v_user_id;

  -- Return summary of deleted data
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'deleted', jsonb_build_object(
      'actions', v_actions_count,
      'diagnostics', v_diagnostics_count,
      'questionnaire_responses', v_responses_count,
      'advisor_relations', v_advisor_relations_count
    ),
    'profile_anonymized', true,
    'timestamp', now()
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION delete_my_data() TO authenticated;


-- ════════════════════════════════════════
-- Data export function (GDPR Art. 15 - Right of Access)
-- Returns all personal data as JSON for download
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
