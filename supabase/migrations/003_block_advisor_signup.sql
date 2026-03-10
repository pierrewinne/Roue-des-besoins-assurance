-- ============================================================
-- Migration 003: Block advisor self-registration
-- Roue des Besoins Assurance — Luxembourg (Art. 300 LSA)
--
-- Prevents any user from self-assigning the 'advisor' role
-- via the Supabase Auth API. Advisor accounts must be created
-- by an administrator using the service_role key or dashboard.
-- ============================================================

-- Trigger function: reject profile creation with role 'advisor'
-- unless the INSERT comes from a service_role context (admin)
CREATE OR REPLACE FUNCTION prevent_advisor_self_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow if the role is 'client' (self-registration OK)
  IF NEW.role = 'client' THEN
    RETURN NEW;
  END IF;

  -- Allow if called by service_role (admin/backend)
  -- In Supabase, service_role bypasses RLS and sets role = 'service_role'
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block advisor self-registration
  RAISE EXCEPTION 'Advisor accounts must be created by an administrator.'
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS check_advisor_registration ON profiles;

-- Attach trigger BEFORE INSERT on profiles
CREATE TRIGGER check_advisor_registration
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_advisor_self_registration();


-- ════════════════════════════════════════
-- Also prevent role escalation via UPDATE
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prevent any user from changing their role
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Allow only service_role
    IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Role modification is not permitted.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_role_change ON profiles;

CREATE TRIGGER check_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();
