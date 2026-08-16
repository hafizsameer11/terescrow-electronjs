import React from 'react';

export function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (['completed', 'funds_converted', 'funds_delivered', 'active', 'successful'].includes(s)) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  if (['failed', 'palmpay_failed', 'busha_failed', 'rejected', 'cancelled'].includes(s)) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (['in_review', 'pending', 'awaiting_busha', 'awaiting_crypto_deposit', 'awaiting_palmpay'].includes(s)) {
    return 'bg-amber-100 text-amber-900 border-amber-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass(status)}`}>
      {status}
    </span>
  );
}

export function Card({
  title,
  subtitle,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-3 border-b border-slate-100">
          {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </label>
  );
}

export const inputClass =
  'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400';

export const selectClass = inputClass;

export function Btn({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const base = 'px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-indigo-600 hover:bg-indigo-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-auto max-h-80">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy:', text);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}

export function DepositAddressCard({
  title = 'Deposit address',
  address,
  network,
  amount,
  currency,
  expiresAt,
  transferId,
  compact = false,
}: {
  title?: string;
  address: string;
  network?: string | null;
  amount?: string;
  currency?: string;
  expiresAt?: string | null;
  transferId?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-emerald-200 bg-emerald-50/80 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{title}</p>
          {amount && currency && (
            <p className="text-sm font-medium text-emerald-900 mt-1">
              Send exactly <span className="font-bold">{amount} {currency}</span>
              {network ? ` on ${network}` : ''}
            </p>
          )}
          <p className="font-mono text-sm break-all text-emerald-950 mt-2">{address}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-emerald-800">
            {network && <span>Network: <strong>{network}</strong></span>}
            {transferId && <span className="font-mono">Transfer: {transferId}</span>}
            {expiresAt && (
              <span>Expires: {new Date(expiresAt).toLocaleString()}</span>
            )}
          </div>
        </div>
        <CopyBtn text={address} />
      </div>
    </div>
  );
}
