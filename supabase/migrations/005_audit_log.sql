-- ============================================================
-- Migration 005: Audit Log for compliance
-- Roue des Besoins Assurance — Luxembourg (Art. 300 LSA)
--
-- Tracks access to sensitive data for regulatory compliance.
-- Required by CSSF/CAA for insurance intermediaries.
-- ============================================================

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  user_role text,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Audit logs are append-only: authenticated users can only INSERT
-- No SELECT, UPDATE, DELETE for regular users (admin reads via service_role)
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Index for efficient queries by admin
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);


-- ════════════════════════════════════════
-- Helper function to log an action (callable from frontend)
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role text;
BEGIN
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


-- ════════════════════════════════════════
-- Automatic audit triggers for sensitive operations
-- ════════════════════════════════════════

-- Log when an advisor accesses a client's diagnostic
CREATE OR REPLACE FUNCTION audit_diagnostic_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role text;
BEGIN
  SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();

  -- Only log advisor access to other users' diagnostics
  IF v_user_role = 'advisor' AND NEW.profile_id != auth.uid() THEN
    INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      'advisor',
      'view_client_diagnostic',
      'diagnostics',
      NEW.id,
      jsonb_build_object('client_id', NEW.profile_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Log GDPR data deletion
CREATE OR REPLACE FUNCTION audit_data_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    (SELECT role FROM profiles WHERE id = auth.uid()),
    'gdpr_data_deleted',
    TG_TABLE_NAME,
    OLD.id,
    jsonb_build_object('table', TG_TABLE_NAME)
  );
  RETURN OLD;
END;
$$;

-- Attach deletion audit triggers
DROP TRIGGER IF EXISTS audit_questionnaire_delete ON questionnaire_responses;
CREATE TRIGGER audit_questionnaire_delete
  AFTER DELETE ON questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION audit_data_deletion();

DROP TRIGGER IF EXISTS audit_diagnostic_delete ON diagnostics;
CREATE TRIGGER audit_diagnostic_delete
  AFTER DELETE ON diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION audit_data_deletion();

DROP TRIGGER IF EXISTS audit_action_delete ON actions;
CREATE TRIGGER audit_action_delete
  AFTER DELETE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION audit_data_deletion();
