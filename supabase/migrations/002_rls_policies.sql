-- ============================================================
-- Migration 002: Row Level Security Policies
-- Roue des Besoins Assurance — Luxembourg (GDPR + Art. 300 LSA)
--
-- Principe: chaque utilisateur ne voit que ses propres donnees.
-- Les conseillers voient les donnees de leurs clients assignes.
-- Aucun utilisateur ne peut modifier les donnees d'autrui.
-- ============================================================

-- ── Helper: check if current user is an advisor of a given client ──
CREATE OR REPLACE FUNCTION is_advisor_of(p_client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM advisor_clients
    WHERE advisor_id = auth.uid()
      AND client_id = p_client_id
  );
$$;


-- ════════════════════════════════════════
-- PROFILES
-- ════════════════════════════════════════

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Advisors read assigned client profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Auth trigger inserts profile" ON profiles;

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Advisors can read profiles of their assigned clients
CREATE POLICY "Advisors read assigned client profiles"
  ON profiles FOR SELECT
  USING (is_advisor_of(id));

-- Users can update only their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Profile insert is handled by the auth trigger (service_role)
-- No INSERT policy for authenticated users needed


-- ════════════════════════════════════════
-- QUESTIONNAIRE_RESPONSES
-- ════════════════════════════════════════

DROP POLICY IF EXISTS "Users read own responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "Advisors read assigned client responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users insert own responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users update own responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users delete own responses" ON questionnaire_responses;

-- Users can read their own responses
CREATE POLICY "Users read own responses"
  ON questionnaire_responses FOR SELECT
  USING (profile_id = auth.uid());

-- Advisors can read responses of their assigned clients
CREATE POLICY "Advisors read assigned client responses"
  ON questionnaire_responses FOR SELECT
  USING (is_advisor_of(profile_id));

-- Users can insert their own responses
CREATE POLICY "Users insert own responses"
  ON questionnaire_responses FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Users can update only their own responses
CREATE POLICY "Users update own responses"
  ON questionnaire_responses FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Users can delete their own responses (GDPR erasure)
CREATE POLICY "Users delete own responses"
  ON questionnaire_responses FOR DELETE
  USING (profile_id = auth.uid());


-- ════════════════════════════════════════
-- DIAGNOSTICS
-- ════════════════════════════════════════

DROP POLICY IF EXISTS "Users read own diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Advisors read assigned client diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Users insert own diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Users delete own diagnostics" ON diagnostics;

-- Users can read their own diagnostics
CREATE POLICY "Users read own diagnostics"
  ON diagnostics FOR SELECT
  USING (profile_id = auth.uid());

-- Advisors can read diagnostics of their assigned clients
CREATE POLICY "Advisors read assigned client diagnostics"
  ON diagnostics FOR SELECT
  USING (is_advisor_of(profile_id));

-- Users can insert their own diagnostics
CREATE POLICY "Users insert own diagnostics"
  ON diagnostics FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Users can delete their own diagnostics (GDPR erasure)
CREATE POLICY "Users delete own diagnostics"
  ON diagnostics FOR DELETE
  USING (profile_id = auth.uid());


-- ════════════════════════════════════════
-- ACTIONS
-- ════════════════════════════════════════

DROP POLICY IF EXISTS "Users read own actions" ON actions;
DROP POLICY IF EXISTS "Advisors read assigned client actions" ON actions;
DROP POLICY IF EXISTS "Users insert own actions" ON actions;
DROP POLICY IF EXISTS "Users delete own actions" ON actions;

-- Users can read actions linked to their diagnostics
CREATE POLICY "Users read own actions"
  ON actions FOR SELECT
  USING (profile_id = auth.uid());

-- Advisors can read actions of their assigned clients
CREATE POLICY "Advisors read assigned client actions"
  ON actions FOR SELECT
  USING (is_advisor_of(profile_id));

-- Users can insert actions for their own diagnostics
CREATE POLICY "Users insert own actions"
  ON actions FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Users can delete their own actions (GDPR erasure)
CREATE POLICY "Users delete own actions"
  ON actions FOR DELETE
  USING (profile_id = auth.uid());


-- ════════════════════════════════════════
-- ADVISOR_CLIENTS
-- ════════════════════════════════════════

DROP POLICY IF EXISTS "Advisors read own relations" ON advisor_clients;
DROP POLICY IF EXISTS "Clients read own assignment" ON advisor_clients;

-- Advisors can read their own client relations
CREATE POLICY "Advisors read own relations"
  ON advisor_clients FOR SELECT
  USING (advisor_id = auth.uid());

-- Clients can see who their advisor is (optional, for future use)
CREATE POLICY "Clients read own assignment"
  ON advisor_clients FOR SELECT
  USING (client_id = auth.uid());

-- No INSERT/UPDATE/DELETE for authenticated users
-- advisor_clients is managed by admin/service_role only
