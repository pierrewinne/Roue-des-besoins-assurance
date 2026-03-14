-- ════════════════════════════════════════════════════════════
-- Migration 015: Extended audit trail (P3-07 + P2-08 update)
-- Adds server-side audit for compute_and_save_diagnostic & delete_my_data
-- Extends whitelist with new actions
-- ════════════════════════════════════════════════════════════

-- ── 1. Update whitelist with new server-side actions ──

CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role text;
  v_allowed_actions text[] := ARRAY[
    'view_client_diagnostic',
    'view_client_detail',
    'gdpr_data_export',
    'gdpr_data_deleted',
    'gdpr_data_deletion_initiated',
    'generate_pdf_client',
    'generate_pdf_advisor',
    'diagnostic_computed'
  ];
BEGIN
  -- Whitelist check
  IF NOT (p_action = ANY(v_allowed_actions)) THEN
    RAISE EXCEPTION 'Unknown audit action: %', p_action
      USING ERRCODE = 'check_violation';
  END IF;

  -- Get user role from profile
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    v_user_role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$;

GRANT EXECUTE ON FUNCTION log_audit_event(text, text, uuid, jsonb) TO authenticated;


-- ── 2. Add audit trail to compute_and_save_diagnostic ──
-- We patch the end of the function to log after insert

-- Note: the full function is in migration 013. Here we add a direct audit_logs
-- insert right before the RETURN, since log_audit_event requires auth.uid() which
-- is already available inside this SECURITY DEFINER function.

-- Rather than rewriting the entire 400-line function, we add a trigger on diagnostics INSERT:

CREATE OR REPLACE FUNCTION audit_diagnostic_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role text;
BEGIN
  SELECT role INTO v_user_role FROM profiles WHERE id = NEW.profile_id;

  INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, details)
  VALUES (
    NEW.profile_id,
    v_user_role,
    'diagnostic_computed',
    'diagnostics',
    NEW.id,
    jsonb_build_object(
      'questionnaire_id', NEW.questionnaire_id,
      'global_score', NEW.global_score,
      'scoring_version', NEW.scoring_version
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_diagnostic_created ON diagnostics;
CREATE TRIGGER trg_audit_diagnostic_created
  AFTER INSERT ON diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION audit_diagnostic_created();


-- ── 3. Add explicit audit trail to delete_my_data ──
-- Log the deletion initiation BEFORE cascading deletes (which anonymize audit_logs)

CREATE OR REPLACE FUNCTION delete_my_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_actions_count int;
  v_diagnostics_count int;
  v_responses_count int;
  v_advisor_relations_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Get user role before deletion
  SELECT role INTO v_user_role FROM profiles WHERE id = v_user_id;

  -- Audit the deletion initiation BEFORE data is deleted
  INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, details)
  VALUES (
    v_user_id,
    v_user_role,
    'gdpr_data_deletion_initiated',
    'profile',
    v_user_id,
    jsonb_build_object('initiated_at', now())
  );

  -- 1. Delete actions
  DELETE FROM actions WHERE profile_id = v_user_id;
  GET DIAGNOSTICS v_actions_count = ROW_COUNT;

  -- 2. Delete diagnostics
  DELETE FROM diagnostics WHERE profile_id = v_user_id;
  GET DIAGNOSTICS v_diagnostics_count = ROW_COUNT;

  -- 3. Delete questionnaire responses
  DELETE FROM questionnaire_responses WHERE profile_id = v_user_id;
  GET DIAGNOSTICS v_responses_count = ROW_COUNT;

  -- 4. Remove advisor-client relationships
  DELETE FROM advisor_clients WHERE client_id = v_user_id;
  GET DIAGNOSTICS v_advisor_relations_count = ROW_COUNT;

  -- 5. Anonymize audit logs (preserve for regulatory compliance, remove PII)
  UPDATE audit_logs SET user_id = NULL WHERE user_id = v_user_id;

  -- 6. Delete profile
  DELETE FROM profiles WHERE id = v_user_id;

  -- 7. Delete auth.users record (SEC-07: full GDPR erasure)
  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'deleted', jsonb_build_object(
      'actions', v_actions_count,
      'diagnostics', v_diagnostics_count,
      'questionnaire_responses', v_responses_count,
      'advisor_relations', v_advisor_relations_count,
      'auth_user', true
    ),
    'timestamp', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION delete_my_data() TO authenticated;
