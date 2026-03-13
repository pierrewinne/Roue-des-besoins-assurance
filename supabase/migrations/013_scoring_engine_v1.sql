-- ════════════════════════════════════════════════════════════
-- Migration 013: Scoring engine V1 rewrite (CRIT-1)
--
-- Replaces old scoring functions (auto/habitation/prevoyance/objets_valeur)
-- with V1-aligned functions (biens/personnes + inactive projets/futur).
-- Matches the TypeScript engine in frontend/src/shared/scoring/engine.ts.
-- ════════════════════════════════════════════════════════════


-- ═══════════════════════════════
-- Drop old scoring functions
-- ═══════════════════════════════

DROP FUNCTION IF EXISTS _scoring_auto(jsonb);
DROP FUNCTION IF EXISTS _scoring_habitation(jsonb);
DROP FUNCTION IF EXISTS _scoring_prevoyance(jsonb);
DROP FUNCTION IF EXISTS _scoring_objets_valeur(jsonb);


-- ═══════════════════════════════
-- JSONB array helpers
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION _jsonb_count_non_none(p_val jsonb)
RETURNS int
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_val IS NULL OR jsonb_typeof(p_val) != 'array' THEN 0
    ELSE (SELECT COUNT(*)::int FROM jsonb_array_elements_text(p_val) elem WHERE elem != 'none')
  END;
$$;

CREATE OR REPLACE FUNCTION _jsonb_includes(p_val jsonb, p_item text)
RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$
  SELECT p_val IS NOT NULL AND jsonb_typeof(p_val) = 'array' AND p_val ? p_item;
$$;

CREATE OR REPLACE FUNCTION _jsonb_includes_any(p_val jsonb, p_items text[])
RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$
  SELECT p_val IS NOT NULL AND jsonb_typeof(p_val) = 'array' AND p_val ?| p_items;
$$;


-- ═══════════════════════════════
-- Score level converter (0-100 → 0/1/2)
-- Matches toMatrixLevel() in engine.ts
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION _to_matrix_level(p_score int)
RETURNS int
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_score <= 33 THEN 0
    WHEN p_score <= 66 THEN 1
    ELSE 2
  END;
$$;


-- ═══════════════════════════════
-- Biens (DRIVE) — Exposure
-- Matches computeBiensExposure() in engine.ts
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_biens_exposure(p_answers jsonb)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_vehicle_count int;
  v_score numeric := 0;
  v_weights numeric := 0;
  v_detail text;
  v_usage text;
  v_unmet int;
BEGIN
  v_vehicle_count := COALESCE((p_answers->>'vehicle_count')::int, 0);
  IF v_vehicle_count = 0 THEN RETURN 0; END IF;

  -- Vehicle count (weight 20%)
  v_score := v_score + LEAST(v_vehicle_count * 40, 100) * 0.20;
  v_weights := v_weights + 0.20;

  -- Vehicle type / value at risk (weight 30%)
  v_detail := COALESCE(p_answers->>'vehicle_details', '');
  v_score := v_score + (CASE v_detail
    WHEN 'car_new' THEN 90 WHEN 'electric' THEN 95 WHEN 'suv_crossover' THEN 85
    WHEN 'car_recent' THEN 60 WHEN 'moto' THEN 70 WHEN 'utility' THEN 50
    WHEN 'car_old' THEN 25 WHEN 'scooter' THEN 30 ELSE 50
  END) * 0.30;
  v_weights := v_weights + 0.30;

  -- Vehicle usage intensity (weight 25%)
  v_usage := COALESCE(p_answers->>'vehicle_usage', '');
  v_score := v_score + (CASE v_usage
    WHEN 'daily_commute' THEN 70 WHEN 'professional' THEN 90
    WHEN 'mixed' THEN 75 WHEN 'occasional' THEN 30 ELSE 50
  END) * 0.25;
  v_weights := v_weights + 0.25;

  -- Unmet options needs (weight 15%)
  v_unmet := _jsonb_count_non_none(p_answers->'vehicle_options_interest');
  v_score := v_score + LEAST(v_unmet * 20, 100) * 0.15;
  v_weights := v_weights + 0.15;

  -- Life event: new vehicle (weight 10%)
  IF _jsonb_includes(p_answers->'life_event', 'new_vehicle') THEN
    v_score := v_score + 100 * 0.10;
  END IF;
  v_weights := v_weights + 0.10;

  IF v_weights > 0 THEN RETURN ROUND(v_score / v_weights); END IF;
  RETURN 50;
END;
$$;


-- ═══════════════════════════════
-- Biens (DRIVE) — Coverage
-- Matches computeBiensCoverage() in engine.ts
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_biens_coverage(p_answers jsonb)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_vehicle_count int;
  v_score numeric := 0;
  v_weights numeric := 0;
  v_cov text;
  v_cov_score int;
  v_options_cov numeric;
  v_unmet int;
BEGIN
  v_vehicle_count := COALESCE((p_answers->>'vehicle_count')::int, 0);
  IF v_vehicle_count = 0 THEN RETURN 100; END IF;

  -- Vehicle insurance level (weight 60%)
  v_cov := COALESCE(p_answers->>'vehicle_coverage_existing', '');
  v_cov_score := CASE v_cov
    WHEN 'none' THEN 0 WHEN 'unknown' THEN 10 WHEN 'rc_only' THEN 25
    WHEN 'mini_omnium' THEN 55 WHEN 'full_omnium' THEN 90 ELSE 10
  END;
  v_score := v_score + v_cov_score * 0.60;
  v_weights := v_weights + 0.60;

  -- Options coverage gap (weight 40%)
  v_options_cov := CASE v_cov
    WHEN 'full_omnium' THEN 70 WHEN 'mini_omnium' THEN 40 WHEN 'rc_only' THEN 15 ELSE 0
  END;
  v_unmet := _jsonb_count_non_none(p_answers->'vehicle_options_interest');
  v_options_cov := GREATEST(v_options_cov - v_unmet * 12, 0);
  v_score := v_score + v_options_cov * 0.40;
  v_weights := v_weights + 0.40;

  IF v_weights > 0 THEN RETURN ROUND(v_score / v_weights); END IF;
  RETURN 0;
END;
$$;


-- ═══════════════════════════════
-- Personnes (B-SAFE) — Exposure
-- Matches computePersonnesExposure() in engine.ts
-- ═══════════════════════════════

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

  -- Family vulnerability (weight 25%)
  IF v_family IN ('couple_with_children', 'single_parent', 'recomposed') THEN
    v_family_score := 70;
  END IF;
  IF COALESCE(p_answers->>'income_contributors', '') = 'one' AND v_family_score >= 70 THEN
    v_family_score := 100;
  END IF;
  v_score := v_score + v_family_score * 0.25;
  v_weights := v_weights + 0.25;

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

  -- Sports risk (weight 15%)
  IF p_answers->'sports_activities' IS NOT NULL AND jsonb_typeof(p_answers->'sports_activities') = 'array' THEN
    FOR v_elem IN SELECT jsonb_array_elements_text(p_answers->'sports_activities') LOOP
      IF v_elem = ANY(v_high_risk) THEN v_sports_score := v_sports_score + 25; END IF;
      IF v_elem IN ('running_cycling', 'team_sports') THEN v_sports_score := v_sports_score + 10; END IF;
    END LOOP;
  END IF;
  v_score := v_score + LEAST(v_sports_score, 100) * 0.15;
  v_weights := v_weights + 0.15;

  -- Health concerns (weight 10%)
  v_score := v_score + LEAST(_jsonb_count_non_none(p_answers->'health_concerns') * 30, 100) * 0.10;
  v_weights := v_weights + 0.10;

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


-- ═══════════════════════════════
-- Personnes (B-SAFE) — Coverage
-- Matches computePersonnesCoverage() in engine.ts
-- ═══════════════════════════════

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
  -- Accident coverage (weight 35%)
  v_acc_cov := COALESCE(p_answers->>'accident_coverage_existing', '');
  v_score := v_score + (CASE v_acc_cov
    WHEN 'none' THEN 0 WHEN 'employer_only' THEN 25
    WHEN 'individual_basic' THEN 55 WHEN 'individual_complete' THEN 90 ELSE 0
  END) * 0.35;
  v_weights := v_weights + 0.35;

  -- RC Vie Privée (weight 20%)
  v_score := v_score + (CASE COALESCE(p_answers->>'has_rc_vie_privee', '')
    WHEN 'yes' THEN 90 WHEN 'no' THEN 0 WHEN 'unsure' THEN 0 ELSE 0
  END) * 0.20;
  v_weights := v_weights + 0.20;

  -- Savings / financial protection (weight 30%)
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
  v_score := v_score + v_savings_cov * 0.30;
  v_weights := v_weights + 0.30;

  -- Income protection implicit (weight 15%)
  v_pro_status := COALESCE(p_answers->>'professional_status', '');
  IF v_pro_status = 'civil_servant' THEN v_income_cov := 50;
  ELSIF v_pro_status = 'employee' THEN v_income_cov := 30;
  END IF;
  IF v_acc_cov = 'individual_complete' THEN v_income_cov := v_income_cov + 30;
  ELSIF v_acc_cov = 'individual_basic' THEN v_income_cov := v_income_cov + 15;
  END IF;
  v_score := v_score + LEAST(v_income_cov, 100) * 0.15;
  v_weights := v_weights + 0.15;

  IF v_weights > 0 THEN RETURN ROUND(v_score / v_weights); END IF;
  RETURN 0;
END;
$$;


-- ═══════════════════════════════
-- Quadrant score assembler
-- ═══════════════════════════════

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
    ELSE
      -- projets and futur are inactive
      RETURN jsonb_build_object(
        'quadrant', p_quadrant,
        'exposure', 0, 'coverage', 100,
        'needScore', 0, 'needLevel', 'low', 'active', false
      );
  END CASE;

  -- Convert 0-100 scores to matrix levels (matches toMatrixLevel in engine.ts)
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


-- ═══════════════════════════════
-- Weightings
-- Matches computeWeightings() in engine.ts
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_weightings(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_biens int := 50;
  v_personnes int := 50;
  v_family text;
  v_pro text;
  v_total int;
BEGIN
  v_family := COALESCE(p_answers->>'family_status', '');
  v_pro := COALESCE(p_answers->>'professional_status', '');

  -- Family with children → personnes increases
  IF v_family IN ('couple_with_children', 'single_parent', 'recomposed') THEN
    v_personnes := v_personnes + 10;
    v_biens := v_biens - 10;
  END IF;

  -- Single parent → personnes is critical
  IF v_family = 'single_parent' THEN
    v_personnes := v_personnes + 5;
    v_biens := v_biens - 5;
  END IF;

  -- Independent/business owner → personnes increases
  IF v_pro IN ('independent', 'business_owner') THEN
    v_personnes := v_personnes + 10;
    v_biens := v_biens - 10;
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

  -- Normalize to 100
  v_total := v_biens + v_personnes;
  v_biens := ROUND(v_biens::numeric / v_total * 100);
  v_personnes := 100 - v_biens;

  RETURN jsonb_build_object(
    'biens', v_biens,
    'personnes', v_personnes,
    'projets', 0,
    'futur', 0
  );
END;
$$;


-- ═══════════════════════════════
-- Main function: compute and save diagnostic (V1)
-- Replaces the old version from migration 010
-- ═══════════════════════════════

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
  v_global_score int;
  v_diag_id uuid;
  -- Action rule variables
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

  -- ── Global score (weighted average) ──
  v_global_score := ROUND(
    (v_biens->>'needScore')::numeric * v_w_biens / 100 +
    (v_personnes->>'needScore')::numeric * v_w_personnes / 100
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

  -- ═══════════════════════════════════
  -- DRIVE rules (POG: résident GDL)
  -- ═══════════════════════════════════

  IF v_residence = 'resident_gdl' AND COALESCE((v_answers->>'vehicle_count')::int, 0) > 0 THEN

    -- drive_01: Recent vehicle without omnium
    IF v_detail IN ('car_new', 'electric', 'suv_crossover') AND v_cov IN ('rc_only', 'none', 'unknown') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 5,
        'Protéger votre véhicule récent',
        'Votre véhicule représente un investissement important. Avec une couverture RC seule, un sinistre total, un vol ou un incendie ne serait pas remboursé.');
    END IF;

    -- drive_09: Conducteur protégé (no accident coverage)
    IF v_acc_cov IN ('none', 'employer_only', 'individual_basic') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 5,
        'Protéger le conducteur',
        'La responsabilité civile automobile couvre les dommages causés aux tiers, mais pas vos propres blessures en cas d''accident responsable.');
    END IF;

    -- drive_03: Electric vehicle without full omnium
    IF v_detail = 'electric' AND v_cov != 'full_omnium' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 4,
        'Protéger votre véhicule électrique',
        'Les réparations d''un véhicule électrique coûtent en moyenne 30% de plus, et la batterie représente une part majeure de la valeur.');
    END IF;

    -- drive_04: Mobility need (daily/professional usage)
    IF v_cov != 'full_omnium' AND (
      COALESCE(v_answers->>'vehicle_usage', '') IN ('daily_commute', 'professional')
      OR _jsonb_includes(v_answers->'vehicle_options_interest', 'replacement_needed')
    ) THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'drive', 3,
        'Garantir votre mobilité',
        'Vous dépendez de votre véhicule au quotidien. En cas de sinistre ou de panne, le véhicule de remplacement vous garantit de rester mobile sans délai.');
    END IF;

    -- drive_02: Old vehicle with full omnium → optimize
    IF v_detail = 'car_old' AND v_cov = 'full_omnium' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'optimization', 'drive', 2,
        'Optimiser votre couverture auto',
        'Votre véhicule a plus de 8 ans. Vérifiez que le coût de votre omnium reste cohérent avec la valeur du véhicule.');
    END IF;

    -- drive_08: New vehicle event
    IF _jsonb_includes(v_answers->'life_event', 'new_vehicle') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'drive', 4,
        'Anticiper la couverture de votre futur véhicule',
        'L''achat d''un véhicule est le moment idéal pour choisir une couverture adaptée.');
    END IF;

    -- drive_10: Multi-vehicle
    IF COALESCE((v_answers->>'vehicle_count')::int, 0) >= 2 THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'drive', 3,
        'Offre multi-véhicules disponible',
        'Avec plusieurs véhicules, une offre groupée DRIVE 2+ peut vous faire bénéficier de conditions préférentielles.');
    END IF;

  END IF; -- end DRIVE rules


  -- ═══════════════════════════════════
  -- B-SAFE rules (POG: résident GDL)
  -- ═══════════════════════════════════

  IF v_residence = 'resident_gdl' THEN

    -- bsafe_01: Family with single income, no coverage
    IF v_family IN ('couple_with_children', 'single_parent', 'recomposed')
      AND v_income_contrib = 'one'
      AND v_acc_cov IN ('none', 'employer_only')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Protéger votre famille',
        'Avec un seul revenu et des personnes à charge, un accident grave aurait des conséquences financières immédiates pour votre famille.');
    END IF;

    -- bsafe_02: Independent without coverage
    IF v_pro IN ('independent', 'business_owner') AND v_acc_cov IN ('none', 'employer_only') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Sécuriser votre activité',
        'En tant qu''indépendant, les prestations de la sécurité sociale ne couvrent qu''une partie de vos revenus en cas d''arrêt.');
    END IF;

    -- bsafe_03: Low financial autonomy
    IF v_wic IN ('less_1_month', '1_3_months')
      AND COALESCE(v_answers->>'income_range', '') NOT IN ('less_3k', 'no_answer')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Sécuriser vos revenus en cas d''arrêt',
        'Avec moins de 3 mois d''autonomie financière, un arrêt prolongé suite à un accident mettrait votre foyer en difficulté.');
    END IF;

    -- bsafe_04: High-risk sports without coverage
    IF _jsonb_includes_any(v_answers->'sports_activities',
        ARRAY['winter_sports','water_sports','mountain_outdoor','equestrian','motor_sports','combat_contact'])
      AND v_acc_cov IN ('none', 'employer_only')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 4,
        'Vous couvrir pour vos activités sportives',
        'Vos activités sportives vous exposent à un risque accru d''accident.');
    END IF;

    -- bsafe_07: Mortgage without death cover
    IF v_housing = 'owner_with_mortgage'
      AND v_acc_cov IN ('none', 'employer_only')
      AND NOT _jsonb_includes(v_answers->'savings_protection', 'life_insurance')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'bsafe', 5,
        'Protéger votre famille et votre logement',
        'En cas de décès suite à un accident, votre famille devrait assumer le remboursement du crédit immobilier.');
    END IF;

    -- bsafe_05: Children without coverage
    IF COALESCE((v_answers->>'children_count')::int, 0) > 0
      AND v_acc_cov IN ('none', 'employer_only')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'bsafe', 4,
        'Protéger vos enfants en cas d''accident',
        'En cas d''hospitalisation suite à un accident, qui s''occupe de vos enfants ?');
    END IF;

    -- bsafe_10: Birth event
    IF _jsonb_includes(v_answers->'life_event', 'birth') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'bsafe', 5,
        'Préparer la protection de votre famille',
        'L''arrivée d''un enfant change tout. B-Safe protège l''assuré ainsi que sa famille.');
    END IF;

    -- bsafe_11: Retirement event
    IF _jsonb_includes(v_answers->'life_event', 'retirement') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'bsafe', 4,
        'Adapter votre protection à la retraite',
        'À la retraite, la couverture prévoyance de votre employeur prend fin.');
    END IF;

  END IF; -- end B-SAFE rules


  -- ═══════════════════════════════════
  -- HOME rules (POG: résident GDL)
  -- ═══════════════════════════════════

  IF v_residence = 'resident_gdl' THEN

    -- home_01: Tenant with no coverage
    IF v_housing = 'tenant' AND v_home_cov = 'none' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 5,
        'Sécuriser votre logement',
        'En tant que locataire, une assurance habitation protège vos biens mobiliers et couvre votre responsabilité civile.');
    END IF;

    -- home_02: Owner with mortgage, no coverage
    IF v_housing = 'owner_with_mortgage' AND v_home_cov IN ('none', 'unknown') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 5,
        'Protéger votre investissement immobilier',
        'Avec un crédit immobilier en cours, il est essentiel de protéger vos biens mobiliers et immobiliers.');
    END IF;

    -- home_08: High-value items without options
    IF _jsonb_includes_any(v_answers->'valuable_possessions', ARRAY['jewelry', 'art', 'collections'])
      AND COALESCE(v_answers->>'valuable_total_estimate', '') IN ('15k_50k', '50k_plus')
      AND v_home_cov != 'with_options'
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 4,
        'Assurer vos objets de valeur',
        'Vos objets de valeur dépassent les plafonds de la couverture habitation standard.');
    END IF;

    -- home_10: RC Vie Privée missing with children or sports
    IF COALESCE(v_answers->>'has_rc_vie_privee', '') IN ('no', 'unsure')
      AND (
        COALESCE((v_answers->>'children_count')::int, 0) > 0
        OR (_jsonb_count_non_none(v_answers->'sports_activities') > 0)
      )
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 4,
        'Vous protéger en responsabilité civile vie privée',
        'La RC vie privée vous protège contre les dommages involontairement causés à des tiers.');
    END IF;

    -- home_11: No security measures with valuables
    IF _jsonb_includes(v_answers->'security_measures', 'none')
      AND NOT _jsonb_includes(v_answers->'valuable_possessions', 'none')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 4,
        'Sécuriser et assurer vos biens de valeur',
        'Vos biens de valeur sont conservés sans dispositif de sécurité particulier.');
    END IF;

    -- home_13: Property purchase event
    IF _jsonb_includes(v_answers->'life_event', 'property_purchase') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'event', 'home', 5,
        'Sécuriser votre projet immobilier',
        'L''achat immobilier est le moment idéal pour mettre en place une couverture habitation complète.');
    END IF;

    -- home_15: Other properties
    IF COALESCE(v_answers->>'other_properties', '') NOT IN ('none', '') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'home', 3,
        'Assurer vos autres biens immobiliers',
        'Votre résidence secondaire ou vos biens locatifs nécessitent chacun une couverture adaptée.');
    END IF;

    -- home_16: Rental properties → loyers impayés
    IF COALESCE(v_answers->>'other_properties', '') IN ('rental', 'both') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'home', 4,
        'Protéger vos revenus locatifs',
        'En tant que propriétaire bailleur, un impayé de loyer peut représenter plusieurs mois de manque à gagner.');
    END IF;

  END IF; -- end HOME rules


  -- ═══════════════════════════════════
  -- TRAVEL rules (POG: résident GDL + frontaliers, âge < 80)
  -- ═══════════════════════════════════

  IF (v_residence = 'resident_gdl' OR v_residence IN ('frontalier_fr', 'frontalier_be', 'frontalier_de'))
    AND COALESCE(v_answers->>'age_range', '') != '80_plus'
  THEN

    -- travel_01: Frequent traveler without annual
    IF v_travel_freq IN ('several_year', 'frequent') AND v_travel_cov != 'annual' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'travel', 4,
        'Opter pour une couverture voyage annuelle',
        'Avec plusieurs voyages par an, l''assurance annuelle est plus économique et vous couvre en permanence.');
    END IF;

    -- travel_02: Worldwide with credit card only
    IF _jsonb_includes(v_answers->'travel_destinations', 'worldwide') AND v_travel_cov = 'credit_card' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'travel', 5,
        'Renforcer votre couverture voyage hors Europe',
        'Les couvertures des cartes bancaires ont des plafonds limités. Hors Europe, les conséquences financières d''une hospitalisation peuvent être considérables.');
    END IF;

    -- travel_03: High budget without coverage
    IF v_travel_budget IN ('3k_5k', '5k_plus') AND v_travel_cov IN ('none', 'credit_card') THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'travel', 4,
        'Protéger votre investissement voyage',
        'Un voyage à plus de 3 000 EUR représente un investissement important à protéger.');
    END IF;

    -- travel_05: Family travel without coverage
    IF COALESCE((v_answers->>'children_count')::int, 0) > 0
      AND v_travel_freq != 'never'
      AND v_travel_cov IN ('none', 'credit_card')
    THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'travel', 3,
        'Couvrir toute la famille en voyage',
        'Avec des enfants, les imprévus de voyage sont plus fréquents. La formule famille protège tout le monde sous un seul contrat.');
    END IF;

  END IF; -- end TRAVEL rules


  -- ── Mark questionnaire as completed ──
  UPDATE questionnaire_responses
  SET completed = true
  WHERE id = p_questionnaire_id
    AND profile_id = v_user_id;

  RETURN v_diag_id;
END;
$$;

GRANT EXECUTE ON FUNCTION compute_and_save_diagnostic(uuid) TO authenticated;
