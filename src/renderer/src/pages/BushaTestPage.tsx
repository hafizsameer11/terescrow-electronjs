import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import {
  createBushaCustomer,
  executeBushaBuy,
  executeBushaSell,
  getBushaStatus,
  listBushaCustomers,
  listBushaTrades,
  previewBushaQuote,
  refreshBushaCustomer,
  refreshBushaTrade,
  saveBushaSettings,
  syncBushaRecipient,
  verifyBushaCustomer,
  type BushaQuotePreview,
  type BushaTrade,
} from '@renderer/api/admin';
import { getPalmpayBanks, verifyPalmpayBankAccount } from '@renderer/api/admin/merchants';

type Tab = 'overview' | 'customers' | 'trade' | 'trades';

const statusColor = (status: string) => {
  if (['completed', 'funds_converted', 'funds_delivered'].includes(status)) return 'text-green-700 bg-green-50';
  if (['failed', 'palmpay_failed', 'busha_failed'].includes(status)) return 'text-red-700 bg-red-50';
  return 'text-amber-700 bg-amber-50';
};

const BushaTestPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');

  const [customerForm, setCustomerForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '+234',
  });

  const [settingsForm, setSettingsForm] = useState({
    payoutBankCode: '',
    payoutBankName: '',
    payoutAccountNumber: '',
    payoutAccountName: '',
    payoutRecipientId: '',
  });

  const [tradeForm, setTradeForm] = useState({
    customerId: '',
    side: 'buy' as 'buy' | 'sell',
    sourceCurrency: 'NGN',
    targetCurrency: 'USDT',
    amount: '5000',
    fundingMethod: 'balance' as 'balance' | 'address',
    autoPalmpayPayout: true,
  });

  const [quotePreview, setQuotePreview] = useState<BushaQuotePreview | null>(null);
  const [lastTrade, setLastTrade] = useState<BushaTrade | null>(null);

  const statusQuery = useQuery({
    queryKey: ['busha-status', token],
    queryFn: () => getBushaStatus(token!),
    enabled: !!token,
  });

  const customersQuery = useQuery({
    queryKey: ['busha-customers', token],
    queryFn: () => listBushaCustomers(token!),
    enabled: !!token,
  });

  const tradesQuery = useQuery({
    queryKey: ['busha-trades', token],
    queryFn: () => listBushaTrades(token!),
    enabled: !!token,
  });

  const banksQuery = useQuery({
    queryKey: ['palmpay-banks-busha', token],
    queryFn: () => getPalmpayBanks(token!),
    enabled: !!token && tab === 'overview',
  });

  const currencies = statusQuery.data?.currencies;

  const buySourceOptions = useMemo(() => currencies?.fiat ?? ['NGN'], [currencies]);
  const buyTargetOptions = useMemo(() => currencies?.crypto ?? ['USDT', 'BTC', 'ETH'], [currencies]);
  const sellSourceOptions = useMemo(() => currencies?.crypto ?? ['USDT', 'BTC', 'ETH'], [currencies]);
  const sellTargetOptions = useMemo(() => currencies?.fiat ?? ['NGN'], [currencies]);

  React.useEffect(() => {
    const s = statusQuery.data?.settings;
    if (s) {
      setSettingsForm({
        payoutBankCode: s.payoutBankCode || '',
        payoutBankName: s.payoutBankName || '',
        payoutAccountNumber: s.payoutAccountNumber || '',
        payoutAccountName: s.payoutAccountName || '',
        payoutRecipientId: s.payoutRecipientId || '',
      });
    }
  }, [statusQuery.data?.settings]);

  React.useEffect(() => {
    if (!tradeForm.customerId && customersQuery.data?.length) {
      setTradeForm((f) => ({ ...f, customerId: customersQuery.data![0].id }));
    }
  }, [customersQuery.data, tradeForm.customerId]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['busha-status'] });
    queryClient.invalidateQueries({ queryKey: ['busha-customers'] });
    queryClient.invalidateQueries({ queryKey: ['busha-trades'] });
  };

  const createCustomerMutation = useMutation({
    mutationFn: () => createBushaCustomer(token!, customerForm),
    onSuccess: () => {
      invalidateAll();
      setCustomerForm({ email: '', firstName: '', lastName: '', phone: '+234' });
      setTab('customers');
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: () => saveBushaSettings(token!, settingsForm),
    onSuccess: invalidateAll,
  });

  const verifyBankMutation = useMutation({
    mutationFn: () =>
      verifyPalmpayBankAccount(token!, {
        bankCode: settingsForm.payoutBankCode,
        accountNumber: settingsForm.payoutAccountNumber,
      }),
    onSuccess: (data) => {
      if (data.accountName) {
        setSettingsForm((f) => ({ ...f, payoutAccountName: data.accountName || f.payoutAccountName }));
      }
    },
  });

  const syncRecipientMutation = useMutation({
    mutationFn: (profileId: string) => syncBushaRecipient(token!, profileId),
    onSuccess: (data: any) => {
      if (data?.settings?.payoutRecipientId) {
        setSettingsForm((f) => ({ ...f, payoutRecipientId: data.settings.payoutRecipientId }));
      }
      invalidateAll();
    },
  });

  const previewQuoteMutation = useMutation({
    mutationFn: () => {
      const isBuy = tradeForm.side === 'buy';
      return previewBushaQuote(token!, {
        customerId: tradeForm.customerId,
        side: tradeForm.side,
        sourceCurrency: isBuy ? tradeForm.sourceCurrency : tradeForm.sourceCurrency,
        targetCurrency: isBuy ? tradeForm.targetCurrency : tradeForm.targetCurrency,
        amount: tradeForm.amount,
        fundingMethod: isBuy ? 'temporary_bank_account' : tradeForm.fundingMethod,
      });
    },
    onSuccess: (data) => setQuotePreview(data),
  });

  const executeTradeMutation = useMutation({
    mutationFn: async () => {
      if (tradeForm.side === 'buy') {
        return executeBushaBuy(token!, {
          customerId: tradeForm.customerId,
          sourceCurrency: tradeForm.sourceCurrency,
          targetCurrency: tradeForm.targetCurrency,
          sourceAmount: tradeForm.amount,
          autoPalmpayPayout: tradeForm.autoPalmpayPayout,
        });
      }
      return executeBushaSell(token!, {
        customerId: tradeForm.customerId,
        sourceCurrency: tradeForm.sourceCurrency,
        targetCurrency: tradeForm.targetCurrency,
        sourceAmount: tradeForm.amount,
        fundingMethod: tradeForm.fundingMethod,
      });
    },
    onSuccess: (trade) => {
      setLastTrade(trade);
      invalidateAll();
      setTab('trades');
    },
  });

  const refreshTradeMutation = useMutation({
    mutationFn: (tradeId: string) => refreshBushaTrade(token!, tradeId),
    onSuccess: invalidateAll,
  });

  const onSideChange = (side: 'buy' | 'sell') => {
    if (side === 'buy') {
      setTradeForm({
        ...tradeForm,
        side,
        sourceCurrency: 'NGN',
        targetCurrency: 'USDT',
        fundingMethod: 'balance',
      });
    } else {
      setTradeForm({
        ...tradeForm,
        side,
        sourceCurrency: 'USDT',
        targetCurrency: 'NGN',
        fundingMethod: 'balance',
      });
    }
    setQuotePreview(null);
  };

  const selectedCustomer = customersQuery.data?.find((c) => c.id === tradeForm.customerId);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-normal text-gray-800">Busha Test</h1>
          <p className="text-sm text-gray-600 mt-1">
            Admin test console for Busha customers, PalmPay-funded buys, and sell-to-bank flows. Uses real or sandbox APIs based on backend <code className="text-xs bg-gray-100 px-1 rounded">BUSHA_ENVIRONMENT</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={invalidateAll}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
        >
          Refresh all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['overview', 'customers', 'trade', 'trades'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Busha API</h2>
            <p className="text-sm">
              Configured:{' '}
              <span className={statusQuery.data?.busha.configured ? 'text-green-700' : 'text-red-700'}>
                {statusQuery.data?.busha.configured ? 'Yes' : 'No'}
              </span>
            </p>
            <p className="text-sm text-gray-600">Env: {statusQuery.data?.busha.environment}</p>
            <p className="text-sm text-gray-600 break-all">Base: {statusQuery.data?.busha.baseUrl}</p>
            <p className="text-sm text-gray-600">Key: {statusQuery.data?.busha.apiKeyMasked || '—'}</p>
            <p className="text-xs text-gray-500">
              Set BUSHA_API_KEY and BUSHA_ENVIRONMENT=production (or sandbox) in backend .env
            </p>
            {statusQuery.data?.busha.environment === 'production' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Production mode — real NGN and crypto. Use small amounts. PalmPay must also be on production.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">PalmPay merchant</h2>
            <p className="text-sm">
              Configured:{' '}
              <span className={statusQuery.data?.palmpay.configured ? 'text-green-700' : 'text-red-700'}>
                {statusQuery.data?.palmpay.configured ? 'Yes' : 'No'}
              </span>
            </p>
            {statusQuery.data?.palmpay.balance ? (
              <p className="text-sm">
                Available: ₦{statusQuery.data.palmpay.balance.availableBalanceNgn.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-red-600">{statusQuery.data?.palmpay.balanceError || 'Balance unavailable'}</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-800">Sell payout bank (receive NGN from Busha)</h2>
            <p className="text-sm text-gray-600">
              Configure the bank account where Busha sends NGN after a sell. Use your PalmPay settlement account, then
              sync recipient on a customer profile.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                Bank
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={settingsForm.payoutBankCode}
                  onChange={(e) => {
                    const bank = banksQuery.data?.find((b) => b.bankCode === e.target.value);
                    setSettingsForm((f) => ({
                      ...f,
                      payoutBankCode: e.target.value,
                      payoutBankName: bank?.bankName || f.payoutBankName,
                    }));
                  }}
                >
                  <option value="">Select bank</option>
                  {(banksQuery.data || []).map((b) => (
                    <option key={b.bankCode} value={b.bankCode}>
                      {b.bankName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Account number
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={settingsForm.payoutAccountNumber}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, payoutAccountNumber: e.target.value }))}
                />
              </label>
              <label className="text-sm md:col-span-2">
                Account name
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={settingsForm.payoutAccountName}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, payoutAccountName: e.target.value }))}
                />
              </label>
              <label className="text-sm md:col-span-2">
                Busha recipient ID
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50"
                  value={settingsForm.payoutRecipientId}
                  readOnly
                  placeholder="Created via Sync recipient"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => verifyBankMutation.mutate()}
                disabled={verifyBankMutation.isPending}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Verify bank (PalmPay)
              </button>
              <button
                type="button"
                onClick={() => saveSettingsMutation.mutate()}
                disabled={saveSettingsMutation.isPending}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
              >
                Save settings
              </button>
              <button
                type="button"
                onClick={() => {
                  const profileId = selectedCustomer?.bushaProfileId || customersQuery.data?.[0]?.bushaProfileId;
                  if (!profileId) return;
                  syncRecipientMutation.mutate(profileId);
                }}
                disabled={syncRecipientMutation.isPending || !customersQuery.data?.length}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Sync Busha recipient
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold">Create Busha customer</h2>
            {['email', 'firstName', 'lastName', 'phone'].map((field) => (
              <label key={field} className="block text-sm">
                {field}
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={(customerForm as any)[field]}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => createCustomerMutation.mutate()}
              disabled={createCustomerMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              Create customer
            </button>
            {createCustomerMutation.isError && (
              <p className="text-sm text-red-600">{(createCustomerMutation.error as Error).message}</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Busha ID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(customersQuery.data || []).map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="px-4 py-3">
                      <div>{c.firstName} {c.lastName}</div>
                      <div className="text-gray-500 text-xs">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{c.bushaProfileId}</td>
                    <td className="px-4 py-3">{c.status}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        type="button"
                        className="text-indigo-600 text-xs"
                        onClick={() => verifyBushaCustomer(token!, c.id).then(invalidateAll)}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="text-gray-600 text-xs"
                        onClick={() => refreshBushaCustomer(token!, c.id).then(invalidateAll)}
                      >
                        Refresh
                      </button>
                    </td>
                  </tr>
                ))}
                {!customersQuery.data?.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No Busha customers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'trade' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold">Buy / Sell test</h2>

            <label className="block text-sm">
              Customer
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={tradeForm.customerId}
                onChange={(e) => setTradeForm((f) => ({ ...f, customerId: e.target.value }))}
              >
                <option value="">Select customer</option>
                {(customersQuery.data || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.bushaProfileId})
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              {(['buy', 'sell'] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => onSideChange(side)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize ${
                    tradeForm.side === side ? 'bg-indigo-600 text-white' : 'border'
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Source
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={tradeForm.sourceCurrency}
                  onChange={(e) => setTradeForm((f) => ({ ...f, sourceCurrency: e.target.value }))}
                >
                  {(tradeForm.side === 'buy' ? buySourceOptions : sellSourceOptions).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Target
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={tradeForm.targetCurrency}
                  onChange={(e) => setTradeForm((f) => ({ ...f, targetCurrency: e.target.value }))}
                >
                  {(tradeForm.side === 'buy' ? buyTargetOptions : sellTargetOptions).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm">
              Amount ({tradeForm.sourceCurrency})
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={tradeForm.amount}
                onChange={(e) => setTradeForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </label>

            {tradeForm.side === 'buy' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tradeForm.autoPalmpayPayout}
                  onChange={(e) => setTradeForm((f) => ({ ...f, autoPalmpayPayout: e.target.checked }))}
                />
                Auto PalmPay payout to Busha temp bank
              </label>
            )}

            {tradeForm.side === 'sell' && (
              <label className="text-sm">
                Crypto funding
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={tradeForm.fundingMethod}
                  onChange={(e) =>
                    setTradeForm((f) => ({ ...f, fundingMethod: e.target.value as 'balance' | 'address' }))
                  }
                >
                  <option value="balance">From Busha customer balance</option>
                  <option value="address">Deposit to Busha address (on-chain)</option>
                </select>
              </label>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => previewQuoteMutation.mutate()}
                disabled={previewQuoteMutation.isPending || !tradeForm.customerId}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Preview quote
              </button>
              <button
                type="button"
                onClick={() => executeTradeMutation.mutate()}
                disabled={executeTradeMutation.isPending || !tradeForm.customerId}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
              >
                Execute {tradeForm.side}
              </button>
            </div>

            {executeTradeMutation.isError && (
              <p className="text-sm text-red-600">{(executeTradeMutation.error as Error).message}</p>
            )}

            {quotePreview && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm space-y-1">
                <p>Quote: {quotePreview.quote.id}</p>
                <p>
                  {quotePreview.quote.source_amount} {quotePreview.quote.source_currency} →{' '}
                  {quotePreview.quote.target_amount} {quotePreview.quote.target_currency}
                </p>
                <p className="text-gray-500">Expires: {quotePreview.quote.expires_at}</p>
              </div>
            )}

            {lastTrade && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm space-y-1">
                <p className="font-medium">Last trade: {lastTrade.id}</p>
                <p>Status: {lastTrade.status}</p>
                {lastTrade.payInAccountNumber && (
                  <p>
                    Paid to: {lastTrade.payInAccountName} / {lastTrade.payInAccountNumber} ({lastTrade.payInBankName})
                  </p>
                )}
                {lastTrade.cryptoDepositAddress && (
                  <p>
                    Send {lastTrade.sourceAmount} {lastTrade.sourceCurrency} ({lastTrade.cryptoDepositNetwork}) to{' '}
                    <span className="font-mono break-all">{lastTrade.cryptoDepositAddress}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-600 space-y-3">
            <h2 className="font-semibold text-gray-800">Flow guide</h2>
            <div>
              <p className="font-medium text-gray-800">Buy (NGN → crypto)</p>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>Create Busha customer with real email/phone — KYC may be required in production.</li>
                <li>Preview quote, then Execute buy.</li>
                <li>Backend creates Busha quote + transfer (temp bank).</li>
                <li>PalmPay payout sends exact NGN to Busha temp account.</li>
                <li>Refresh trade until Busha status is funds_converted.</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-gray-800">Sell (crypto → NGN → PalmPay bank)</p>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>Configure payout bank in Overview (PalmPay settlement account).</li>
                <li>Sync Busha recipient for the customer profile.</li>
                <li>Customer needs crypto balance at Busha (from a prior buy).</li>
                <li>Execute sell with funding = balance.</li>
                <li>Busha sends NGN to your configured bank (PalmPay settlement).</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {tab === 'trades' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Side</th>
                <th className="px-4 py-3 text-left">Pair</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Busha</th>
                <th className="px-4 py-3 text-left">PalmPay</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tradesQuery.data || []).map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{t.side}</td>
                  <td className="px-4 py-3">
                    {t.sourceAmount} {t.sourceCurrency} → {t.targetAmount || '?'} {t.targetCurrency}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusColor(t.status)}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{t.bushaStatus || '—'}</td>
                  <td className="px-4 py-3 text-xs">{t.palmpayStatus || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-indigo-600 text-xs"
                      onClick={() => refreshTradeMutation.mutate(t.id)}
                    >
                      Refresh
                    </button>
                  </td>
                </tr>
              ))}
              {!tradesQuery.data?.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No trades yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BushaTestPage;
