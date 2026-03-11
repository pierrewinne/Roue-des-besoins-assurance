-- ============================================================
-- Migration 010: Server-side scoring engine (SEC-01)
-- Roue des Besoins Assurance — Luxembourg
--
-- Ports the TypeScript scoring engine to PL/pgSQL so that
-- diagnostic scores are computed server-side and cannot be
-- manipulated by the client. The frontend preview still uses
-- the TypeScript engine for display, but the final diagnostic
-- is computed and saved by this function.
--
-- Also fixes SEC-07: delete_my_data() now deletes auth.users.
-- ============================================================


-- ════════════════════════════════════════
-- Helper: need level from score
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_need_level(p_score int)
RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF p_score <= 25 THEN RETURN 'low';
  ELSIF p_score <= 50 THEN RETURN 'moderate';
  ELSIF p_score <= 75 THEN RETURN 'high';
  ELSE RETURN 'critical';
  END IF;
END;
$$;


-- ════════════════════════════════════════
-- Helper: exposure x coverage matrix → need score
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_need_matrix(p_exposure int, p_coverage int)
RETURNS int
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_matrix int[][] := ARRAY[
    ARRAY[10, 35, 40],   -- low exposure
    ARRAY[15, 60, 85],   -- medium exposure
    ARRAY[35, 85, 95]    -- high exposure
  ];
  v_row int;
  v_col int;
BEGIN
  v_row := LEAST(GREATEST(p_exposure, 0), 2) + 1;  -- 1-indexed
  v_col := LEAST(GREATEST(p_coverage, 0), 2) + 1;
  RETURN v_matrix[v_row][v_col];
END;
$$;


-- ════════════════════════════════════════
-- Auto universe scoring
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_auto(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_vehicle_count int;
  v_exposure numeric := 1;
  v_coverage numeric := 2;
  v_vehicle_age int;
  v_need_score int;
BEGIN
  v_vehicle_count := COALESCE((p_answers->>'vehicleCount')::int, 0);
  IF v_vehicle_count = 0 THEN
    RETURN jsonb_build_object(
      'universe','auto','exposure',0,'coverage',0,
      'needScore',0,'needLevel','low','active',false
    );
  END IF;

  -- Exposure
  v_vehicle_age := (p_answers->>'vehicleAge')::int;
  IF v_vehicle_age IS NOT NULL AND v_vehicle_age < 3 THEN
    v_exposure := 2;
  END IF;

  IF (p_answers->>'vehicleType') IN ('utility', 'moto') THEN
    v_exposure := 2;
  END IF;

  IF (p_answers->>'vehicleUsage') = 'daily' THEN
    v_exposure := LEAST(v_exposure + 0.5, 2);
  END IF;

  -- Coverage
  IF (p_answers->>'autoCoverage') = 'omnium' THEN
    v_coverage := 0;
  ELSIF (p_answers->>'autoCoverage') = 'rc' THEN
    v_coverage := 1;
  END IF;

  v_need_score := _scoring_need_matrix(ROUND(v_exposure)::int, ROUND(v_coverage)::int);
  RETURN jsonb_build_object(
    'universe', 'auto',
    'exposure', v_exposure / 2.0 * 100,
    'coverage', (2 - v_coverage) / 2.0 * 100,
    'needScore', v_need_score,
    'needLevel', _scoring_need_level(v_need_score),
    'active', true
  );
END;
$$;


-- ════════════════════════════════════════
-- Habitation universe scoring
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_habitation(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_exposure numeric := 1;
  v_coverage numeric := 2;
  v_is_owner boolean;
  v_has_mortgage boolean;
  v_hab_cov text;
  v_need_score int;
BEGIN
  v_is_owner := (p_answers->>'isOwner')::boolean;
  v_has_mortgage := (p_answers->>'hasMortgage')::boolean;

  -- Exposure
  IF v_is_owner IS TRUE AND v_has_mortgage IS TRUE THEN
    v_exposure := 2;
  END IF;
  IF v_is_owner IS TRUE THEN
    v_exposure := GREATEST(v_exposure, 1.5);
  END IF;
  IF (p_answers->>'hasOtherProperties')::boolean IS TRUE THEN
    v_exposure := 2;
  END IF;
  IF (p_answers->>'lifeEvent') IN ('property', 'move') THEN
    v_exposure := 2;
  END IF;

  -- Coverage
  v_hab_cov := p_answers->>'habitationCoverage';
  IF v_hab_cov = 'complete' THEN v_coverage := 0;
  ELSIF v_hab_cov = 'standard' THEN v_coverage := 0.5;
  ELSIF v_hab_cov = 'basic' THEN v_coverage := 1;
  END IF;

  v_need_score := _scoring_need_matrix(ROUND(v_exposure)::int, ROUND(v_coverage)::int);
  RETURN jsonb_build_object(
    'universe', 'habitation',
    'exposure', v_exposure / 2.0 * 100,
    'coverage', (2 - v_coverage) / 2.0 * 100,
    'needScore', v_need_score,
    'needLevel', _scoring_need_level(v_need_score),
    'active', true
  );
END;
$$;


-- ════════════════════════════════════════
-- Prevoyance universe scoring
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_prevoyance(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_exposure numeric := 1;
  v_coverage numeric := 2;
  v_family text;
  v_age text;
  v_life_event text;
  v_prev_cov text;
  v_need_score int;
BEGIN
  v_family := p_answers->>'familyStatus';
  v_age := p_answers->>'ageRange';
  v_life_event := p_answers->>'lifeEvent';

  -- Exposure
  IF v_family = 'family' THEN v_exposure := 2;
  ELSIF v_family = 'couple' THEN v_exposure := 1.5;
  END IF;

  IF (p_answers->>'professionalStatus') = 'independent' THEN
    v_exposure := LEAST(v_exposure + 0.5, 2);
  END IF;

  IF (p_answers->>'hasMortgage')::boolean IS TRUE THEN
    v_exposure := LEAST(v_exposure + 0.5, 2);
  END IF;

  IF v_age IN ('30-40', '40-50') AND v_family = 'family' THEN
    v_exposure := 2;
  END IF;

  IF v_life_event IN ('birth', 'marriage') THEN
    v_exposure := LEAST(v_exposure + 0.5, 2);
  END IF;

  IF (p_answers->>'incomeRange') = 'less-2k' THEN
    v_exposure := LEAST(v_exposure + 0.5, 2);
  END IF;

  -- Coverage
  v_prev_cov := p_answers->>'prevoyanceCoverage';
  IF v_prev_cov = 'complete' THEN v_coverage := 0;
  ELSIF v_prev_cov = 'standard' THEN v_coverage := 0.5;
  ELSIF v_prev_cov = 'basic' THEN v_coverage := 1;
  END IF;

  v_need_score := _scoring_need_matrix(ROUND(v_exposure)::int, ROUND(v_coverage)::int);
  RETURN jsonb_build_object(
    'universe', 'prevoyance',
    'exposure', v_exposure / 2.0 * 100,
    'coverage', (2 - v_coverage) / 2.0 * 100,
    'needScore', v_need_score,
    'needLevel', _scoring_need_level(v_need_score),
    'active', true
  );
END;
$$;


-- ════════════════════════════════════════
-- Objets de valeur universe scoring
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION _scoring_objets_valeur(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_exposure numeric := 1;
  v_coverage numeric := 2;
  v_amount text;
  v_val_cov text;
  v_need_score int;
BEGIN
  IF (p_answers->>'hasValuables')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'universe','objets_valeur','exposure',0,'coverage',0,
      'needScore',0,'needLevel','low','active',false
    );
  END IF;

  -- Exposure
  v_amount := p_answers->>'valuablesAmount';
  IF v_amount IN ('50k+', '10k-50k') THEN v_exposure := 2;
  ELSIF v_amount = '5k-10k' THEN v_exposure := 1;
  END IF;

  IF (p_answers->>'valuablesStorage') = 'home_no_security' THEN
    v_exposure := LEAST(v_exposure + 0.5, 2);
  END IF;

  -- Coverage
  v_val_cov := p_answers->>'valuablesCoverage';
  IF v_val_cov = 'complete' THEN v_coverage := 0;
  ELSIF v_val_cov = 'basic' THEN v_coverage := 1;
  END IF;

  v_need_score := _scoring_need_matrix(ROUND(v_exposure)::int, ROUND(v_coverage)::int);
  RETURN jsonb_build_object(
    'universe', 'objets_valeur',
    'exposure', v_exposure / 2.0 * 100,
    'coverage', (2 - v_coverage) / 2.0 * 100,
    'needScore', v_need_score,
    'needLevel', _scoring_need_level(v_need_score),
    'active', true
  );
END;
$$;


-- ════════════════════════════════════════
-- Main function: compute and save diagnostic
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION compute_and_save_diagnostic(p_questionnaire_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_answers jsonb;
  v_auto jsonb;
  v_hab jsonb;
  v_prev jsonb;
  v_obj jsonb;
  v_scores jsonb;
  v_weights jsonb;
  v_w_auto numeric := 25;
  v_w_hab numeric := 30;
  v_w_prev numeric := 35;
  v_w_obj numeric := 10;
  v_total numeric;
  v_global_score int;
  v_diag_id uuid;
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

  -- ── Compute universe scores ──
  v_auto := _scoring_auto(v_answers);
  v_hab  := _scoring_habitation(v_answers);
  v_prev := _scoring_prevoyance(v_answers);
  v_obj  := _scoring_objets_valeur(v_answers);

  v_scores := jsonb_build_object(
    'auto', v_auto,
    'habitation', v_hab,
    'prevoyance', v_prev,
    'objets_valeur', v_obj
  );

  -- ── Compute weightings ──
  IF (v_auto->>'active')::boolean IS NOT TRUE THEN v_w_auto := 0; END IF;
  IF (v_obj->>'active')::boolean IS NOT TRUE THEN v_w_obj := 0; END IF;

  -- Profile adjustments
  IF (v_answers->>'isOwner')::boolean IS TRUE AND (v_answers->>'hasMortgage')::boolean IS TRUE THEN
    v_w_hab := 35;
  END IF;
  IF (v_answers->>'familyStatus') = 'family' THEN
    v_w_prev := 40;
  END IF;
  IF (v_answers->>'incomeRange') IN ('6k-10k', '10k+') THEN
    v_w_obj := 15;
  END IF;

  -- Normalize to 100
  v_total := v_w_auto + v_w_hab + v_w_prev + v_w_obj;
  IF v_total > 0 THEN
    v_w_auto := ROUND(v_w_auto / v_total * 100);
    v_w_hab  := ROUND(v_w_hab  / v_total * 100);
    v_w_prev := ROUND(v_w_prev / v_total * 100);
    v_w_obj  := ROUND(v_w_obj  / v_total * 100);
  END IF;

  v_weights := jsonb_build_object(
    'auto', v_w_auto,
    'habitation', v_w_hab,
    'prevoyance', v_w_prev,
    'objets_valeur', v_w_obj
  );

  -- ── Global score (weighted average) ──
  v_global_score := ROUND(
    (v_auto->>'needScore')::numeric * v_w_auto / 100 +
    (v_hab->>'needScore')::numeric  * v_w_hab  / 100 +
    (v_prev->>'needScore')::numeric * v_w_prev / 100 +
    (v_obj->>'needScore')::numeric  * v_w_obj  / 100
  );

  -- ── Insert diagnostic ──
  INSERT INTO diagnostics (questionnaire_id, profile_id, scores, global_score, weightings)
  VALUES (p_questionnaire_id, v_user_id, v_scores, v_global_score, v_weights)
  RETURNING id INTO v_diag_id;

  -- ── Generate and insert actions ──

  -- AUTO rules
  IF (v_auto->>'active')::boolean IS TRUE THEN
    -- Critical auto → subscribe
    IF (v_auto->>'needLevel') = 'critical' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'auto', 5,
        'Souscrire une assurance auto',
        'Votre véhicule n''est pas suffisamment couvert. Découvrez la couverture Baloise Drive adaptée à votre profil.');
    END IF;

    -- Recent vehicle with only RC
    IF (v_answers->>'vehicleAge')::int < 3 AND (v_answers->>'autoCoverage') = 'rc' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'auto', 4,
        'Protéger votre véhicule récent',
        'Votre véhicule de moins de 3 ans représente un investissement significatif. En cas de vol ou de dégât total, votre couverture RC ne vous rembourse pas. Une couverture Omnium vous garantit le remplacement de votre véhicule.');
    END IF;

    -- Old vehicle with omnium → optimize
    IF (v_answers->>'vehicleAge')::int > 8 AND (v_answers->>'autoCoverage') = 'omnium' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'auto', 2,
        'Optimiser votre couverture auto',
        'Votre véhicule a plus de 8 ans avec une omnium. Vous pourriez économiser en passant en Mini-Omnium tout en conservant une protection adaptée.');
    END IF;
  END IF;

  -- HABITATION rules
  -- Tenant with no coverage
  IF (v_answers->>'isOwner')::boolean IS NOT TRUE AND (v_answers->>'habitationCoverage') = 'none' THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'immediate', 'habitation', 5,
      'Sécuriser votre logement',
      'En tant que locataire, une assurance habitation est indispensable pour couvrir votre responsabilité et protéger vos biens.');
  END IF;

  -- Owner with mortgage
  IF (v_answers->>'isOwner')::boolean IS TRUE AND (v_answers->>'hasMortgage')::boolean IS TRUE THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'immediate', 'habitation', 4,
      'Vérifier votre assurance emprunteur',
      'Avec un crédit immobilier en cours, assurez-vous que votre assurance emprunteur couvre bien décès et invalidité pour protéger votre famille.');
  END IF;

  -- Critical habitation
  IF (v_hab->>'needLevel') = 'critical' THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'immediate', 'habitation', 5,
      'Revoir votre couverture habitation',
      'Votre couverture habitation présente des lacunes importantes. Un bilan complet avec votre conseiller permettra d''adapter votre protection.');
  END IF;

  -- Property purchase event
  IF (v_answers->>'lifeEvent') = 'property' THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'event', 'habitation', 5,
      'Sécuriser votre projet immobilier',
      'Un achat immobilier est le moment idéal pour mettre en place une couverture habitation complète et une assurance emprunteur.');
  END IF;

  -- PREVOYANCE rules
  -- Family with single income
  IF (v_answers->>'familyStatus') = 'family' AND (v_answers->>'incomeSource') = 'one' THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'immediate', 'prevoyance', 5,
      'Protéger votre famille',
      'Avec un seul revenu et des enfants à charge, une assurance décès/invalidité est essentielle pour garantir la sécurité financière de votre famille.');
  END IF;

  -- Independent with no coverage
  IF (v_answers->>'professionalStatus') = 'independent' AND (v_answers->>'prevoyanceCoverage') = 'none' THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'immediate', 'prevoyance', 5,
      'Couvrir votre incapacité de travail',
      'En tant qu''indépendant sans couverture, une incapacité de travail pourrait avoir des conséquences financières graves. Bsafe maintient vos revenus.');
  END IF;

  -- High/critical prevoyance
  IF (v_prev->>'needLevel') IN ('high', 'critical') THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'immediate', 'prevoyance', 4,
      'Réaliser un bilan prévoyance',
      'Votre niveau de protection en prévoyance est insuffisant. Un conseiller Baloise peut vous aider à identifier les solutions adaptées.');
  END IF;

  -- Birth event
  IF (v_answers->>'lifeEvent') = 'birth' THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'event', 'prevoyance', 5,
      'Anticiper la protection de votre famille',
      'L''arrivée d''un enfant est le moment idéal pour sécuriser l''avenir de votre famille avec une couverture prévoyance adaptée.');
  END IF;

  -- Retirement event
  IF (v_answers->>'lifeEvent') = 'retirement' THEN
    INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
    VALUES (v_diag_id, v_user_id, 'event', 'prevoyance', 4,
      'Préparer votre départ en retraite',
      'Le passage à la retraite modifie profondément votre protection. Un bilan prévoyance vous permettra d''anticiper sereinement.');
  END IF;

  -- OBJETS DE VALEUR rules
  IF (v_obj->>'active')::boolean IS TRUE THEN
    -- High value with no coverage
    IF (v_answers->>'valuablesAmount') IN ('10k-50k', '50k+') AND (v_answers->>'valuablesCoverage') = 'none' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'immediate', 'objets_valeur', 4,
        'Assurer vos objets de valeur',
        'Vos objets de valeur dépassent 10 000€ sans assurance spécifique. Une couverture dédiée protège votre patrimoine artistique et vos collections.');
    END IF;

    -- No security at home
    IF (v_answers->>'valuablesStorage') = 'home_no_security' THEN
      INSERT INTO actions (diagnostic_id, profile_id, type, universe, priority, title, description)
      VALUES (v_diag_id, v_user_id, 'deferred', 'objets_valeur', 3,
        'Sécuriser vos objets de valeur',
        'Stockés à domicile sans dispositif de sécurité, vos objets sont exposés. Envisagez un coffre ou une alarme pour réduire le risque.');
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


-- ════════════════════════════════════════
-- SEC-07: Update delete_my_data() to fully delete auth.users
-- ════════════════════════════════════════

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
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

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
