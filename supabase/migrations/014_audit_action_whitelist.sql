-- ════════════════════════════════════════════════════════════
-- Migration 014: Restrict log_audit_event to whitelisted actions (P2-08)
-- Prevents arbitrary text injection into audit logs
-- ════════════════════════════════════════════════════════════

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
    'generate_pdf_client',
    'generate_pdf_advisor'
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
