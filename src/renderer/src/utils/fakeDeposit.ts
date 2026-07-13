export function normalizeDepositStatusKey(status: string | null | undefined): string {
  return (status || '').toLowerCase().replace(/[\s_-]/g, '');
}

export function isFakeScamDepositStatus(status: string | null | undefined): boolean {
  return normalizeDepositStatusKey(status) === 'fakescam';
}

export function isFakeCryptoTxStatus(status: string | null | undefined): boolean {
  return (status || '').toLowerCase() === 'fake';
}

export function isRevokedCryptoTxStatus(status: string | null | undefined): boolean {
  return (status || '').toLowerCase() === 'revoked';
}

export function isRevokedOrFakeCryptoTxStatus(status: string | null | undefined): boolean {
  return isFakeCryptoTxStatus(status) || isRevokedCryptoTxStatus(status);
}

export function isPendingVerificationDepositStatus(status: string | null | undefined): boolean {
  return normalizeDepositStatusKey(status) === 'pendingverification';
}

export function isPendingVerifyCryptoTxStatus(status: string | null | undefined): boolean {
  return (status || '').toLowerCase() === 'pending_verification';
}

export function isPendingVerificationRow(input: {
  status?: string | null;
  masterWalletStatus?: string | null;
  pendingVerification?: boolean;
}): boolean {
  if (input.pendingVerification) return true;
  return (
    isPendingVerifyCryptoTxStatus(input.status)
    || isPendingVerificationDepositStatus(input.masterWalletStatus)
  );
}

export function isFakeDepositRow(input: {
  status?: string | null;
  masterWalletStatus?: string | null;
}): boolean {
  return isRevokedOrFakeCryptoTxStatus(input.status) || isFakeScamDepositStatus(input.masterWalletStatus);
}

export function formatDepositStatusLabel(status: string | null | undefined): string {
  const key = normalizeDepositStatusKey(status);
  if (key === 'inwallet') return 'In wallet';
  if (key === 'transferredtomaster') return 'Transferred to master';
  if (key === 'senttovendor') return 'Sent to vendor';
  if (key === 'fakescam') return 'Fake scam';
  return status || 'Unknown';
}

export function formatCryptoTxStatusLabel(status: string | null | undefined): string {
  if (isFakeCryptoTxStatus(status)) return 'Fake';
  if (isRevokedCryptoTxStatus(status)) return 'Revoked (fraud)';
  if (isPendingVerifyCryptoTxStatus(status)) return 'Pending verify';
  if ((status || '').toLowerCase() === 'verify_failed_timeout') return 'Verify failed';
  return status || '—';
}

export function cryptoTxStatusBadgeClass(status: string | null | undefined): string {
  if (isRevokedOrFakeCryptoTxStatus(status)) {
    return 'bg-red-100 text-red-800 border-red-400 font-bold';
  }
  const s = (status || '').toLowerCase();
  if (s === 'successful') return 'bg-green-100 text-green-700 border-green-500';
  if (s === 'pending' || s === 'processing') return 'bg-yellow-100 text-yellow-700 border-yellow-500';
  return 'bg-red-100 text-red-700 border-red-500';
}

import { formatRejectionLabel } from './depositRejectionReasons';

export function formatFlagReasonLabel(reason: string | null | undefined): string {
  if (!reason) return 'Flagged';
  return formatRejectionLabel(reason);
}

export function cryptoTxStatusDotClass(status: string | null | undefined): string {
  if (isRevokedOrFakeCryptoTxStatus(status)) return 'bg-red-700';
  const s = (status || '').toLowerCase();
  if (s === 'successful') return 'bg-green-700';
  if (s === 'pending' || s === 'processing') return 'bg-yellow-600';
  return 'bg-red-700';
}
