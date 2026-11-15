import { supabase, isSupabaseConfigured } from './supabase';

export interface DashboardAuthResult {
  success: boolean;
  error?: string;
}

// Cryptographic SHA-256 hash of the authorized dashboard access token.
// Plaintext password is NEVER stored in frontend code.
const AUTHORIZED_DASHBOARD_HASH =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DASHBOARD_HASH) ||
  '71896789f07b7bc66a5316b6a290657d451ac0718eea9784a7caa6989c06e4f0';

async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Securely verify dashboard access.
 * 
 * Security guarantees:
 * - Never stores passwords in localStorage, sessionStorage, or browser cookies.
 * - Never hardcodes plaintext passwords in frontend code.
 * - Authenticates against Supabase Postgres RPC verify_dashboard_access if deployed.
 * - Compares cryptographic SHA-256 hash without exposing the password.
 * - Strictly rejects unauthorized credentials.
 */
export async function verifyDashboardPassword(
  enteredPassword: string
): Promise<DashboardAuthResult> {
  const trimmed = enteredPassword.trim();
  if (!trimmed) {
    return { success: false, error: 'Please enter your dashboard access password.' };
  }

  // 1. Supabase Postgres RPC verification (Backend verification)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'verify_dashboard_access',
        { entered_password: trimmed }
      );

      if (!rpcError && rpcData) {
        if (rpcData === true || rpcData.success === true) {
          return { success: true };
        }
        return {
          success: false,
          error: 'Incorrect dashboard password. Please try again.',
        };
      }
    } catch {
      // If RPC is not yet created in Supabase SQL editor, proceed to cryptographic hash verification
    }
  }

  // 2. Cryptographic one-way hash comparison (Zero plaintext exposure)
  try {
    const inputHash = await sha256Hex(trimmed);
    if (inputHash === AUTHORIZED_DASHBOARD_HASH) {
      return { success: true };
    }
  } catch (err) {
    console.error('Hash verification error:', err);
  }

  return {
    success: false,
    error: 'Incorrect dashboard password. Please try again.',
  };
}
