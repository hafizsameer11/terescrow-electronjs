import React, { useMemo } from 'react';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';
import { formatNairaAmount } from '@renderer/api/helper';
import { formatProfitTrackerLabel } from '@renderer/utils/formatLabels';

function formatLedgerDate(iso: unknown): string {
  if (iso == null || iso === '') return '—';
  const s = typeof iso === 'string' || typeof iso === 'number' ? String(iso) : '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return typeof iso === 'string' ? iso : String(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatNgn(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = parseFloat(String(v).replace(/,/g, ''));
  const prefix = Number.isFinite(n) && n < 0 ? '-₦' : '₦';
  return `${prefix}${formatNairaAmount(v as string | number).replace(/^-/, '')}`;
}

function formatRate(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return `₦${formatNairaAmount(v as string | number)} per $1`;
}

function formatUsd(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = parseFloat(String(v).replace(/,/g, ''));
  if (Number.isNaN(n)) return String(v);
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function readMeta(row: Record<string, unknown>): Record<string, unknown> | null {
  const meta = row.meta;
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return null;
}

function InfoTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3 min-w-[8rem]">
      <p className="text-[11px] uppercase tracking-wider text-white/70">{label}</p>
      <p className="text-lg font-semibold text-white mt-1">{value}</p>
      {sub ? <p className="text-xs text-white/60 mt-1">{sub}</p> : null}
    </div>
  );
}

function SpreadVisual({
  userSellRate,
  userBuyRate,
  amountUsd,
  profitNgn,
}: {
  userSellRate: number;
  userBuyRate: number;
  amountUsd: number;
  profitNgn: number;
}) {
  const spread = userBuyRate - userSellRate;
  const calcProfit = spread * amountUsd;
  const max = Math.max(userBuyRate, userSellRate, 1);
  const sellPct = Math.round((userSellRate / max) * 100);
  const buyPct = Math.round((userBuyRate / max) * 100);

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Your margin on this trade</h4>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          Users <strong>buy from you</strong> at the higher rate and <strong>sell to you</strong> at the lower rate.
          You keep the difference on every dollar.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>User sells to you</span>
            <span className="font-medium text-gray-800">{formatRate(userSellRate)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${sellPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>User buys from you</span>
            <span className="font-medium text-gray-800">{formatRate(userBuyRate)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#147341]" style={{ width: `${buyPct}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 text-emerald-100 px-4 py-3 font-mono text-sm leading-relaxed">
        (₦{formatNairaAmount(userBuyRate)} − ₦{formatNairaAmount(userSellRate)}) × {formatUsd(amountUsd)} ={' '}
        <span className="text-white font-semibold">₦{formatNairaAmount(calcProfit)}</span>
      </div>

      {Math.abs(calcProfit - profitNgn) > 2 ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Recorded profit ({formatNgn(profitNgn)}) differs slightly from the formula above — may include discounts or
          config rules.
        </p>
      ) : null}
    </div>
  );
}

export interface LedgerDetailViewProps {
  row: Record<string, unknown>;
}

export function LedgerDetailView({ row }: LedgerDetailViewProps) {
  const content = useMemo(() => {
    const meta = readMeta(row);
    const amountCrypto = meta?.amountCrypto;
    const txType = formatProfitTrackerLabel(String(row.transactionType ?? '—'));
    const asset = String(row.asset ?? '—');
    const profitType = String(row.profitType ?? '');
    const isSpread = profitType.toUpperCase() === 'SPREAD';

    const userSellRate = parseFloat(String(row.buyRate ?? '').replace(/,/g, ''));
    const userBuyRate = parseFloat(String(row.sellRate ?? '').replace(/,/g, ''));
    const amountUsd = parseFloat(String(row.amountUsd ?? row.amount ?? '').replace(/,/g, ''));
    const profitNgn = parseFloat(String(row.profitNgn ?? '0').replace(/,/g, ''));
    const ratesValid =
      isSpread && Number.isFinite(userSellRate) && Number.isFinite(userBuyRate) && Number.isFinite(amountUsd);

    const profitPositive = Number.isFinite(profitNgn) && profitNgn >= 0;

    return (
      <div className="overflow-y-auto flex-1 bg-slate-50">
        <div className="bg-gradient-to-br from-[#0d5a2e] via-[#147341] to-[#1a9d5c] px-5 py-6 text-white">
          <p className="text-xs uppercase tracking-widest text-white/70">{txType}</p>
          <p className="text-3xl font-bold mt-1">{formatNgn(row.profitNgn)}</p>
          <p className="text-sm text-white/80 mt-1">Terescrow profit on this transaction</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <InfoTile label="Asset" value={asset} sub={row.blockchain ? String(row.blockchain) : undefined} />
            <InfoTile label="USD value" value={formatUsd(row.amountUsd)} />
            <InfoTile label="User NGN flow" value={formatNgn(row.amountNgn)} />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {!profitPositive && isSpread ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              This row shows a loss because the stored rates look wrong (often from an old bug). Use{' '}
              <strong>Operations → Recompute all</strong> to rebuild the ledger with correct NGN/$ rates.
            </div>
          ) : null}

          {ratesValid ? (
            <SpreadVisual
              userSellRate={Math.min(userSellRate, userBuyRate)}
              userBuyRate={Math.max(userSellRate, userBuyRate)}
              amountUsd={amountUsd}
              profitNgn={profitNgn}
            />
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Transaction</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">ID</dt>
                  <dd className="text-gray-900 text-right break-all font-mono text-xs">{String(row.sourceTransactionId ?? '—')}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">When</dt>
                  <dd className="text-gray-900 text-right">{formatLedgerDate(row.sourceOccurredAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="text-gray-900 text-right">{String(row.status ?? '—')}</dd>
                </div>
                {amountCrypto != null ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Crypto qty</dt>
                    <dd className="text-gray-900 text-right">{formatCryptoAmountFromUnknown(amountCrypto)} {asset}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Rates (NGN per $1)</h4>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">User sells to you</dt>
                  <dd className="text-gray-900 font-medium mt-0.5">{formatRate(row.buyRate)}</dd>
                  <p className="text-xs text-gray-400 mt-0.5">Lower rate — e.g. ₦1,000/$</p>
                </div>
                <div>
                  <dt className="text-gray-500">User buys from you</dt>
                  <dd className="text-gray-900 font-medium mt-0.5">{formatRate(row.sellRate)}</dd>
                  <p className="text-xs text-gray-400 mt-0.5">Higher rate — e.g. ₦2,000/$</p>
                </div>
              </dl>
            </div>
          </div>

          {row.notes ? (
            <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">{String(row.notes)}</p>
          ) : null}
        </div>
      </div>
    );
  }, [row]);

  return content;
}

export { formatLedgerDate };
