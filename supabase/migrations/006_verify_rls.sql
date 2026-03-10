-- ============================================================
-- Migration 006: RLS Verification Query (R12)
-- Run this to audit the current state of RLS policies.
-- This is a diagnostic query, not a migration — run manually.
-- ============================================================

-- 1. Check that RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'questionnaire_responses', 'diagnostics', 'actions', 'advisor_clients', 'audit_logs')
ORDER BY tablename;

-- 2. List all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check for tables WITHOUT RLS (potential data leaks)
SELECT
  t.tablename
FROM pg_tables t
LEFT JOIN (
  SELECT DISTINCT tablename
  FROM pg_policies
  WHERE schemaname = 'public'
) p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND p.tablename IS NULL
  AND t.tablename NOT LIKE 'pg_%';

-- 4. Verify password minimum length (check Supabase Auth config)
-- This must be verified in Supabase Dashboard:
-- Authentication > Settings > Password minimum length
-- Recommended: 12 characters for advisor accounts
--
-- NOTE (R8): Supabase does not support per-role password policies.
-- Set the global minimum to 12 characters in:
-- Dashboard > Authentication > Providers > Email > Minimum password length
