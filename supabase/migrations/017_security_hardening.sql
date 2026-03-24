-- ════════════════════════════════════════════════════════════
-- Migration 017: Security hardening (pen test findings)
--
-- 1. Align _to_matrix_level to 5 levels (0-4) matching TS toMatrixLevel()
-- 2. Replace _scoring_need_matrix with 5x5 matching TS NEED_MATRIX
-- 3. Update _scoring_quadrant to use 5-level coverage inversion
-- 4. Block advisors from calling delete_my_data()
-- 5. Add size limit to p_details in log_audit_event()
-- ════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════
-- 1. ALIGN _to_matrix_level: 3 levels → 5 levels
-- Matches toMatrixLevel() in thresholds.ts
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _to_matrix_level(p_score int)
RETURNS int
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_score <= 20 THEN 0
    WHEN p_score <= 40 THEN 1
    WHEN p_score <= 60 THEN 2
    WHEN p_score <= 80 THEN 3
    ELSE 4
  END;
$$;


-- ═══════════════════════════════════════════
-- 2. REPLACE _scoring_need_matrix: 3x3 → 5x5
-- Matches NEED_MATRIX in thresholds.ts
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_need_matrix(p_exposure int, p_coverage int)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_matrix int[][] := ARRAY[
    --  complete, good,  partial, weak,  none
    ARRAY[ 5,      15,    25,      35,    45],   -- very low exposure
    ARRAY[10,      25,    40,      55,    65],   -- low exposure
    ARRAY[20,      40,    55,      70,    80],   -- medium exposure
    ARRAY[30,      55,    70,      85,    92],   -- high exposure
    ARRAY[40,      65,    80,      92,    98]    -- very high exposure
  ];
  v_row int;
  v_col int;
BEGIN
  v_row := LEAST(GREATEST(p_exposure, 0), 4) + 1;  -- 1-indexed
  v_col := LEAST(GREATEST(p_coverage, 0), 4) + 1;
  RETURN v_matrix[v_row][v_col];
END;
$$;


-- ═══════════════════════════════════════════
-- 3. UPDATE _scoring_quadrant: use 4 - level (not 2 - level)
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_quadrant(p_quadrant text, p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_exposure int;
  v_coverage int;
  v_coverage_level int;
  v_need_score int;
BEGIN
  CASE p_quadrant
    WHEN 'biens' THEN
      v_exposure := _scoring_biens_exposure(p_answers);
      v_coverage := _scoring_biens_coverage(p_answers);
    WHEN 'personnes' THEN
      v_exposure := _scoring_personnes_exposure(p_answers);
      v_coverage := _scoring_personnes_coverage(p_answers);
    WHEN 'futur' THEN
      v_exposure := _scoring_futur_exposure(p_answers);
      v_coverage := _scoring_futur_coverage(p_answers);
      IF NOT _is_futur_eligible(p_answers) THEN
        RETURN jsonb_build_object(
          'quadrant', p_quadrant,
          'exposure', 0, 'coverage', 100,
          'needScore', 0, 'needLevel', 'low', 'active', false
        );
      END IF;
    ELSE
      -- projets is inactive
      RETURN jsonb_build_object(
        'quadrant', p_quadrant,
        'exposure', 0, 'coverage', 100,
        'needScore', 0, 'needLevel', 'low', 'active', false
      );
  END CASE;

  -- 5-level coverage inversion: 4 - level (was 2 - level for 3x3)
  v_coverage_level := 4 - _to_matrix_level(v_coverage);
  v_need_score := _scoring_need_matrix(_to_matrix_level(v_exposure), v_coverage_level);

  RETURN jsonb_build_object(
    'quadrant', p_quadrant,
    'exposure', v_exposure,
    'coverage', v_coverage,
    'needScore', v_need_score,
    'needLevel', _scoring_need_level(v_need_score),
    'active', true
  );
END;
$$;


-- ═══════════════════════════════════════════
-- 4. BLOCK ADVISORS FROM delete_my_data()
-- MED-01: advisors must contact admin to delete their account
-- ═══════════════════════════════════════════

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

  -- Block advisor self-deletion (MED-01)
  IF v_user_role = 'advisor' THEN
    RAISE EXCEPTION 'Advisors cannot self-delete. Contact your administrator.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

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


-- ═══════════════════════════════════════════
-- 5. ADD SIZE LIMIT TO p_details IN log_audit_event()
-- MED-02: prevent DoS via oversized JSONB payloads
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

  -- Size limit on details payload (10 KB max)
  IF pg_column_size(p_details) > 10240 THEN
    RAISE EXCEPTION 'Audit details payload too large'
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
