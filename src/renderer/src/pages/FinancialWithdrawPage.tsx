import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import {
  getMerchantsOverview,
  getPalmpayBanks,
  verifyPalmpayBankAccount,
  withdrawPalmPayProfit,
  listPalmPayProfitWithdrawals,
} from '@renderer/api/admin/merchants';
import { formatNairaAmount } from '@renderer/api/helper';
import { toastSuccess, toastApiError } from '@renderer/utils/toast';

/**
 * Admin-only: withdraw from PalmPay merchant balance to a bank account (profit payout).
 */
const FinancialWithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, userData } = useAuth();
  const isAdmin = userData?.role === 'admin';

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  const overviewQuery = useQuery({
    queryKey: ['merchants-overview', token],
    queryFn: () => getMerchantsOverview(token!),
    enabled: !!token && isAdmin,
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

  const available = overviewQuery.data?.palmpay?.balance?.availableBalanceNgn;

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

  const withdrawMutation = useMutation({
    mutationFn: () =>
      withdrawPalmPayProfit(token!, {
        amount: parseFloat(amount),
        bankCode,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        bankName: bankName || selectedBank?.bankName || undefined,
      }),
    onSuccess: (res) => {
      toastSuccess(
        `Withdrawal ${res.status}: ₦${formatNairaAmount(res.amount)} → ${res.accountName || res.accountNumber}`
      );
      setAmount('');
      queryClient.invalidateQueries({ queryKey: ['merchants-overview'] });
      queryClient.invalidateQueries({ queryKey: ['palmpay-profit-withdrawals'] });
    },
    onError: (err) => toastApiError(err, 'Withdrawal failed'),
  });

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-red-600">Admin access required.</p>
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

  const canSubmit =
    !!bankCode &&
    accountNumber.trim().length >= 10 &&
    accountName.trim().length > 1 &&
    Number(amount) >= 100 &&
    !withdrawMutation.isPending;

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Withdraw profit</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pay out from the PalmPay merchant wallet to a bank account. Balance is checked before
            PalmPay is called. Every attempt is logged with admin identity and destination account.
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
          onClick={() => overviewQuery.refetch()}
          className="text-sm px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">New withdrawal</h2>
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
              {verifyMutation.isPending ? 'Verifying…' : 'Verify account'}
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
          <div>
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
        </div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            if (
              !window.confirm(
                `Withdraw ₦${formatNairaAmount(amount)} to ${accountName} (${accountNumber})?`
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
                <th className="text-left px-4 py-2">Admin</th>
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
                        <div className="text-xs text-red-500 max-w-[200px] truncate" title={w.errorMessage}>
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
