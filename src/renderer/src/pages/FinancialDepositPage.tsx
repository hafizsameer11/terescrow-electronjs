import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import { getMerchantsOverview } from '@renderer/api/admin/merchants';
import PalmPayFundingAccountCard from '@renderer/components/masterWallet/PalmPayFundingAccountCard';
import { formatNairaAmount } from '@renderer/api/helper';
import { PALMPAY_FUNDING_ACCOUNT } from '@renderer/constants/palmpayFundingAccount';

/**
 * Admin: show PalmPay merchant funding account to deposit/top up merchant wallet.
 */
const FinancialDepositPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, userData } = useAuth();
  const isAdmin = userData?.role === 'admin';

  const overviewQuery = useQuery({
    queryKey: ['merchants-overview', token],
    queryFn: () => getMerchantsOverview(token!),
    enabled: !!token && isAdmin,
    staleTime: 30_000,
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

  const bal = overviewQuery.data?.palmpay?.balance;
  const funding = overviewQuery.data?.palmpay?.fundingAccount || PALMPAY_FUNDING_ACCOUNT;

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Deposit — PalmPay merchant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Transfer NGN to the company PalmPay account to fund the merchant wallet used for payouts
            and bills.
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

      <PalmPayFundingAccountCard
        accountNumber={funding.accountNumber}
        bankName={funding.bankName}
        accountName={funding.accountName}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Live merchant balance</h2>
        <p className="text-sm text-gray-500 mb-4">From PalmPay queryBalance (admin Merchants).</p>
        {overviewQuery.isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : overviewQuery.isError ? (
          <p className="text-sm text-red-600">Failed to load merchants overview.</p>
        ) : overviewQuery.data?.palmpay?.balanceError ? (
          <p className="text-sm text-amber-700">{overviewQuery.data.palmpay.balanceError}</p>
        ) : bal ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
              <p className="text-[11px] uppercase text-emerald-700">Available</p>
              <p className="text-lg font-semibold text-emerald-900">
                ₦{formatNairaAmount(bal.availableBalanceNgn)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[11px] uppercase text-gray-500">Current</p>
              <p className="text-lg font-semibold text-gray-900">
                ₦{formatNairaAmount(bal.currentBalanceNgn)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[11px] uppercase text-gray-500">Frozen</p>
              <p className="text-lg font-semibold text-gray-900">
                ₦{formatNairaAmount(bal.frozenBalanceNgn)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[11px] uppercase text-gray-500">Unsettled</p>
              <p className="text-lg font-semibold text-gray-900">
                ₦{formatNairaAmount(bal.unSettleBalanceNgn)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Balance not available.</p>
        )}
        <button
          type="button"
          onClick={() => overviewQuery.refetch()}
          className="mt-4 text-sm px-3 py-1.5 rounded-lg bg-[#147341] text-white hover:bg-[#0d5a2e]"
        >
          Refresh balance
        </button>
      </div>
    </div>
  );
};

export default FinancialDepositPage;
