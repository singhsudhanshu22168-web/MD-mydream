-- ==============================================================================
-- MD (MYDREAM) - DASHBOARD BACKEND AUTHENTICATION (SUPABASE RPC)
-- ==============================================================================
-- Run this in Supabase SQL Editor to manage the Admin Dashboard password
-- securely in Postgres with Row Level Security.
-- Dashboard Access Token (stored as cryptographic SHA-256 hash)
-- ==============================================================================

-- 1. Create a secure private table for dashboard security (no anon/authenticated SELECT)
CREATE TABLE IF NOT EXISTS public.dashboard_security (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and DO NOT add SELECT policies for anon/authenticated (100% private to SECURITY DEFINER functions)
ALTER TABLE public.dashboard_security ENABLE ROW LEVEL SECURITY;

-- 2. Store the SHA-256 hash for authorized dashboard access
DELETE FROM public.dashboard_security;
INSERT INTO public.dashboard_security (password_hash)
VALUES ('71896789f07b7bc66a5316b6a290657d451ac0718eea9784a7caa6989c06e4f0');

-- 3. Create the backend verification function
CREATE OR REPLACE FUNCTION public.verify_dashboard_access(entered_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_stored_hash text;
  v_input_hash text;
  v_is_valid boolean := false;
BEGIN
  -- Read hash from private dashboard_security table
  SELECT password_hash INTO v_stored_hash FROM public.dashboard_security LIMIT 1;
  
  -- Compute SHA-256 of entered password
  v_input_hash := encode(digest(entered_password, 'sha256'), 'hex');

  IF v_stored_hash IS NOT NULL THEN
    IF v_stored_hash = v_input_hash THEN
      v_is_valid := true;
    END IF;
  ELSE
    -- Default check for authorized dashboard hash
    IF v_input_hash = '71896789f07b7bc66a5316b6a290657d451ac0718eea9784a7caa6989c06e4f0' THEN
      v_is_valid := true;
    END IF;
  END IF;

  IF v_is_valid THEN
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid dashboard password');
  END IF;
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.verify_dashboard_access(text) TO anon, authenticated;
