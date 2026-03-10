-- ============================================================
-- Migration 001: Enable Row Level Security on all tables
-- Roue des Besoins Assurance — Luxembourg (GDPR + Art. 300 LSA)
-- ============================================================

-- Enable RLS on every table (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_clients ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (prevents service_role bypass accidents)
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses FORCE ROW LEVEL SECURITY;
ALTER TABLE diagnostics FORCE ROW LEVEL SECURITY;
ALTER TABLE actions FORCE ROW LEVEL SECURITY;
ALTER TABLE advisor_clients FORCE ROW LEVEL SECURITY;
