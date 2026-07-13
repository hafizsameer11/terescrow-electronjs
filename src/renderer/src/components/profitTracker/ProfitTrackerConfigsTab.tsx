import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEdit2, FiPlus, FiX } from 'react-icons/fi';
import { ApiError } from '@renderer/api/customApiCall';
import type { ProfitTrackerConfigsResponse } from '@renderer/api/admin/profitTracker';
import {
  createDiscountTier,
  createProfitConfig,
  createRateConfig,
  updateDiscountTier,
  updateProfitConfig,
  updateRateConfig,
} from '@renderer/api/admin/profitTracker';

function errMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : 'Request failed';
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function rowId(row: Record<string, unknown>): string | number {
  const id = row.id;
  if (typeof id === 'number' && Number.isFinite(id)) return id;
  if (typeof id === 'string' && id.trim()) return id;
  return '';
}

function isoForInput(v: unknown): string {
  if (v == null || v === '') return '';
  const s = typeof v === 'string' ? v : String(v);
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function optionalIsoFromInput(local: string): string | undefined {
  const t = local.trim();
  if (!t) return undefined;
  const d = new Date(t);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

type Dialog =
  | null
  | { kind: 'profit'; mode: 'create' | 'edit'; row?: Record<string, unknown> }
  | { kind: 'rate'; mode: 'create' | 'edit'; row?: Record<string, unknown> }
  | { kind: 'discount'; mode: 'create' | 'edit'; row?: Record<string, unknown> };

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/35 focus:border-[#147341]';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';
const btnPrimary = 'px-4 py-2 text-sm rounded-lg bg-[#147341] text-white hover:bg-[#0d5a2e] disabled:opacity-50 shadow-sm font-medium';
const btnCancel = 'px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

/** Profit `scope: SERVICE` values — sent lowercased (see ADMIN_PANEL_API.md). Extend when backend adds services. */
const PROFIT_CONFIG_SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: 'bill_payment', label: 'Bill payment' },
  { value: 'crypto_send', label: 'Crypto send' },
  { value: 'crypto_receive', label: 'Crypto receive' },
  { value: 'crypto_deposit_fee', label: 'Crypto deposit fee' },
  { value: 'crypto_buy', label: 'Crypto buy' },
  { value: 'crypto_sell', label: 'Crypto sell' },
  { value: 'gift_card_buy', label: 'Gift card buy' },
  { value: 'gift_card_sell', label: 'Gift card sell' },
  { value: 'fiat_deposit', label: 'Fiat deposit' },
  { value: 'fiat_withdrawal', label: 'Fiat withdrawal' },
];

function ModalShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/80">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Close">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">{children}</div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">{footer}</div>
      </div>
    </div>
  );
}

function ProfitConfigForm({
  token,
  mode,
  row,
  onClose,
  onSaved,
}: {
  token: string;
  mode: 'create' | 'edit';
  row?: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [transactionType, setTransactionType] = useState(() => cell(row?.transactionType).replace('—', '') || 'SELL');
  const [scope, setScope] = useState(() => (cell(row?.scope).replace('—', '').trim() || 'GLOBAL').toUpperCase());
  const [asset, setAsset] = useState(() => cell(row?.asset).replace('—', ''));
  const [service, setService] = useState(() => cell(row?.service).replace('—', '').trim().toLowerCase());
  const [profitType, setProfitType] = useState(() =>
    (cell(row?.profitType).replace('—', '').trim() || 'PERCENTAGE').toUpperCase()
  );
  const [value, setValue] = useState(() => cell(row?.value).replace('—', ''));
  const [isActive, setIsActive] = useState(() => (row?.isActive === false ? false : true));
  const [effectiveFrom, setEffectiveFrom] = useState(() => isoForInput(row?.effectiveFrom));
  const [effectiveTo, setEffectiveTo] = useState(() => isoForInput(row?.effectiveTo));
  const [error, setError] = useState<string | null>(null);

  const serviceSelectOptions = useMemo(() => {
    const normalized = service.trim().toLowerCase();
    if (normalized && !PROFIT_CONFIG_SERVICE_OPTIONS.some((o) => o.value === normalized)) {
      return [
        ...PROFIT_CONFIG_SERVICE_OPTIONS,
        { value: normalized, label: `${normalized} (from server)` },
      ];
    }
    return PROFIT_CONFIG_SERVICE_OPTIONS;
  }, [service]);

  useEffect(() => {
    setTransactionType(cell(row?.transactionType).replace('—', '') || 'SELL');
    setScope((cell(row?.scope).replace('—', '').trim() || 'GLOBAL').toUpperCase());
    setAsset(cell(row?.asset).replace('—', ''));
    setService(cell(row?.service).replace('—', '').trim().toLowerCase());
    setProfitType((cell(row?.profitType).replace('—', '').trim() || 'PERCENTAGE').toUpperCase());
    setValue(cell(row?.value).replace('—', ''));
    setIsActive(row?.isActive === false ? false : true);
    setEffectiveFrom(isoForInput(row?.effectiveFrom));
    setEffectiveTo(isoForInput(row?.effectiveTo));
  }, [row, mode]);

  const mutation = useMutation({
    mutationFn: async () => {
      const profitTypeNorm = profitType.replace(/\u2014/g, '').replace(/—/g, '').trim().toUpperCase();
      const body: Record<string, unknown> = {
        transactionType: transactionType.trim().toUpperCase(),
        profitType: profitTypeNorm,
        value: value.trim() === '' ? 0 : Number.isNaN(Number(value)) ? value.trim() : Number(value),
        isActive,
      };
      const sc = scope.trim().toUpperCase();
      if (sc) body.scope = sc;
      if (sc === 'ASSET' && asset.trim()) body.asset = asset.trim().toUpperCase();
      if (sc === 'SERVICE' && service.trim()) body.service = service.trim().toLowerCase();
      const from = optionalIsoFromInput(effectiveFrom);
      const to = optionalIsoFromInput(effectiveTo);
      if (from) body.effectiveFrom = from;
      if (effectiveTo.trim()) body.effectiveTo = to ?? effectiveTo.trim();
      else if (mode === 'edit') body.effectiveTo = null;
      if (mode === 'edit') {
        const id = rowId(row!);
        if (id === '') throw new Error('Missing row id');
        return updateProfitConfig(token, id, body);
      }
      return createProfitConfig(token, body);
    },
    onSuccess: () => {
      setError(null);
      onSaved();
      onClose();
    },
    onError: (e) => setError(errMessage(e)),
  });

  return (
    <ModalShell
      title={mode === 'create' ? 'New profit rule' : 'Edit profit rule'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnCancel}>
            Cancel
          </button>
          <button
            type="button"
            disabled={
              mutation.isPending ||
              !transactionType.trim() ||
              !['FIXED', 'PERCENTAGE', 'SPREAD'].includes(
                profitType.replace(/\u2014/g, '').replace(/—/g, '').trim().toUpperCase()
              ) ||
              (scope === 'SERVICE' && !service.trim()) ||
              (scope === 'ASSET' && !asset.trim())
            }
            onClick={() => mutation.mutate()}
            className={btnPrimary}
          >
            {mutation.isPending ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </>
      }
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className={labelCls}>transactionType *</label>
        <input className={inputCls} value={transactionType} onChange={(e) => setTransactionType(e.target.value)} placeholder="BUY, SELL, DEPOSIT…" />
      </div>
      <div>
        <label className={labelCls}>scope</label>
        <select className={inputCls} value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="GLOBAL">GLOBAL</option>
          <option value="ASSET">ASSET</option>
          <option value="SERVICE">SERVICE</option>
        </select>
      </div>
      {scope === 'ASSET' && (
        <div>
          <label className={labelCls}>asset</label>
          <input className={inputCls} value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="USDT" />
        </div>
      )}
      {scope === 'SERVICE' && (
        <div>
          <label className={labelCls}>service</label>
          <select
            className={inputCls}
            value={service.trim().toLowerCase()}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">Select a service…</option>
            {serviceSelectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className={labelCls}>profitType *</label>
        <select className={inputCls} value={profitType} onChange={(e) => setProfitType(e.target.value)}>
          <option value="FIXED">FIXED</option>
          <option value="PERCENTAGE">PERCENTAGE</option>
          <option value="SPREAD">SPREAD</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>value *</label>
        <input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Number or fixed amount" />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>effectiveFrom</label>
          <input type="datetime-local" className={inputCls} value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>effectiveTo (empty = open)</label>
          <input type="datetime-local" className={inputCls} value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
        </div>
      </div>
    </ModalShell>
  );
}

function RateConfigForm({
  token,
  mode,
  row,
  onClose,
  onSaved,
}: {
  token: string;
  mode: 'create' | 'edit';
  row?: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [asset, setAsset] = useState(() => cell(row?.asset).replace('—', '') || 'USDT');
  const [blockchain, setBlockchain] = useState(() => cell(row?.blockchain).replace('—', ''));
  const [baseBuyRate, setBaseBuyRate] = useState(() => cell(row?.baseBuyRate).replace('—', ''));
  const [baseSellRate, setBaseSellRate] = useState(() => cell(row?.baseSellRate).replace('—', ''));
  const [isActive, setIsActive] = useState(() => (row?.isActive === false ? false : true));
  const [effectiveFrom, setEffectiveFrom] = useState(() => isoForInput(row?.effectiveFrom));
  const [effectiveTo, setEffectiveTo] = useState(() => isoForInput(row?.effectiveTo));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAsset(cell(row?.asset).replace('—', '') || 'USDT');
    setBlockchain(cell(row?.blockchain).replace('—', ''));
    setBaseBuyRate(cell(row?.baseBuyRate).replace('—', ''));
    setBaseSellRate(cell(row?.baseSellRate).replace('—', ''));
    setIsActive(row?.isActive === false ? false : true);
    setEffectiveFrom(isoForInput(row?.effectiveFrom));
    setEffectiveTo(isoForInput(row?.effectiveTo));
  }, [row, mode]);

  const mutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        asset: asset.trim().toUpperCase(),
        baseBuyRate: baseBuyRate.trim(),
        baseSellRate: baseSellRate.trim(),
        isActive,
      };
      const b = blockchain.trim().toLowerCase();
      body.blockchain = b ? b : null;
      const from = optionalIsoFromInput(effectiveFrom);
      const to = optionalIsoFromInput(effectiveTo);
      if (from) body.effectiveFrom = from;
      if (effectiveTo.trim()) body.effectiveTo = to ?? effectiveTo.trim();
      else if (mode === 'edit') body.effectiveTo = null;
      if (mode === 'edit') {
        const id = rowId(row!);
        if (id === '') throw new Error('Missing row id');
        return updateRateConfig(token, id, body);
      }
      return createRateConfig(token, body);
    },
    onSuccess: () => {
      setError(null);
      onSaved();
      onClose();
    },
    onError: (e) => setError(errMessage(e)),
  });

  return (
    <ModalShell
      title={mode === 'create' ? 'New rate config' : 'Edit rate config'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnCancel}>
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending || !asset.trim() || !baseBuyRate.trim() || !baseSellRate.trim()}
            onClick={() => mutation.mutate()}
            className={btnPrimary}
          >
            {mutation.isPending ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </>
      }
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className={labelCls}>asset *</label>
        <input className={inputCls} value={asset} onChange={(e) => setAsset(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>blockchain (empty = global for asset)</label>
        <input className={inputCls} value={blockchain} onChange={(e) => setBlockchain(e.target.value)} placeholder="ethereum, tron…" />
      </div>
      <div>
        <label className={labelCls}>baseBuyRate *</label>
        <input className={inputCls} value={baseBuyRate} onChange={(e) => setBaseBuyRate(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>baseSellRate *</label>
        <input className={inputCls} value={baseSellRate} onChange={(e) => setBaseSellRate(e.target.value)} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>effectiveFrom</label>
          <input type="datetime-local" className={inputCls} value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>effectiveTo</label>
          <input type="datetime-local" className={inputCls} value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
        </div>
      </div>
    </ModalShell>
  );
}

function DiscountTierForm({
  token,
  mode,
  row,
  onClose,
  onSaved,
}: {
  token: string;
  mode: 'create' | 'edit';
  row?: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [minAmount, setMinAmount] = useState(() => cell(row?.minAmount).replace('—', '') || '0');
  const [maxAmount, setMaxAmount] = useState(() => cell(row?.maxAmount).replace('—', ''));
  const [discountPercentage, setDiscountPercentage] = useState(() => cell(row?.discountPercentage).replace('—', '') || '0');
  const [asset, setAsset] = useState(() => cell(row?.asset).replace('—', ''));
  const [transactionType, setTransactionType] = useState(() => cell(row?.transactionType).replace('—', ''));
  const [precedence, setPrecedence] = useState(() => (row?.precedence != null ? String(row.precedence) : '0'));
  const [isActive, setIsActive] = useState(() => (row?.isActive === false ? false : true));
  const [effectiveFrom, setEffectiveFrom] = useState(() => isoForInput(row?.effectiveFrom));
  const [effectiveTo, setEffectiveTo] = useState(() => isoForInput(row?.effectiveTo));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMinAmount(cell(row?.minAmount).replace('—', '') || '0');
    setMaxAmount(cell(row?.maxAmount).replace('—', ''));
    setDiscountPercentage(cell(row?.discountPercentage).replace('—', '') || '0');
    setAsset(cell(row?.asset).replace('—', ''));
    setTransactionType(cell(row?.transactionType).replace('—', ''));
    setPrecedence(row?.precedence != null ? String(row.precedence) : '0');
    setIsActive(row?.isActive === false ? false : true);
    setEffectiveFrom(isoForInput(row?.effectiveFrom));
    setEffectiveTo(isoForInput(row?.effectiveTo));
  }, [row, mode]);

  const mutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        minAmount: minAmount.trim() === '' ? 0 : Number(minAmount),
        discountPercentage: discountPercentage.trim() === '' ? 0 : Number(discountPercentage),
        isActive,
      };
      if (maxAmount.trim() === '') body.maxAmount = null;
      else body.maxAmount = Number(maxAmount);
      if (asset.trim()) body.asset = asset.trim().toUpperCase();
      if (transactionType.trim()) body.transactionType = transactionType.trim().toUpperCase();
      if (precedence.trim() !== '') body.precedence = Number(precedence);
      const from = optionalIsoFromInput(effectiveFrom);
      const to = optionalIsoFromInput(effectiveTo);
      if (from) body.effectiveFrom = from;
      if (effectiveTo.trim()) body.effectiveTo = to ?? effectiveTo.trim();
      else if (mode === 'edit') body.effectiveTo = null;
      if (mode === 'edit') {
        const id = rowId(row!);
        if (id === '') throw new Error('Missing row id');
        return updateDiscountTier(token, id, body);
      }
      return createDiscountTier(token, body);
    },
    onSuccess: () => {
      setError(null);
      onSaved();
      onClose();
    },
    onError: (e) => setError(errMessage(e)),
  });

  return (
    <ModalShell
      title={mode === 'create' ? 'New discount tier' : 'Edit discount tier'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnCancel}>
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending || !discountPercentage.trim()}
            onClick={() => mutation.mutate()}
            className={btnPrimary}
          >
            {mutation.isPending ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </>
      }
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className={labelCls}>minAmount (USD notion) *</label>
        <input className={inputCls} type="text" inputMode="decimal" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>maxAmount (empty = open-ended)</label>
        <input className={inputCls} type="text" inputMode="decimal" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>discountPercentage *</label>
        <input className={inputCls} type="text" inputMode="decimal" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>asset (optional)</label>
        <input className={inputCls} value={asset} onChange={(e) => setAsset(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>transactionType (optional)</label>
        <input className={inputCls} value={transactionType} onChange={(e) => setTransactionType(e.target.value)} placeholder="SELL" />
      </div>
      <div>
        <label className={labelCls}>precedence</label>
        <input className={inputCls} type="number" value={precedence} onChange={(e) => setPrecedence(e.target.value)} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>effectiveFrom</label>
          <input type="datetime-local" className={inputCls} value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>effectiveTo</label>
          <input type="datetime-local" className={inputCls} value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
        </div>
      </div>
    </ModalShell>
  );
}

type SubTab = 'profit' | 'rate' | 'discount';

export interface ProfitTrackerConfigsTabProps {
  token: string;
  data: ProfitTrackerConfigsResponse | undefined;
  isLoading: boolean;
}

const ProfitTrackerConfigsTab: React.FC<ProfitTrackerConfigsTabProps> = ({ token, data, isLoading }) => {
  const queryClient = useQueryClient();
  const [sub, setSub] = useState<SubTab>('profit');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [rawOpen, setRawOpen] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['profit-tracker-configs'] });

  const profitRows = useMemo(() => (Array.isArray(data?.profitConfigs) ? data!.profitConfigs : []) as Record<string, unknown>[], [data]);
  const rateRows = useMemo(() => (Array.isArray(data?.rateConfigs) ? data!.rateConfigs : []) as Record<string, unknown>[], [data]);
  const tierRows = useMemo(() => (Array.isArray(data?.discountTiers) ? data!.discountTiers : []) as Record<string, unknown>[], [data]);

  const subTabBtn = (id: SubTab, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setSub(id)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
        sub === id ? 'bg-[#147341] text-white shadow-sm' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Configuration</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {subTabBtn('profit', 'Profit rules')}
          {subTabBtn('rate', 'Rate configs')}
          {subTabBtn('discount', 'Discount tiers')}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRawOpen((v) => !v)}
            className="text-sm text-[#147341] font-medium hover:underline"
          >
            {rawOpen ? 'Hide raw JSON' : 'Raw JSON'}
          </button>
          {sub === 'profit' && (
            <button
              type="button"
              onClick={() => setDialog({ kind: 'profit', mode: 'create' })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              New rule
            </button>
          )}
          {sub === 'rate' && (
            <button
              type="button"
              onClick={() => setDialog({ kind: 'rate', mode: 'create' })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              New rate
            </button>
          )}
          {sub === 'discount' && (
            <button
              type="button"
              onClick={() => setDialog({ kind: 'discount', mode: 'create' })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              New tier
            </button>
          )}
        </div>
        </div>
      </div>

      {rawOpen && (
        <pre className="text-xs bg-[#0f172a] text-[#bbf7d0] p-4 rounded-xl border border-gray-700 overflow-auto max-h-64">
          {JSON.stringify({ profitConfigs: profitRows, rateConfigs: rateRows, discountTiers: tierRows }, null, 2)}
        </pre>
      )}

      {isLoading ? (
        <p className="text-gray-500 py-8">Loading configs…</p>
      ) : sub === 'profit' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="text-left px-3 py-3 font-medium">id</th>
                <th className="text-left px-3 py-2 font-medium">type</th>
                <th className="text-left px-3 py-2 font-medium">scope</th>
                <th className="text-left px-3 py-2 font-medium">profitType</th>
                <th className="text-left px-3 py-2 font-medium">value</th>
                <th className="text-left px-3 py-2 font-medium">active</th>
                <th className="text-right px-3 py-2 font-medium w-24"> </th>
              </tr>
            </thead>
            <tbody>
              {profitRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    No profit rules
                  </td>
                </tr>
              ) : (
                profitRows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono text-xs">{cell(row.id)}</td>
                    <td className="px-3 py-2">{cell(row.transactionType)}</td>
                    <td className="px-3 py-2">{cell(row.scope)}</td>
                    <td className="px-3 py-2">{cell(row.profitType)}</td>
                    <td className="px-3 py-2">{cell(row.value)}</td>
                    <td className="px-3 py-2">{cell(row.isActive)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setDialog({ kind: 'profit', mode: 'edit', row })}
                        className="inline-flex items-center gap-1 text-[#147341] font-medium hover:underline text-xs"
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : sub === 'rate' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="text-left px-3 py-3 font-medium">id</th>
                <th className="text-left px-3 py-2 font-medium">asset</th>
                <th className="text-left px-3 py-2 font-medium">chain</th>
                <th className="text-left px-3 py-2 font-medium">buy</th>
                <th className="text-left px-3 py-2 font-medium">sell</th>
                <th className="text-left px-3 py-2 font-medium">active</th>
                <th className="text-right px-3 py-2 font-medium w-24"> </th>
              </tr>
            </thead>
            <tbody>
              {rateRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    No rate configs
                  </td>
                </tr>
              ) : (
                rateRows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono text-xs">{cell(row.id)}</td>
                    <td className="px-3 py-2">{cell(row.asset)}</td>
                    <td className="px-3 py-2">{cell(row.blockchain)}</td>
                    <td className="px-3 py-2">{cell(row.baseBuyRate)}</td>
                    <td className="px-3 py-2">{cell(row.baseSellRate)}</td>
                    <td className="px-3 py-2">{cell(row.isActive)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setDialog({ kind: 'rate', mode: 'edit', row })}
                        className="inline-flex items-center gap-1 text-[#147341] font-medium hover:underline text-xs"
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="text-left px-3 py-3 font-medium">id</th>
                <th className="text-left px-3 py-2 font-medium">min–max USD</th>
                <th className="text-left px-3 py-2 font-medium">%</th>
                <th className="text-left px-3 py-2 font-medium">asset</th>
                <th className="text-left px-3 py-2 font-medium">tx type</th>
                <th className="text-left px-3 py-2 font-medium">prec.</th>
                <th className="text-left px-3 py-2 font-medium">active</th>
                <th className="text-right px-3 py-2 font-medium w-24"> </th>
              </tr>
            </thead>
            <tbody>
              {tierRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                    No discount tiers
                  </td>
                </tr>
              ) : (
                tierRows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono text-xs">{cell(row.id)}</td>
                    <td className="px-3 py-2">
                      {cell(row.minAmount)} — {cell(row.maxAmount)}
                    </td>
                    <td className="px-3 py-2">{cell(row.discountPercentage)}</td>
                    <td className="px-3 py-2">{cell(row.asset)}</td>
                    <td className="px-3 py-2">{cell(row.transactionType)}</td>
                    <td className="px-3 py-2">{cell(row.precedence)}</td>
                    <td className="px-3 py-2">{cell(row.isActive)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setDialog({ kind: 'discount', mode: 'edit', row })}
                        className="inline-flex items-center gap-1 text-[#147341] font-medium hover:underline text-xs"
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {dialog?.kind === 'profit' && (
        <ProfitConfigForm
          token={token}
          mode={dialog.mode}
          row={dialog.row}
          onClose={() => setDialog(null)}
          onSaved={invalidate}
        />
      )}
      {dialog?.kind === 'rate' && (
        <RateConfigForm
          token={token}
          mode={dialog.mode}
          row={dialog.row}
          onClose={() => setDialog(null)}
          onSaved={invalidate}
        />
      )}
      {dialog?.kind === 'discount' && (
        <DiscountTierForm
          token={token}
          mode={dialog.mode}
          row={dialog.row}
          onClose={() => setDialog(null)}
          onSaved={invalidate}
        />
      )}
    </div>
  );
};

export default ProfitTrackerConfigsTab;
