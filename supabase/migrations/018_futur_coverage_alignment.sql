-- ════════════════════════════════════════════════════════════
-- Migration 018: Futur coverage alignment + export audit_logs + cleanup
--
-- 1. Align _scoring_futur_coverage with TS engine fix:
--    - Remove income_contributors (double-counted with exposure)
--    - Increase STATUS_COV values (Luxembourg social security)
--    - Increase pension_plan/pension_employer scores
--    - Redistribute weights: savings 55%, status 30%, patrimoine 15%
-- 2. Include audit_logs in export_my_data() (MOD-7)
-- 3. Remove view_client_detail from audit whitelist (MOD-11 — never called)
-- ════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════
-- 1. Align _scoring_futur_coverage with TS engine
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_futur_coverage(p_answers jsonb)
RETURNS int
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_score numeric := 0;
  v_savings jsonb;
  v_devices_cov numeric := 0;
BEGIN
  IF NOT _is_futur_eligible(p_answers) THEN RETURN 100; END IF;

  -- Existing savings/protection devices (weight 55%)
  v_savings := p_answers->'savings_protection';
  IF v_savings IS NOT NULL AND jsonb_typeof(v_savings) = 'array' THEN
    IF _jsonb_includes(v_savings, 'pension_plan') THEN v_devices_cov := v_devices_cov + 45; END IF;
    IF _jsonb_includes(v_savings, 'pension_employer') THEN v_devices_cov := v_devices_cov + 35; END IF;
    IF _jsonb_includes(v_savings, 'life_insurance') THEN v_devices_cov := v_devices_cov + 25; END IF;
    IF _jsonb_includes(v_savings, 'savings_regular') THEN v_devices_cov := v_devices_cov + 10; END IF;
    IF _jsonb_includes(v_savings, 'real_estate') THEN v_devices_cov := v_devices_cov + 15; END IF;
  END IF;
  v_score := v_score + LEAST(v_devices_cov, 100) * 0.55;

  -- Professional status protection (weight 30%) — reflects Luxembourg social security
  v_score := v_score + (CASE COALESCE(p_answers->>'professional_status', '')
    WHEN 'civil_servant' THEN 80 WHEN 'employee' THEN 65
    WHEN 'independent' THEN 20 WHEN 'business_owner' THEN 25
    WHEN 'retired' THEN 40 ELSE 20
  END) * 0.30;

  -- Real estate patrimony (weight 15%)
  v_score := v_score + (CASE COALESCE(p_answers->>'other_properties', '')
    WHEN 'none' THEN 0 WHEN 'secondary' THEN 30
    WHEN 'rental' THEN 50 WHEN 'both' THEN 70 ELSE 0
  END) * 0.15;

  RETURN ROUND(v_score);
END;
$$;


-- ═══════════════════════════════════════════
-- 2. Include audit_logs in export_my_data() (MOD-7)
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION export_my_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile jsonb;
  v_responses jsonb;
  v_diagnostics jsonb;
  v_actions jsonb;
  v_audit_logs jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Audit the export request
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
    SELECT id, role, first_name, last_name, email, phone, created_at, updated_at
    FROM profiles
    WHERE id = v_user_id
  ) p;

  -- Questionnaire responses
  SELECT COALESCE(jsonb_agg(to_jsonb(r)), '[]'::jsonb) INTO v_responses
  FROM (
    SELECT id, responses, consent_given_at, created_at, updated_at
    FROM questionnaire_responses
    WHERE profile_id = v_user_id
    ORDER BY created_at DESC
  ) r;

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

  -- Audit logs (MOD-7: include in GDPR export)
  SELECT COALESCE(jsonb_agg(to_jsonb(l)), '[]'::jsonb) INTO v_audit_logs
  FROM (
    SELECT id, action, resource_type, resource_id, created_at
    FROM audit_logs
    WHERE user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1000
  ) l;

  RETURN jsonb_build_object(
    'exported_at', now(),
    'user_id', v_user_id,
    'profile', v_profile,
    'questionnaire_responses', v_responses,
    'diagnostics', v_diagnostics,
    'actions', v_actions,
    'audit_logs', v_audit_logs
  );
END;
$$;

GRANT EXECUTE ON FUNCTION export_my_data() TO authenticated;


-- ═══════════════════════════════════════════
-- 3. Remove view_client_detail from audit whitelist (MOD-11)
--    It was whitelisted but never called — dead entry
-- ═══════════════════════════════════════════

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
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_allowed_actions text[] := ARRAY[
    'diagnostic_viewed',
    'diagnostic_pdf_downloaded',
    'diagnostic_pdf_advisor_downloaded',
    'view_client_diagnostic',
    'gdpr_data_export',
    'gdpr_data_deletion_initiated',
    'gdpr_data_deleted',
    'diagnostic_computed'
  ];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF NOT (p_action = ANY(v_allowed_actions)) THEN
    RAISE EXCEPTION 'Action "%" is not in the allowed audit actions whitelist.', p_action
      USING ERRCODE = 'check_violation';
  END IF;

  -- Size limit on details payload (10 KB max)
  IF pg_column_size(p_details) > 10240 THEN
    RAISE EXCEPTION 'Audit details payload too large (max 10 KB).'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT role INTO v_user_role FROM profiles WHERE id = v_user_id;

  INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, details)
  VALUES (v_user_id, v_user_role, p_action, p_resource_type, p_resource_id, p_details);
END;
$$;

GRANT EXECUTE ON FUNCTION log_audit_event(text, text, uuid, jsonb) TO authenticated;
