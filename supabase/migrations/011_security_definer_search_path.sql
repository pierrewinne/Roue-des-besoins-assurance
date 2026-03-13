-- ════════════════════════════════════════════════════════════
-- Migration 011: Add SET search_path = public to all SECURITY DEFINER functions
-- Prevents search_path injection attacks on privileged functions
-- ════════════════════════════════════════════════════════════

-- 002_rls_policies.sql
ALTER FUNCTION is_advisor_of(uuid) SET search_path = public;

-- 003_block_advisor_signup.sql
ALTER FUNCTION prevent_advisor_self_registration() SET search_path = public;
ALTER FUNCTION prevent_role_change() SET search_path = public;

-- 004_gdpr_erasure.sql (overridden by 010 for delete_my_data)
-- delete_my_data() is redefined in 010, handled below

-- 005_audit_log.sql
ALTER FUNCTION log_audit_event(text, uuid, jsonb) SET search_path = public;
ALTER FUNCTION audit_diagnostic_access() SET search_path = public;
ALTER FUNCTION audit_data_deletion() SET search_path = public;

-- 009_server_side_fixes.sql
ALTER FUNCTION export_my_data() SET search_path = public;

-- 010_scoring_engine.sql
ALTER FUNCTION compute_and_save_diagnostic(uuid) SET search_path = public;
ALTER FUNCTION delete_my_data() SET search_path = public;

-- Also add to table 'actions' the missing CHECK value 'optimization'
-- (V1 rules produce this type but the constraint blocks it)
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_type_check;
ALTER TABLE actions ADD CONSTRAINT actions_type_check
  CHECK (type IN ('immediate', 'deferred', 'event', 'optimization'));
