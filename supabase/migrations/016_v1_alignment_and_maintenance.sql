-- ════════════════════════════════════════════════════════════
-- Migration 016: V1 engine alignment + maintenance fixes
--
-- 1. Align PL/pgSQL scoring with TypeScript V1 engine
--    - Fix personnes weights (family 25→30%, sports 15→20%, remove health_concerns)
--    - Fix personnes coverage (remove RC vie privée, new weights 42/38/20)
--    - Add futur exposure/coverage functions
--    - Update weightings to include futur quadrant
-- 2. Extend actions.universe for futur products
-- 3. Add consent tracking (RGPD)
-- 4. Add data retention policy helpers
-- 5. Add futur product rules to main scoring function
-- ════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════
-- 1. CONSENT TRACKING (RGPD MAJ-03)
-- ═══════════════════════════════════════════

ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz;

COMMENT ON COLUMN questionnaire_responses.consent_given_at IS
  'Timestamp when the user gave RGPD consent for data processing. NULL = consent not yet recorded.';


-- ═══════════════════════════════════════════
-- 2. ACTIONS.UNIVERSE CONSTRAINT (MAJ-07)
-- Allow futur products + NULL for unmapped products
-- ═══════════════════════════════════════════

ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_universe_check;

-- Make universe nullable for products that don't map to a universe
ALTER TABLE actions ALTER COLUMN universe DROP NOT NULL;

ALTER TABLE actions ADD CONSTRAINT actions_universe_check
  CHECK (universe IS NULL OR universe IN ('drive', 'home', 'travel', 'bsafe', 'pension_plan', 'life_plan', 'switch_plan'));


-- ═══════════════════════════════════════════
-- 3. FUTUR ELIGIBILITY HELPER
-- Matches isFuturEligible() in answer-helpers.ts
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _is_futur_eligible(p_answers jsonb)
RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$
  SELECT
    COALESCE(p_answers->>'residence_status', '') = 'resident_gdl'
    AND COALESCE(p_answers->>'age_range', '') NOT IN ('65_plus', '80_plus')
    AND COALESCE(p_answers->>'professional_status', '') NOT IN ('student', 'inactive');
$$;


-- ═══════════════════════════════════════════
-- 4. FIX PERSONNES EXPOSURE (align weights)
-- TS engine: family 30%, dependents 20%, WIC 15%, income 10%, sports 20%, age 5%
-- Old PL/pgSQL: family 25%, ... sports 15%, health_concerns 10%
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_personnes_exposure(p_answers jsonb)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_score numeric := 0;
  v_weights numeric := 0;
  v_family text;
  v_family_score numeric := 20;
  v_wic text;
  v_sports_score numeric := 0;
  v_elem text;
  v_high_risk text[] := ARRAY['winter_sports','water_sports','mountain_outdoor','equestrian','motor_sports','combat_contact'];
BEGIN
  v_family := COALESCE(p_answers->>'family_status', '');

  -- Family vulnerability (weight 30% — was 25%)
  IF v_family IN ('couple_with_children', 'single_parent', 'recomposed') THEN
    v_family_score := 70;
  END IF;
  IF COALESCE(p_answers->>'income_contributors', '') = 'one' AND v_family_score >= 70 THEN
    v_family_score := 100;
  END IF;
  v_score := v_score + v_family_score * 0.30;
  v_weights := v_weights + 0.30;

  -- Financial dependents (weight 20%)
  v_score := v_score + (CASE COALESCE(p_answers->>'financial_dependents', '')
    WHEN 'none' THEN 10 WHEN 'partner' THEN 40 WHEN 'children' THEN 60
    WHEN 'partner_children' THEN 90 WHEN 'extended' THEN 80 ELSE 30
  END) * 0.20;
  v_weights := v_weights + 0.20;

  -- Work incapacity vulnerability (weight 15%)
  v_wic := COALESCE(p_answers->>'work_incapacity_concern', '');
  v_score := v_score + (CASE
    WHEN v_wic = '' THEN 30
    WHEN v_wic = 'less_1_month' THEN 100
    WHEN v_wic = '1_3_months' THEN 80
    WHEN v_wic = '3_6_months' THEN 55
    WHEN v_wic = '6_12_months' THEN 30
    WHEN v_wic = 'more_12_months' THEN 10
    ELSE 50
  END) * 0.15;
  v_weights := v_weights + 0.15;

  -- Income level at risk (weight 10%)
  v_score := v_score + (CASE COALESCE(p_answers->>'income_range', '')
    WHEN 'less_3k' THEN 30 WHEN '3k_5k' THEN 45 WHEN '5k_8k' THEN 65
    WHEN '8k_12k' THEN 80 WHEN '12k_plus' THEN 100 WHEN 'no_answer' THEN 50 ELSE 50
  END) * 0.10;
  v_weights := v_weights + 0.10;

  -- Sports risk (weight 20% — was 15%. health_concerns removed)
  IF p_answers->'sports_activities' IS NOT NULL AND jsonb_typeof(p_answers->'sports_activities') = 'array' THEN
    FOR v_elem IN SELECT jsonb_array_elements_text(p_answers->'sports_activities') LOOP
      IF v_elem = ANY(v_high_risk) THEN v_sports_score := v_sports_score + 25; END IF;
      IF v_elem IN ('running_cycling', 'team_sports') THEN v_sports_score := v_sports_score + 10; END IF;
    END LOOP;
  END IF;
  v_score := v_score + LEAST(v_sports_score, 100) * 0.20;
  v_weights := v_weights + 0.20;

  -- Age factor (weight 5%)
  v_score := v_score + (CASE COALESCE(p_answers->>'age_range', '')
    WHEN '18_25' THEN 30 WHEN '26_35' THEN 50 WHEN '36_45' THEN 90
    WHEN '46_55' THEN 100 WHEN '56_65' THEN 70 WHEN '65_plus' THEN 40 WHEN '80_plus' THEN 20 ELSE 50
  END) * 0.05;
  v_weights := v_weights + 0.05;

  IF v_weights > 0 THEN RETURN ROUND(v_score / v_weights); END IF;
  RETURN 50;
END;
$$;


-- ═══════════════════════════════════════════
-- 5. FIX PERSONNES COVERAGE (align weights)
-- TS engine: accident 42%, savings 38%, income 20% (no RC vie privée)
-- Old PL/pgSQL: accident 35%, RC vie privée 20%, savings 30%, income 15%
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_personnes_coverage(p_answers jsonb)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_score numeric := 0;
  v_weights numeric := 0;
  v_acc_cov text;
  v_savings jsonb;
  v_has_savings boolean;
  v_savings_count int;
  v_savings_cov numeric;
  v_income_cov numeric := 10;
  v_pro_status text;
BEGIN
  -- Accident coverage (weight 42% — was 35%. RC vie privée removed, integrated into HOME)
  v_acc_cov := COALESCE(p_answers->>'accident_coverage_existing', '');
  v_score := v_score + (CASE v_acc_cov
    WHEN 'none' THEN 0 WHEN 'employer_only' THEN 25
    WHEN 'individual_basic' THEN 55 WHEN 'individual_complete' THEN 90 ELSE 0
  END) * 0.42;
  v_weights := v_weights + 0.42;

  -- Savings / financial protection (weight 38% — was 30%)
  v_savings := p_answers->'savings_protection';
  v_has_savings := NOT _jsonb_includes(v_savings, 'none')
    AND v_savings IS NOT NULL
    AND jsonb_typeof(v_savings) = 'array'
    AND jsonb_array_length(v_savings) > 0;
  IF v_has_savings THEN
    v_savings_count := jsonb_array_length(v_savings);
    v_savings_cov := LEAST(v_savings_count * 25, 100);
  ELSE
    v_savings_cov := 0;
  END IF;
  v_score := v_score + v_savings_cov * 0.38;
  v_weights := v_weights + 0.38;

  -- Income protection implicit (weight 20% — was 15%)
  v_pro_status := COALESCE(p_answers->>'professional_status', '');
  IF v_pro_status = 'civil_servant' THEN v_income_cov := 50;
  ELSIF v_pro_status = 'employee' THEN v_income_cov := 30;
  END IF;
  IF v_acc_cov = 'individual_complete' THEN v_income_cov := v_income_cov + 30;
  ELSIF v_acc_cov = 'individual_basic' THEN v_income_cov := v_income_cov + 15;
  END IF;
  v_score := v_score + LEAST(v_income_cov, 100) * 0.20;
  v_weights := v_weights + 0.20;

  IF v_weights > 0 THEN RETURN ROUND(v_score / v_weights); END IF;
  RETURN 0;
END;
$$;


-- ═══════════════════════════════════════════
-- 6. FUTUR EXPOSURE (new — matches computeFuturExposure in engine.ts)
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_futur_exposure(p_answers jsonb)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_score numeric := 0;
  v_savings jsonb;
  v_has_savings boolean;
  v_savings_score numeric;
  v_wic text;
BEGIN
  IF NOT _is_futur_eligible(p_answers) THEN RETURN 0; END IF;

  -- Financial dependents (weight 25%)
  v_score := v_score + (CASE COALESCE(p_answers->>'financial_dependents', '')
    WHEN 'none' THEN 10 WHEN 'partner' THEN 40 WHEN 'children' THEN 60
    WHEN 'partner_children' THEN 90 WHEN 'extended' THEN 80 ELSE 30
  END) * 0.25;

  -- Savings gap (weight 25%) — less existing coverage = more exposure
  v_savings := p_answers->'savings_protection';
  v_has_savings := NOT _jsonb_includes(v_savings, 'none')
    AND v_savings IS NOT NULL
    AND jsonb_typeof(v_savings) = 'array'
    AND jsonb_array_length(v_savings) > 0;
  IF v_has_savings THEN
    v_savings_score := GREATEST(100 - jsonb_array_length(v_savings) * 25, 10);
  ELSE
    v_savings_score := 100;
  END IF;
  v_score := v_score + v_savings_score * 0.25;

  -- Financial autonomy (weight 20%)
  v_wic := COALESCE(p_answers->>'work_incapacity_concern', '');
  v_score := v_score + (CASE
    WHEN v_wic = 'less_1_month' THEN 100
    WHEN v_wic = '1_3_months' THEN 80
    WHEN v_wic = '3_6_months' THEN 55
    WHEN v_wic = '6_12_months' THEN 30
    WHEN v_wic = 'more_12_months' THEN 10
    ELSE 50
  END) * 0.20;

  -- Income level (weight 15%)
  v_score := v_score + (CASE COALESCE(p_answers->>'income_range', '')
    WHEN 'less_3k' THEN 20 WHEN '3k_5k' THEN 40 WHEN '5k_8k' THEN 60
    WHEN '8k_12k' THEN 80 WHEN '12k_plus' THEN 100 WHEN 'no_answer' THEN 50 ELSE 50
  END) * 0.15;

  -- Age factor (weight 15%)
  v_score := v_score + (CASE COALESCE(p_answers->>'age_range', '')
    WHEN '18_25' THEN 30 WHEN '26_35' THEN 60 WHEN '36_45' THEN 90
    WHEN '46_55' THEN 100 WHEN '56_65' THEN 70 ELSE 50
  END) * 0.15;

  RETURN ROUND(v_score);
END;
$$;


-- ═══════════════════════════════════════════
-- 7. FUTUR COVERAGE (new — matches computeFuturCoverage in engine.ts)
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_futur_coverage(p_answers jsonb)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_score numeric := 0;
  v_savings jsonb;
  v_devices_cov numeric := 0;
BEGIN
  IF NOT _is_futur_eligible(p_answers) THEN RETURN 100; END IF;

  -- Existing savings/protection devices (weight 50%)
  v_savings := p_answers->'savings_protection';
  IF v_savings IS NOT NULL AND jsonb_typeof(v_savings) = 'array' THEN
    IF _jsonb_includes(v_savings, 'pension_plan') THEN v_devices_cov := v_devices_cov + 35; END IF;
    IF _jsonb_includes(v_savings, 'pension_employer') THEN v_devices_cov := v_devices_cov + 25; END IF;
    IF _jsonb_includes(v_savings, 'life_insurance') THEN v_devices_cov := v_devices_cov + 25; END IF;
    IF _jsonb_includes(v_savings, 'savings_regular') THEN v_devices_cov := v_devices_cov + 10; END IF;
    IF _jsonb_includes(v_savings, 'real_estate') THEN v_devices_cov := v_devices_cov + 15; END IF;
  END IF;
  v_score := v_score + LEAST(v_devices_cov, 100) * 0.50;

  -- Professional status protection (weight 25%)
  v_score := v_score + (CASE COALESCE(p_answers->>'professional_status', '')
    WHEN 'civil_servant' THEN 70 WHEN 'employee' THEN 50
    WHEN 'independent' THEN 15 WHEN 'business_owner' THEN 20
    WHEN 'retired' THEN 30 ELSE 20
  END) * 0.25;

  -- Income contributors (weight 15%)
  v_score := v_score + (CASE COALESCE(p_answers->>'income_contributors', '')
    WHEN 'one' THEN 20 WHEN 'two' THEN 60 WHEN 'more' THEN 80 ELSE 30
  END) * 0.15;

  -- Real estate patrimony (weight 10%)
  v_score := v_score + (CASE COALESCE(p_answers->>'other_properties', '')
    WHEN 'none' THEN 0 WHEN 'secondary' THEN 30
    WHEN 'rental' THEN 50 WHEN 'both' THEN 70 ELSE 0
  END) * 0.10;

  RETURN ROUND(v_score);
END;
$$;


-- ═══════════════════════════════════════════
-- 8. UPDATE QUADRANT SCORE ASSEMBLER (add futur)
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
      -- Futur is active only if eligible
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

  v_coverage_level := 2 - _to_matrix_level(v_coverage);
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
-- 9. UPDATE WEIGHTINGS (add futur quadrant)
-- Matches computeWeightings() in engine.ts
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_weightings(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_eligible boolean;
  v_biens int := 35;
  v_personnes int := 35;
  v_futur int;
  v_family text;
  v_pro text;
  v_total int;
BEGIN
  v_eligible := _is_futur_eligible(p_answers);
  v_futur := CASE WHEN v_eligible THEN 30 ELSE 0 END;

  v_family := COALESCE(p_answers->>'family_status', '');
  v_pro := COALESCE(p_answers->>'professional_status', '');

  -- Family with children → personnes + futur increase
  IF v_family IN ('couple_with_children', 'single_parent', 'recomposed') THEN
    v_personnes := v_personnes + 5;
    IF v_eligible THEN v_futur := v_futur + 5; v_biens := v_biens - 10;
    ELSE v_biens := v_biens - 5;
    END IF;
  END IF;

  -- Single parent → personnes is critical
  IF v_family = 'single_parent' THEN
    v_personnes := v_personnes + 5;
    v_biens := v_biens - 5;
  END IF;

  -- Independent/business owner → personnes + futur increase
  IF v_pro IN ('independent', 'business_owner') THEN
    v_personnes := v_personnes + 5;
    IF v_eligible THEN v_futur := v_futur + 5; v_biens := v_biens - 10;
    ELSE v_biens := v_biens - 5;
    END IF;
  END IF;

  -- Multiple vehicles → biens increases
  IF COALESCE((p_answers->>'vehicle_count')::int, 0) >= 2 THEN
    v_biens := v_biens + 5;
    v_personnes := v_personnes - 5;
  END IF;

  -- Retired → personnes increases
  IF v_pro = 'retired' THEN
    v_personnes := v_personnes + 5;
    v_biens := v_biens - 5;
  END IF;

  -- Mid-career (36-55) → futur increases
  IF v_eligible AND COALESCE(p_answers->>'age_range', '') IN ('36_45', '46_55') THEN
    v_futur := v_futur + 5;
    v_biens := v_biens - 5;
  END IF;

  -- Normalize to 100
  v_total := v_biens + v_personnes + v_futur;
  v_biens := ROUND(v_biens::numeric / v_total * 100);
  v_personnes := ROUND(v_personnes::numeric / v_total * 100);
  v_futur := 100 - v_biens - v_personnes;

  RETURN jsonb_build_object(
    'biens', v_biens,
    'personnes', v_personnes,
    'projets', 0,
    'futur', v_futur
  );
END;
$$;


-- ═══════════════════════════════════════════
-- 10. UPDATE MAIN FUNCTION (add futur to global score + futur rules)
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION compute_and_save_diagnostic(p_questionnaire_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_answers jsonb;
  v_biens jsonb;
  v_personnes jsonb;
  v_projets jsonb;
  v_futur jsonb;
  v_scores jsonb;
  v_weights jsonb;
  v_w_biens int;
  v_w_personnes int;
  v_w_futur int;
  v_global_score int;
  v_diag_id uuid;
  -- Answer value shortcuts
  v_detail text;
  v_cov text;
  v_acc_cov text;
  v_family text;
  v_income_contrib text;
  v_wic text;
  v_pro text;
  v_housing text;
  v_home_cov text;
  v_travel_freq text;
  v_travel_cov text;
  v_travel_budget text;
  v_residence text;
  v_age_range text;
  v_esg text;
BEGIN
  -- Auth check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify ownership and get answers
  SELECT responses INTO v_answers
  FROM questionnaire_responses
  WHERE id = p_questionnaire_id
    AND profile_id = v_user_id;

  IF v_answers IS NULL THEN
    RAISE EXCEPTION 'Questionnaire not found or access denied.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- ── Compute quadrant scores ──
  v_biens := _scoring_quadrant('biens', v_answers);
  v_personnes := _scoring_quadrant('personnes', v_answers);
  v_projets := _scoring_quadrant('projets', v_answers);
  v_futur := _scoring_quadrant('futur', v_answers);

  v_scores := jsonb_build_object(
    'biens', v_biens,
    'personnes', v_personnes,
    'projets', v_projets,
    'futur', v_futur
  );

  -- ── Compute weightings ──
  v_weights := _scoring_weightings(v_answers);
  v_w_biens := (v_weights->>'biens')::int;
  v_w_personnes := (v_weights->>'personnes')::int;
  v_w_futur := (v_weights->>'futur')::int;

  -- ── Global score (weighted average including futur) ──
  v_global_score := ROUND(
    (v_biens->>'needScore')::numeric * v_w_biens / 100 +
    (v_personnes->>'needScore')::numeric * v_w_personnes / 100 +
    (v_futur->>'needScore')::numeric * v_w_futur / 100
  );

  -- ── Insert diagnostic ──
  INSERT INTO diagnostics (questionnaire_id, profile_id, scores, global_score, weightings, scoring_version)
  VALUES (p_questionnaire_id, v_user_id, v_scores, v_global_score, v_weights, 'v1')
  RETURNING id INTO v_diag_id;

  -- ── Extract answer values for action rules ──
  v_detail := COALESCE(v_answers->>'vehicle_details', '');
  v_cov := COALESCE(v_answers->>'vehicle_coverage_existing', '');
  v_acc_cov := COALESCE(v_answers->>'accident_coverage_existing', '');
  v_family := COALESCE(v_answers->>'family_status', '');
  v_income_contrib := COALESCE(v_answers->>'income_contributors', '');
  v_wic := COALESCE(v_answers->>'work_incapacity_concern', '');
  v_pro := COALESCE(v_answers->>'professional_status', '');
  v_housing := COALESCE(v_answers->>'housing_status', '');
  v_home_cov := COALESCE(v_answers->>'home_coverage_existing', '');
  v_travel_freq := COALESCE(v_answers->>'travel_frequency', '');
  v_travel_cov := COALESCE(v_answers->>'travel_coverage_existing', '');
  v_travel_budget := COALESCE(v_answers->>'travel_budget', '');
  v_residence := COALESCE(v_answers->>'residence_status', '');
  v_age_range := COALESCE(v_answers->>'age_range', '');
  v_esg := COALESCE(v_answers->>'esg_interest', '');

  -- ═══════════════════════════════════
  -- DRIVE rules (POG: résident GDL)
  -- ═══════════════════════════════════

  IF v_residence = 'resident_gdl' AND COALESCE((v_answers->>'vehicle_count')::int, 0) > 0 THEN

    IF v_detail IN ('car_new', 'electric', 'suv_crossover') AND v_cov IN ('rc_only', 'none', 'unknown') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 5,
        'Protéger votre véhicule récent',
        'Votre véhicule représente un investissement important. Avec une couverture RC seule, un sinistre total, un vol ou un incendie ne serait pas remboursé.');
    END IF;

    IF v_acc_cov IN ('none', 'employer_only', 'individual_basic') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 5,
        'Protéger le conducteur',
        'La responsabilité civile automobile couvre les dommages causés aux tiers, mais pas vos propres blessures en cas d''accident responsable.');
    END IF;

    IF v_detail = 'electric' AND v_cov != 'full_omnium' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 4,
        'Protéger votre véhicule électrique',
        'Les réparations d''un véhicule électrique coûtent en moyenne 30% de plus, et la batterie représente une part majeure de la valeur.');
    END IF;

    IF v_cov != 'full_omnium' AND (
      COALESCE(v_answers->>'vehicle_usage', '') IN ('daily_commute', 'professional')
      OR _jsonb_includes(v_answers->'vehicle_options_interest', 'replacement_needed')
    ) THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 3,
        'Garantir votre mobilité',
        'Vous dépendez de votre véhicule au quotidien. En cas de sinistre ou de panne, le véhicule de remplacement vous garantit de rester mobile sans délai.');
    END IF;

    IF v_detail = 'car_old' AND v_cov = 'full_omnium' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'optimization', 'drive', 2,
        'Optimiser votre couverture auto',
        'Votre véhicule a plus de 8 ans. Vérifiez que le coût de votre omnium reste cohérent avec la valeur du véhicule.');
    END IF;

    IF _jsonb_includes(v_answers->'life_event', 'new_vehicle') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'drive', 4,
        'Anticiper la couverture de votre futur véhicule',
        'L''achat d''un véhicule est le moment idéal pour choisir une couverture adaptée.');
    END IF;

    IF COALESCE((v_answers->>'vehicle_count')::int, 0) >= 2 THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'drive', 3,
        'Offre multi-véhicules disponible',
        'Avec plusieurs véhicules, une offre groupée DRIVE 2+ peut vous faire bénéficier de conditions préférentielles.');
    END IF;

  END IF;


  -- ═══════════════════════════════════
  -- B-SAFE rules (POG: résident GDL)
  -- ═══════════════════════════════════

  IF v_residence = 'resident_gdl' THEN

    IF v_family IN ('couple_with_children', 'single_parent', 'recomposed')
      AND v_income_contrib = 'one'
      AND v_acc_cov IN ('none', 'employer_only')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Protéger votre famille',
        'Avec un seul revenu et des personnes à charge, un accident grave aurait des conséquences financières immédiates pour votre famille.');
    END IF;

    IF v_pro IN ('independent', 'business_owner') AND v_acc_cov IN ('none', 'employer_only') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Sécuriser votre activité',
        'En tant qu''indépendant, les prestations de la sécurité sociale ne couvrent qu''une partie de vos revenus en cas d''arrêt.');
    END IF;

    IF v_wic IN ('less_1_month', '1_3_months')
      AND COALESCE(v_answers->>'income_range', '') NOT IN ('less_3k', 'no_answer')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Sécuriser vos revenus en cas d''arrêt',
        'Avec moins de 3 mois d''autonomie financière, un arrêt prolongé suite à un accident mettrait votre foyer en difficulté.');
    END IF;

    IF _jsonb_includes_any(v_answers->'sports_activities',
        ARRAY['winter_sports','water_sports','mountain_outdoor','equestrian','motor_sports','combat_contact'])
      AND v_acc_cov IN ('none', 'employer_only')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 4,
        'Vous couvrir pour vos activités sportives',
        'Vos activités sportives vous exposent à un risque accru d''accident.');
    END IF;

    IF v_housing = 'owner_with_mortgage'
      AND v_acc_cov IN ('none', 'employer_only')
      AND NOT _jsonb_includes(v_answers->'savings_protection', 'life_insurance')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Protéger votre famille et votre logement',
        'En cas de décès suite à un accident, votre famille devrait assumer le remboursement du crédit immobilier.');
    END IF;

    IF COALESCE((v_answers->>'children_count')::int, 0) > 0
      AND v_acc_cov IN ('none', 'employer_only')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'bsafe', 4,
        'Protéger vos enfants en cas d''accident',
        'En cas d''hospitalisation suite à un accident, qui s''occupe de vos enfants ?');
    END IF;

    IF _jsonb_includes(v_answers->'life_event', 'birth') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'bsafe', 5,
        'Préparer la protection de votre famille',
        'L''arrivée d''un enfant change tout. B-Safe protège l''assuré ainsi que sa famille.');
    END IF;

    IF _jsonb_includes(v_answers->'life_event', 'retirement') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'bsafe', 4,
        'Adapter votre protection à la retraite',
        'À la retraite, la couverture prévoyance de votre employeur prend fin.');
    END IF;

  END IF;


  -- ═══════════════════════════════════
  -- HOME rules (POG: résident GDL)
  -- ═══════════════════════════════════

  IF v_residence = 'resident_gdl' THEN

    IF v_housing = 'tenant' AND v_home_cov = 'none' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 5,
        'Sécuriser votre logement',
        'En tant que locataire, une assurance habitation protège vos biens mobiliers et couvre votre responsabilité civile.');
    END IF;

    IF v_housing = 'owner_with_mortgage' AND v_home_cov IN ('none', 'unknown') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 5,
        'Protéger votre investissement immobilier',
        'Avec un crédit immobilier en cours, il est essentiel de protéger vos biens mobiliers et immobiliers.');
    END IF;

    IF _jsonb_includes_any(v_answers->'valuable_possessions', ARRAY['jewelry', 'art', 'collections'])
      AND COALESCE(v_answers->>'valuable_total_estimate', '') IN ('15k_50k', '50k_plus')
      AND v_home_cov != 'with_options'
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 4,
        'Assurer vos objets de valeur',
        'Vos objets de valeur dépassent les plafonds de la couverture habitation standard.');
    END IF;

    IF _jsonb_includes(v_answers->'security_measures', 'none')
      AND NOT _jsonb_includes(v_answers->'valuable_possessions', 'none')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 4,
        'Sécuriser et assurer vos biens de valeur',
        'Vos biens de valeur sont conservés sans dispositif de sécurité particulier.');
    END IF;

    IF _jsonb_includes(v_answers->'life_event', 'property_purchase') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'home', 5,
        'Sécuriser votre projet immobilier',
        'L''achat immobilier est le moment idéal pour mettre en place une couverture habitation complète.');
    END IF;

    IF COALESCE(v_answers->>'other_properties', '') NOT IN ('none', '') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'home', 3,
        'Assurer vos autres biens immobiliers',
        'Votre résidence secondaire ou vos biens locatifs nécessitent chacun une couverture adaptée.');
    END IF;

    IF COALESCE(v_answers->>'other_properties', '') IN ('rental', 'both') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 4,
        'Protéger vos revenus locatifs',
        'En tant que propriétaire bailleur, un impayé de loyer peut représenter plusieurs mois de manque à gagner.');
    END IF;

  END IF;


  -- ═══════════════════════════════════
  -- TRAVEL rules (POG: résident GDL + frontaliers, âge < 80)
  -- ═══════════════════════════════════

  IF (v_residence = 'resident_gdl' OR v_residence IN ('frontalier_fr', 'frontalier_be', 'frontalier_de'))
    AND v_age_range != '80_plus'
  THEN

    IF v_travel_freq IN ('several_year', 'frequent') AND v_travel_cov != 'annual' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'travel', 4,
        'Opter pour une couverture voyage annuelle',
        'Avec plusieurs voyages par an, l''assurance annuelle est plus économique et vous couvre en permanence.');
    END IF;

    IF _jsonb_includes(v_answers->'travel_destinations', 'worldwide') AND v_travel_cov = 'credit_card' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'travel', 5,
        'Renforcer votre couverture voyage hors Europe',
        'Les couvertures des cartes bancaires ont des plafonds limités. Hors Europe, les conséquences financières d''une hospitalisation peuvent être considérables.');
    END IF;

    IF v_travel_budget IN ('3k_5k', '5k_plus') AND v_travel_cov IN ('none', 'credit_card') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'travel', 4,
        'Protéger votre investissement voyage',
        'Un voyage à plus de 3 000 EUR représente un investissement important à protéger.');
    END IF;

    IF COALESCE((v_answers->>'children_count')::int, 0) > 0
      AND v_travel_freq != 'never'
      AND v_travel_cov IN ('none', 'credit_card')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'travel', 3,
        'Couvrir toute la famille en voyage',
        'Avec des enfants, les imprévus de voyage sont plus fréquents. La formule famille protège tout le monde sous un seul contrat.');
    END IF;

  END IF;


  -- ═══════════════════════════════════
  -- FUTUR rules (POG: résident GDL, < 65, actif)
  -- ═══════════════════════════════════

  IF _is_futur_eligible(v_answers) THEN

    -- Pension Plan rules
    IF v_age_range IN ('26_35', '36_45') AND NOT _jsonb_includes(v_answers->'savings_protection', 'pension_plan') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'pension_plan', 5,
        'Construire votre pension complémentaire dès maintenant',
        'Plus vous commencez tôt, plus l''effet de capitalisation est puissant. Le Pension Plan vous permet de vous constituer une épargne retraite avec un avantage fiscal de 4 500 EUR/an déductible (art. 111bis).');
    END IF;

    IF v_age_range = '46_55' AND NOT _jsonb_includes(v_answers->'savings_protection', 'pension_plan') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'pension_plan', 5,
        'Rattraper votre épargne retraite',
        'À mi-carrière, il est encore temps d''optimiser votre pension. Le Pension Plan vous offre un avantage fiscal immédiat de 4 500 EUR/an déductible (art. 111bis).');
    END IF;

    IF v_age_range = '56_65' AND NOT _jsonb_includes(v_answers->'savings_protection', 'pension_plan') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'pension_plan', 4,
        'Optimiser votre fiscalité avant la retraite',
        'Même à l''approche de la retraite, le Pension Plan reste avantageux grâce à la déduction fiscale de 4 500 EUR/an (art. 111bis).');
    END IF;

    IF COALESCE(v_answers->>'income_range', '') IN ('8k_12k', '12k_plus')
      AND NOT _jsonb_includes(v_answers->'savings_protection', 'pension_plan')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'pension_plan', 5,
        'Maximiser votre avantage fiscal',
        'Avec vos revenus, la déduction de 4 500 EUR/an du Pension Plan (art. 111bis) a un impact fiscal maximal.');
    END IF;

    IF v_pro IN ('independent', 'business_owner')
      AND NOT _jsonb_includes(v_answers->'savings_protection', 'pension_plan')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'pension_plan', 5,
        'Sécuriser votre retraite d''indépendant',
        'En tant qu''indépendant, votre pension légale sera probablement insuffisante. Le Pension Plan (art. 111bis) est le pilier essentiel de votre stratégie retraite.');
    END IF;

    -- Life Plan rules
    IF COALESCE(v_answers->>'financial_dependents', '') != 'none'
      AND NOT _jsonb_includes(v_answers->'savings_protection', 'life_insurance')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'life_plan', 4,
        'Protéger votre famille avec une assurance-vie',
        'Des personnes dépendent financièrement de vous. Le Life Plan combine épargne et capital décès pour protéger vos proches.');
    END IF;

    IF v_housing = 'owner_with_mortgage'
      AND NOT _jsonb_includes(v_answers->'savings_protection', 'life_insurance')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'life_plan', 4,
        'Sécuriser votre crédit immobilier',
        'En cas de décès, votre famille devrait assumer seule le remboursement du crédit. Le Life Plan sécurise votre prêt.');
    END IF;

    IF v_family = 'single_parent'
      AND NOT _jsonb_includes(v_answers->'savings_protection', 'life_insurance')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'life_plan', 5,
        'Protéger vos enfants en tant que parent seul',
        'En tant que parent seul, vous êtes le pilier financier unique de vos enfants. Le Life Plan garantit un capital à vos proches.');
    END IF;

    -- Switch Plan rules
    IF v_esg = 'yes' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'switch_plan', 4,
        'Investir selon vos convictions',
        'Le Switch Plan investit 100% dans des fonds durables certifiés ESG/ISR. Votre épargne contribue à un impact environnemental et social positif.');
    END IF;

    IF v_esg = 'neutral' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'switch_plan', 3,
        'Découvrir l''épargne durable',
        'Le Switch Plan permet d''investir dans des fonds durables certifiés avec des performances comparables aux fonds traditionnels.');
    END IF;

  END IF;


  -- ── Mark questionnaire as completed ──
  UPDATE questionnaire_responses
  SET completed = true
  WHERE id = p_questionnaire_id
    AND profile_id = v_user_id;

  RETURN v_diag_id;
END;
$$;

GRANT EXECUTE ON FUNCTION compute_and_save_diagnostic(uuid) TO authenticated;


-- ═══════════════════════════════════
-- 11. DATA RETENTION HELPER (MAJ-04)
-- Purge abandoned questionnaires older than 12 months
-- To be called via scheduled CRON or manually
-- ═══════════════════════════════════

CREATE OR REPLACE FUNCTION purge_abandoned_questionnaires(p_months_old int DEFAULT 12)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  DELETE FROM questionnaire_responses
  WHERE completed = false
    AND created_at < NOW() - (p_months_old || ' months')::interval;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION purge_abandoned_questionnaires IS
  'Data retention: removes incomplete questionnaires older than N months (default 12). Call via pg_cron or manually.';


-- ═══════════════════════════════════
-- 12. KEEP-ALIVE QUERY
-- Prevents Supabase project pause due to inactivity
-- ═══════════════════════════════════

-- This SELECT ensures the project has recent activity
SELECT COUNT(*) FROM profiles LIMIT 1;
