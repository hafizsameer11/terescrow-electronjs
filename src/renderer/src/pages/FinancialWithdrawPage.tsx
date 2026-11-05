import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import { useDailyReportSession } from '@renderer/context/dailyReportSessionContext';
import {
  getPalmpayBanks,
  verifyPalmpayBankAccount,
  getProfitWithdrawDestination,
  saveProfitWithdrawDestination,
  withdrawPalmPayProfit,
  listPalmPayProfitWithdrawals,
} from '@renderer/api/admin/merchants';
import { getMarkupProfitOverview } from '@renderer/api/admin/profitTracker';
import { formatNairaAmount } from '@renderer/api/helper';
import { toDateString, toApiInclusiveEnd } from '@renderer/utils/dateRange';
import { toastSuccess, toastApiError } from '@renderer/utils/toast';

function toCheckInIso(checkInTime: string): string {
  const d = new Date(checkInTime);
  return Number.isNaN(d.getTime()) ? checkInTime : d.toISOString();
}

/**
 * Admin: PalmPay-verify + save shared destination; withdraw into it.
 * Agent: only withdrawable session profit + amount (no merchant balance).
 */
const FinancialWithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, userData } = useAuth();
  const { isClockedIn, session } = useDailyReportSession();
  const isAdmin = userData?.role === 'admin';
  const isAgent = userData?.role === 'agent';
  const isStaff = isAdmin || isAgent;

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  const sessionProfitParams = useMemo(() => {
    const today = toDateString(new Date());
    let startDate: string = today;
    const endDate = toApiInclusiveEnd(today);
    if (isClockedIn && session?.checkInTime) {
      const checkInIso = toCheckInIso(session.checkInTime);
      if (checkInIso.slice(0, 10) === today) {
        startDate = checkInIso;
      }
    }
    return { startDate, endDate };
  }, [isClockedIn, session?.checkInTime]);

  const sinceClockIn =
    !!isClockedIn &&
    !!session?.checkInTime &&
    sessionProfitParams.startDate === toCheckInIso(session.checkInTime);

  const sessionProfitQuery = useQuery({
    queryKey: ['withdraw-session-markup-profit', token, sessionProfitParams],
    queryFn: () => getMarkupProfitOverview(token!, sessionProfitParams),
    enabled: !!token && isAgent,
    staleTime: 30_000,
  });

  const withdrawableProfitNgn = Number(
    sessionProfitQuery.data?.summary?.totalProfitNgn ?? 0
  );

  const destinationQuery = useQuery({
    queryKey: ['palmpay-profit-withdraw-destination', token],
    queryFn: () => getProfitWithdrawDestination(token!),
    enabled: !!token && isStaff,
    staleTime: 30_000,
  });

  const banksQuery = useQuery({
    queryKey: ['palmpay-banks-admin', token],
    queryFn: () => getPalmpayBanks(token!),
    enabled: !!token && isAdmin,
    staleTime: 5 * 60_000,
  });

  const historyQuery = useQuery({
    queryKey: ['palmpay-profit-withdrawals', token],
    queryFn: () => listPalmPayProfitWithdrawals(token!, 50),
    enabled: !!token && isAdmin,
  });

  const destination = destinationQuery.data?.destination;
  const available = isAdmin ? destinationQuery.data?.availableBalanceNgn : null;

  useEffect(() => {
    if (!isAdmin || !destination?.configured) return;
    if (bankCode || accountNumber) return;
    setBankCode(destination.bankCode || '');
    setAccountNumber(destination.accountNumber || '');
    setAccountName(destination.accountName || '');
    setBankName(destination.bankName || '');
  }, [isAdmin, destination, bankCode, accountNumber]);

  // Agents: default amount to withdrawable session profit once loaded.
  useEffect(() => {
    if (!isAgent || amount) return;
    if (withdrawableProfitNgn >= 100) {
      setAmount(String(Math.round(withdrawableProfitNgn * 100) / 100));
    }
  }, [isAgent, withdrawableProfitNgn, amount]);

  const selectedBank = useMemo(
    () => (banksQuery.data || []).find((b) => b.bankCode === bankCode),
    [banksQuery.data, bankCode]
  );

  const verifyMutation = useMutation({
    mutationFn: () =>
      verifyPalmpayBankAccount(token!, {
        bankCode,
        accountNumber: accountNumber.trim(),
      }),
    onSuccess: (res) => {
      if (res.isValid && res.accountName) {
        setAccountName(res.accountName);
        setVerifyNote(`Verified: ${res.accountName}`);
        toastSuccess('Account verified');
      } else {
        setVerifyNote(res.errorMessage || 'Could not verify account');
        toastApiError(new Error(res.errorMessage || 'Invalid account'), 'Verification failed');
      }
    },
    onError: (err) => toastApiError(err, 'Verification failed'),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      saveProfitWithdrawDestination(token!, {
        bankCode,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim() || undefined,
        bankName: bankName || selectedBank?.bankName || undefined,
      }),
    onSuccess: (res) => {
      toastSuccess(
        `Saved destination: ${res.destination.accountName} (${res.destination.accountNumber})`
      );
      setVerifyNote(`Saved: ${res.destination.accountName}`);
      queryClient.invalidateQueries({ queryKey: ['palmpay-profit-withdraw-destination'] });
    },
    onError: (err) => toastApiError(err, 'Failed to save destination'),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => withdrawPalmPayProfit(token!, { amount: parseFloat(amount) }),
    onSuccess: (res) => {
      toastSuccess(
        `Withdrawal ${res.status}: ₦${formatNairaAmount(res.amount)} → ${res.accountName || res.accountNumber}`
      );
      setAmount('');
      queryClient.invalidateQueries({ queryKey: ['palmpay-profit-withdraw-destination'] });
      queryClient.invalidateQueries({ queryKey: ['palmpay-profit-withdrawals'] });
      if (isAgent) sessionProfitQuery.refetch();
    },
    onError: (err) => toastApiError(err, 'Withdrawal failed'),
  });

  if (!isStaff) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-red-600">Staff access required.</p>
        <button
          type="button"
          className="mt-4 text-sm text-[#147341] underline"
          onClick={() => navigate('/chats')}
        >
          Back to Chats
        </button>
      </div>
    );
  }

  const canSave =
    isAdmin &&
    !!bankCode &&
    accountNumber.trim().length >= 10 &&
    accountName.trim().length > 1 &&
    !saveMutation.isPending;

  const canWithdraw =
    !!destination?.configured &&
    Number(amount) >= 100 &&
    !withdrawMutation.isPending &&
    (!isAgent || Number(amount) <= withdrawableProfitNgn + 0.001);

  // ——— Agent: withdrawable profit only ———
  if (isAgent) {
    return (
      <div className="p-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Withdraw profit</h1>
            <p className="text-sm text-gray-500 mt-1">
              Withdraw session profit into the admin-saved account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/chats')}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4">
          <p className="text-xs uppercase text-emerald-700 font-medium">
            {sinceClockIn ? 'Profit you can withdraw (since clock-in)' : 'Profit you can withdraw (today)'}
          </p>
          <p className="text-2xl font-semibold text-emerald-900 mt-1">
            {sessionProfitQuery.isLoading
              ? '…'
              : `₦${formatNairaAmount(withdrawableProfitNgn)}`}
          </p>
        </div>

        {!destination?.configured ? (
          <p className="text-sm text-amber-700">
            No withdraw account is set yet. Ask an admin to save one first.
          </p>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-800 mb-1">Amount (₦)</label>
              <input
                type="number"
                min={100}
                max={Math.max(100, withdrawableProfitNgn)}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Min 100"
              />
              {Number(amount) > withdrawableProfitNgn + 0.001 ? (
                <p className="text-xs text-red-600 mt-1">
                  Cannot exceed session profit (₦{formatNairaAmount(withdrawableProfitNgn)}).
                </p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={!canWithdraw}
              onClick={() => {
                if (
                  !window.confirm(
                    `Withdraw ₦${formatNairaAmount(amount)} of session profit?`
                  )
                ) {
                  return;
                }
                withdrawMutation.mutate();
              }}
              className="mt-5 px-4 py-2.5 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] disabled:opacity-50"
            >
              {withdrawMutation.isPending ? 'Submitting…' : 'Withdraw'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ——— Admin ———
  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Withdraw profit</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verify and save a bank account with PalmPay. Agents withdraw into that saved account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/chats')}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-emerald-700 font-medium">Merchant available</p>
          <p className="text-xl font-semibold text-emerald-900">
            {available != null ? `₦${formatNairaAmount(available)}` : '—'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => destinationQuery.refetch()}
          className="text-sm px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-1">Saved withdraw account</h2>
        <p className="text-xs text-gray-500 mb-3">
          Shared destination used for all profit withdrawals.
        </p>
        {destinationQuery.isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : destination?.configured ? (
          <div>
            <p className="font-medium text-gray-900">{destination.accountName}</p>
            <p className="text-sm text-gray-600 font-mono mt-0.5">
              {destination.bankName || destination.bankCode} · {destination.accountNumber}
            </p>
            {destination.verifiedAt ? (
              <p className="text-xs text-gray-400 mt-1">
                PalmPay verified {new Date(destination.verifiedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-amber-700">
            No account saved yet. Verify a bank account below and save it.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Save / update account</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-800 mb-1">Bank</label>
            <select
              value={bankCode}
              onChange={(e) => {
                setBankCode(e.target.value);
                const b = (banksQuery.data || []).find((x) => x.bankCode === e.target.value);
                setBankName(b?.bankName || '');
                setAccountName('');
                setVerifyNote(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select bank</option>
              {(banksQuery.data || []).map((b) => (
                <option key={b.bankCode} value={b.bankCode}>
                  {b.bankName} ({b.bankCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Account number</label>
            <input
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 12));
                setAccountName('');
                setVerifyNote(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="10-digit NUBAN"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              disabled={!bankCode || accountNumber.length < 10 || verifyMutation.isPending}
              onClick={() => verifyMutation.mutate()}
              className="w-full px-3 py-2 rounded-lg border border-[#147341] text-[#147341] text-sm font-medium disabled:opacity-50"
            >
              {verifyMutation.isPending ? 'Verifying…' : 'Verify with PalmPay'}
            </button>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-800 mb-1">Account name</label>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Filled after verify (editable if needed)"
            />
            {verifyNote ? <p className="text-xs text-gray-500 mt-1">{verifyNote}</p> : null}
          </div>
        </div>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => saveMutation.mutate()}
          className="mt-5 px-4 py-2.5 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save account for withdrawals'}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">New withdrawal</h2>
        {!destination?.configured ? (
          <p className="text-sm text-gray-500">Save a verified bank account before withdrawing.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Paying to{' '}
              <span className="font-medium text-gray-900">{destination.accountName}</span>
              <span className="font-mono text-gray-500"> · {destination.accountNumber}</span>
            </p>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-800 mb-1">Amount (₦)</label>
              <input
                type="number"
                min={100}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Min 100"
              />
            </div>
            <button
              type="button"
              disabled={!canWithdraw}
              onClick={() => {
                if (
                  !window.confirm(
                    `Withdraw ₦${formatNairaAmount(amount)} to ${destination.accountName} (${destination.accountNumber})?`
                  )
                ) {
                  return;
                }
                withdrawMutation.mutate();
              }}
              className="mt-5 px-4 py-2.5 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] disabled:opacity-50"
            >
              {withdrawMutation.isPending ? 'Submitting…' : 'Withdraw from PalmPay'}
            </button>
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Withdrawal history</h2>
          <p className="text-xs text-gray-500">Who withdrew, which account, status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">When</th>
                <th className="text-left px-4 py-2">Staff</th>
                <th className="text-left px-4 py-2">Account</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : (historyQuery.data?.withdrawals || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No withdrawals yet
                  </td>
                </tr>
              ) : (
                (historyQuery.data?.withdrawals || []).map((w) => (
                  <tr key={w.id} className="border-t border-gray-100">
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                      {w.createdAt ? new Date(w.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      {w.initiatedBy
                        ? `${w.initiatedBy.firstname} ${w.initiatedBy.lastname}`.trim() ||
                          w.initiatedBy.email
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-800">{w.accountName || '—'}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {w.bankName || w.bankCode} · {w.accountNumber}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-semibold">₦{formatNairaAmount(w.amount)}</td>
                    <td className="px-4 py-2.5 capitalize">
                      <span
                        className={
                          w.status === 'completed'
                            ? 'text-emerald-700'
                            : w.status === 'failed'
                              ? 'text-red-600'
                              : 'text-amber-700'
                        }
                      >
                        {w.status}
                      </span>
                      {w.errorMessage ? (
                        <div
                          className="text-xs text-red-500 max-w-[200px] truncate"
                          title={w.errorMessage}
                        >
                          {w.errorMessage}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialWithdrawPage;
