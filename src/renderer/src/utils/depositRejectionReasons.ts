/** Human-readable deposit rejection labels (mirrors backend deposit.rejection.reasons). */

const LABELS: Record<string, string> = {
  unlisted_token_contract: 'Unlisted token contract',
  blocklisted_token_contract: 'Blocklisted scam contract',
  contract_mismatch: 'On-chain contract mismatch',
  missing_whitelist_contract: 'Missing whitelist contract',
  transfer_not_found_on_chain: 'Awaiting on-chain data',
  deposit_address_mismatch: 'Deposit address mismatch',
  amount_mismatch: 'Amount mismatch',
  transaction_failed: 'Failed on-chain transaction',
  verify_failed_timeout: 'Verification timed out',
  user_banned: 'User banned',
  unsupported_chain: 'Unsupported chain',
  fake_scam_token: 'Scam / unlisted token',
  fake_deposit: 'Fake deposit record',
  revoked_fraud: 'Revoked (fraud)',
  pending_onchain_verification: 'Pending on-chain verify',
};

const DETAILS: Record<string, string> = {
  unlisted_token_contract:
    'Token contract is not on the platform whitelist. No balance was credited.',
  blocklisted_token_contract:
    'Contract matches the scam blocklist. Deposit rejected without credit.',
  contract_mismatch:
    'On-chain token contract does not match the whitelisted asset for this wallet.',
  missing_whitelist_contract:
    'Token deposit could not be matched to a whitelisted contract.',
  transfer_not_found_on_chain:
    'Transaction not yet visible on-chain or outputs not indexed. Retries continue automatically.',
  deposit_address_mismatch:
    'Transaction exists on-chain but pays a different address than this user\'s deposit wallet. Cannot credit.',
  amount_mismatch:
    'Webhook amount does not match the on-chain amount within tolerance.',
  transaction_failed: 'Blockchain transaction did not succeed.',
  verify_failed_timeout:
    'Verification retries exhausted. Review required — not automatically marked as scam.',
  fake_scam_token: 'Deposit flagged as scam or unlisted token.',
};

function normalizeCode(raw: string | null | undefined): string {
  const code = (raw || '').trim().toLowerCase();
  if (code.includes(':')) return code.split(':').pop() ?? code;
  if (code.startsWith('verify_')) return code.slice('verify_'.length);
  return code.replace(/[\s-]/g, '_');
}

export function formatRejectionLabel(code: string | null | undefined): string {
  const key = normalizeCode(code);
  return LABELS[key] ?? (code ? code.replace(/_/g, ' ') : 'Flagged');
}

export function formatRejectionDetail(code: string | null | undefined): string {
  const key = normalizeCode(code);
  return DETAILS[key] ?? 'See verification log for full details.';
}

export function verifyStatusLabel(
  status: string,
  opts?: { rejectionCode?: string | null; nextRetryAt?: string | null }
): string {
  const s = (status || '').toLowerCase();
  const code = normalizeCode(opts?.rejectionCode);
  if (s === 'verified') return 'Verified';
  if (s === 'mismatch') return code === 'deposit_address_mismatch' ? 'Address mismatch' : 'Fraud confirmed';
  if (s === 'rejected') return 'Rejected (scam guard)';
  if (s === 'failed') return 'Verify timeout';
  if (s === 'pending') {
    if (code === 'deposit_address_mismatch') return 'Address mismatch';
    if (opts?.nextRetryAt && code) return 'Retry scheduled';
    if (code) return 'Checking on-chain';
    return 'Pending';
  }
  return status;
}

export function verifyStatusBadgeClass(status: string, rejectionCode?: string | null): string {
  const s = (status || '').toLowerCase();
  const code = normalizeCode(rejectionCode);
  if (s === 'verified') return 'bg-green-100 text-green-800';
  if (s === 'pending' && code && code !== 'transfer_not_found_on_chain') {
    return 'bg-orange-100 text-orange-900';
  }
  if (s === 'pending') return 'bg-amber-100 text-amber-900';
  if (s === 'rejected' || s === 'mismatch') return 'bg-red-100 text-red-800';
  if (s === 'failed') return 'bg-orange-100 text-orange-900';
  return 'bg-gray-100 text-gray-700';
}

export function isDefinitiveRejection(status: string, rejectionCode?: string | null): boolean {
  const s = (status || '').toLowerCase();
  if (s === 'rejected' || s === 'mismatch' || s === 'failed') return true;
  const code = normalizeCode(rejectionCode);
  return code === 'deposit_address_mismatch';
}
