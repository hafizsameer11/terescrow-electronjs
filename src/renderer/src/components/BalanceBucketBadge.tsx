import React from 'react';

export function BalanceBucketBadge({ bucket }: { bucket?: string | null }) {
  const b = String(bucket ?? '').toLowerCase();
  if (b === 'virtual') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Virtual
      </span>
    );
  }
  if (b === 'on_chain') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        On-chain
      </span>
    );
  }
  return <span className="text-gray-400 text-xs">—</span>;
}

const LEDGER_LABELS: Record<string, string> = {
  on_chain_deposit: 'On-chain deposit',
  virtual_purchase: 'Virtual purchase',
  sell_virtual: 'Sell (virtual)',
  sell_on_chain: 'Sell (on-chain)',
  send: 'Send',
  unknown: 'Other',
};

export function LedgerTypeBadge({ type }: { type?: string | null }) {
  const label = LEDGER_LABELS[String(type ?? 'unknown')] ?? String(type ?? '—');
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      {label}
    </span>
  );
}
