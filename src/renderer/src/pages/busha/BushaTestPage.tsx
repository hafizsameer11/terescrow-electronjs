import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import {
  createBushaCustomer,
  executeBushaBuy,
  executeBushaSell,
  executeBushaCryptoReceive,
  executeBushaCryptoSend,
  getBushaCustomer,
  getBushaCustomerQuote,
  getBushaCustomerTransfer,
  getBushaCustomerWallet,
  getBushaStatus,
  getNetworkOptions,
  listBushaCustomerRecipients,
  listBushaCustomerTransfers,
  listBushaCustomers,
  listBushaTrades,
  previewBushaQuote,
  prepareBushaSellPalmpayPayout,
  refreshBushaTrade,
  saveBushaSettings,
  submitBushaCustomerKyc,
  syncBushaRecipient,
  verifyBushaCustomer,
  type BushaCustomerDetail,
  type BushaKycPayload,
  type BushaQuotePreview,
  type BushaSellPalmpayPayoutPrepare,
  type BushaTrade,
  type BushaTransferRemote,
  type BushaWalletResponse,
} from '@renderer/api/admin/busha';
import { getPalmpayBanks, verifyPalmpayBankAccount } from '@renderer/api/admin/merchants';
import { Btn, Card, CopyBtn, DepositAddressCard, Field, JsonBlock, StatusBadge, inputClass, selectClass } from './bushaTestUi';

type Tab = 'dashboard' | 'customers' | 'wallet' | 'trade' | 'activity';
type TradeMode = 'buy' | 'sell' | 'receive' | 'send';

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function transferPayInAddress(transfer: BushaTransferRemote): string | null {
  const payIn = transfer.pay_in as { address?: string } | undefined;
  return payIn?.address?.trim() || null;
}

function transferPayInNetwork(transfer: BushaTransferRemote): string | null {
  const payIn = transfer.pay_in as { network?: string } | undefined;
  return payIn?.network?.trim() || null;
}

function tradeHasDepositAddress(trade: BushaTrade): boolean {
  return Boolean(trade.cryptoDepositAddress?.trim());
}

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Connection & settings' },
  { id: 'customers', label: 'Customers', hint: 'Create & KYC' },
  { id: 'wallet', label: 'Wallet', hint: 'Live Busha balances' },
  { id: 'trade', label: 'Trade', hint: 'Buy · Sell · Receive · Send' },
  { id: 'activity', label: 'Activity', hint: 'Trades & transfers' },
];

const BushaTestPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [tradeMode, setTradeMode] = useState<TradeMode>('receive');
  const [lastResult, setLastResult] = useState<BushaTrade | null>(null);
  const [quotePreview, setQuotePreview] = useState<BushaQuotePreview | null>(null);
  const [lookupTransferId, setLookupTransferId] = useState('');
  const [lookupQuoteId, setLookupQuoteId] = useState('');
  const [lookupResult, setLookupResult] = useState<unknown>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [sellPayoutMode, setSellPayoutMode] = useState<'dashboard_bank' | 'palmpay_temp' | 'customer_balance'>(
    'palmpay_temp'
  );
  const [preparedPalmpayPayout, setPreparedPalmpayPayout] = useState<BushaSellPalmpayPayoutPrepare | null>(null);
  const [walletFilter, setWalletFilter] = useState('');
  const [kycMessage, setKycMessage] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<BushaCustomerDetail | null>(null);

  const [settingsForm, setSettingsForm] = useState({
    payoutBankCode: '',
    payoutBankName: '',
    payoutAccountNumber: '',
    payoutAccountName: '',
    payoutRecipientId: '',
    sellPayoutMode: 'palmpay_temp' as 'palmpay_temp' | 'dashboard_bank',
    isActive: true,
  });

  const [customerForm, setCustomerForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '+234',
  });

  const [kycForm, setKycForm] = useState({
    documentType: 'national-id' as BushaKycPayload['documentType'],
    documentNumber: '',
    birthDate: '15-06-1990',
    selfieBase64: '',
    documentImageBase64: '',
  });

  const [tradeForm, setTradeForm] = useState({
    sourceCurrency: 'NGN',
    targetCurrency: 'USDT',
    amount: '5000',
    fundingMethod: 'balance' as 'balance' | 'address',
    network: 'TRX',
    autoPalmpayPayout: true,
    destinationAddress: '',
    memo: '',
  });

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

  const walletQuery = useQuery({
    queryKey: ['busha-wallet', token, selectedCustomerId, walletFilter],
    queryFn: () => getBushaCustomerWallet(token!, selectedCustomerId, walletFilter || undefined),
    enabled: !!token && !!selectedCustomerId && (tab === 'wallet' || tab === 'dashboard' || tab === 'trade'),
  });

  const transfersQuery = useQuery({
    queryKey: ['busha-transfers', token, selectedCustomerId],
    queryFn: () => listBushaCustomerTransfers(token!, selectedCustomerId, { limit: 20 }),
    enabled: !!token && !!selectedCustomerId && tab === 'activity',
  });

  const recipientsQuery = useQuery({
    queryKey: ['busha-recipients', token, selectedCustomerId],
    queryFn: () => listBushaCustomerRecipients(token!, selectedCustomerId),
    enabled: !!token && !!selectedCustomerId && tab === 'activity',
  });

  const banksQuery = useQuery({
    queryKey: ['palmpay-banks-busha', token],
    queryFn: () => getPalmpayBanks(token!),
    enabled: !!token && tab === 'dashboard',
  });

  const currencies = statusQuery.data?.currencies;
  const selectedCustomer = customersQuery.data?.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    if (!selectedCustomerId && customersQuery.data?.length) {
      setSelectedCustomerId(customersQuery.data[0].id);
    }
  }, [customersQuery.data, selectedCustomerId]);

  useEffect(() => {
    const s = statusQuery.data?.settings;
    if (s) {
      setSettingsForm({
        payoutBankCode: s.payoutBankCode || '',
        payoutBankName: s.payoutBankName || '',
        payoutAccountNumber: s.payoutAccountNumber || '',
        payoutAccountName: s.payoutAccountName || '',
        payoutRecipientId: s.payoutRecipientId || '',
        sellPayoutMode: (s.sellPayoutMode === 'dashboard_bank' ? 'dashboard_bank' : 'palmpay_temp') as
          | 'palmpay_temp'
          | 'dashboard_bank',
        isActive: s.isActive !== false,
      });
    }
  }, [statusQuery.data?.settings]);

  useEffect(() => {
    if (tradeMode === 'buy') {
      setTradeForm((f) => ({ ...f, sourceCurrency: 'NGN', targetCurrency: 'USDT', network: 'TRX' }));
    } else if (tradeMode === 'sell') {
      setTradeForm((f) => ({ ...f, sourceCurrency: 'USDT', targetCurrency: 'NGN', network: 'TRX' }));
    } else if (tradeMode === 'receive') {
      setTradeForm((f) => ({ ...f, sourceCurrency: 'USDT', targetCurrency: 'USDT', network: 'TRX', amount: '10' }));
    } else {
      setTradeForm((f) => ({ ...f, sourceCurrency: 'USDT', targetCurrency: 'USDT', network: 'TRX', amount: '5' }));
    }
    setQuotePreview(null);
    setPreparedPalmpayPayout(null);
  }, [tradeMode]);

  useEffect(() => {
    setPreparedPalmpayPayout(null);
    setQuotePreview(null);
  }, [tradeForm.sourceCurrency, tradeForm.targetCurrency, tradeForm.amount, tradeForm.fundingMethod, tradeForm.network, sellPayoutMode]);

  const cryptoCurrency = tradeMode === 'buy' ? tradeForm.targetCurrency : tradeForm.sourceCurrency;
  const networkOptions = useMemo(
    () => getNetworkOptions(currencies, cryptoCurrency),
    [currencies, cryptoCurrency]
  );

  useEffect(() => {
    if (networkOptions.length && !networkOptions.includes(tradeForm.network)) {
      setTradeForm((f) => ({ ...f, network: networkOptions[0] }));
    }
  }, [networkOptions, tradeForm.network]);

  const pendingDeposits = useMemo(
    () =>
      (tradesQuery.data || []).filter(
        (t) =>
          tradeHasDepositAddress(t) &&
          (t.status === 'awaiting_crypto_deposit' || t.bushaStatus === 'pending')
      ),
    [tradesQuery.data]
  );

  const selectedTrade = useMemo(
    () => (tradesQuery.data || []).find((t) => t.id === selectedTradeId) ?? null,
    [tradesQuery.data, selectedTradeId]
  );

  useEffect(() => {
    if (tab !== 'activity' || selectedTradeId || !pendingDeposits.length) return;
    setSelectedTradeId(pendingDeposits[0].id);
    if (pendingDeposits[0].bushaTransferId) setLookupTransferId(pendingDeposits[0].bushaTransferId);
  }, [tab, pendingDeposits, selectedTradeId]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['busha-status'] });
    queryClient.invalidateQueries({ queryKey: ['busha-customers'] });
    queryClient.invalidateQueries({ queryKey: ['busha-trades'] });
    queryClient.invalidateQueries({ queryKey: ['busha-wallet'] });
    queryClient.invalidateQueries({ queryKey: ['busha-transfers'] });
    queryClient.invalidateQueries({ queryKey: ['busha-recipients'] });
  };

  const refreshCustomerMutation = useMutation({
    mutationFn: () => getBushaCustomer(token!, selectedCustomerId),
    onSuccess: (data) => {
      setCustomerDetail(data);
      invalidateAll();
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: () => createBushaCustomer(token!, customerForm),
    onSuccess: (c) => {
      invalidateAll();
      setSelectedCustomerId(c.id);
      setCustomerForm({ email: '', firstName: '', lastName: '', phone: '+234' });
      setTab('customers');
    },
  });

  const kycPayload = (): BushaKycPayload => ({
    documentType: kycForm.documentType,
    documentNumber: kycForm.documentNumber,
    selfieBase64: kycForm.selfieBase64,
    documentImageBase64: kycForm.documentImageBase64 || undefined,
    birthDate: kycForm.birthDate,
  });

  const submitKycMutation = useMutation({
    mutationFn: () => submitBushaCustomerKyc(token!, selectedCustomerId, kycPayload()),
    onSuccess: () => {
      setKycMessage('KYC uploaded.');
      invalidateAll();
    },
    onError: (e: Error) => setKycMessage(e.message),
  });

  const verifyKycMutation = useMutation({
    mutationFn: () => verifyBushaCustomer(token!, selectedCustomerId, kycPayload()),
    onSuccess: () => {
      setKycMessage('Verification submitted — refresh until active.');
      invalidateAll();
    },
    onError: (e: Error) => setKycMessage(e.message),
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
    mutationFn: () => syncBushaRecipient(token!, selectedCustomer!.bushaProfileId),
    onSuccess: (data: any) => {
      if (data?.settings?.payoutRecipientId) {
        setSettingsForm((f) => ({ ...f, payoutRecipientId: data.settings.payoutRecipientId }));
      }
      invalidateAll();
    },
  });

  const previewQuoteMutation = useMutation({
    mutationFn: () => {
      const isBuy = tradeMode === 'buy';
      const isSell = tradeMode === 'sell';
      return previewBushaQuote(token!, {
        customerId: selectedCustomerId,
        side: isBuy ? 'buy' : 'sell',
        sourceCurrency: tradeForm.sourceCurrency,
        targetCurrency: tradeForm.targetCurrency,
        amount: tradeForm.amount,
        fundingMethod: isBuy ? 'temporary_bank_account' : isSell && tradeForm.fundingMethod === 'address' ? 'address' : 'balance',
        network: isSell && tradeForm.fundingMethod === 'address' ? tradeForm.network : undefined,
        payoutToBalance: isSell && sellPayoutMode === 'customer_balance',
        payoutRecipientId:
          isSell && sellPayoutMode === 'palmpay_temp'
            ? preparedPalmpayPayout?.bushaRecipient.id
            : undefined,
      });
    },
    onSuccess: setQuotePreview,
  });

  const preparePalmpayPayoutMutation = useMutation({
    mutationFn: () =>
      prepareBushaSellPalmpayPayout(token!, {
        customerId: selectedCustomerId,
        sourceCurrency: tradeForm.sourceCurrency,
        targetCurrency: tradeForm.targetCurrency,
        sourceAmount: tradeForm.amount,
        fundingMethod: tradeForm.fundingMethod,
        network: tradeForm.fundingMethod === 'address' ? tradeForm.network : undefined,
      }),
    onSuccess: (data) => {
      setPreparedPalmpayPayout(data);
      setQuotePreview({ quote: data.payoutQuote, customer: selectedCustomer as any });
    },
  });

  const executeTradeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomerId) throw new Error('Select a customer first');
      if (tradeMode === 'buy') {
        return executeBushaBuy(token!, {
          customerId: selectedCustomerId,
          sourceCurrency: tradeForm.sourceCurrency,
          targetCurrency: tradeForm.targetCurrency,
          sourceAmount: tradeForm.amount,
          autoPalmpayPayout: tradeForm.autoPalmpayPayout,
        });
      }
      if (tradeMode === 'sell') {
        if (sellPayoutMode === 'palmpay_temp' && !preparedPalmpayPayout?.bushaRecipient.id) {
          throw new Error('Prepare PalmPay payout account first.');
        }
        return executeBushaSell(token!, {
          customerId: selectedCustomerId,
          sourceCurrency: tradeForm.sourceCurrency,
          targetCurrency: tradeForm.targetCurrency,
          sourceAmount: tradeForm.amount,
          fundingMethod: tradeForm.fundingMethod,
          network: tradeForm.fundingMethod === 'address' ? tradeForm.network : undefined,
          ...(sellPayoutMode === 'palmpay_temp' && preparedPalmpayPayout
            ? {
                payoutRecipientId: preparedPalmpayPayout.bushaRecipient.id,
                palmpayPayoutOrderId: preparedPalmpayPayout.palmpay.merchantOrderId,
                palmpayPayoutOrderNo: preparedPalmpayPayout.palmpay.orderNo,
              }
            : {}),
        });
      }
      if (tradeMode === 'receive') {
        return executeBushaCryptoReceive(token!, {
          customerId: selectedCustomerId,
          currency: tradeForm.sourceCurrency,
          amount: tradeForm.amount,
          network: tradeForm.network,
        });
      }
      return executeBushaCryptoSend(token!, {
        customerId: selectedCustomerId,
        currency: tradeForm.sourceCurrency,
        amount: tradeForm.amount,
        destinationAddress: tradeForm.destinationAddress,
        destinationNetwork: tradeForm.network,
        memo: tradeForm.memo || undefined,
      });
    },
    onSuccess: (trade) => {
      setLastResult(trade);
      setSelectedTradeId(trade.id);
      if (trade.bushaTransferId) setLookupTransferId(trade.bushaTransferId);
      invalidateAll();
      setTab('activity');
    },
  });

  const refreshTradeMutation = useMutation({
    mutationFn: (tradeId: string) => refreshBushaTrade(token!, tradeId),
    onSuccess: (trade) => {
      if (selectedTradeId === trade.id) setLastResult(trade);
      invalidateAll();
    },
  });

  const lookupTransferMutation = useMutation({
    mutationFn: (transferId?: string) =>
      getBushaCustomerTransfer(token!, selectedCustomerId, (transferId ?? lookupTransferId).trim()),
    onSuccess: setLookupResult,
  });

  const lookupQuoteMutation = useMutation({
    mutationFn: () => getBushaCustomerQuote(token!, selectedCustomerId, lookupQuoteId.trim()),
    onSuccess: setLookupResult,
  });

  const renderWalletCards = (wallet?: BushaWalletResponse) => {
    const balances = wallet?.balances ?? [];
    const sorted = [...balances].sort((a, b) => {
      const aAmt = parseFloat(a.available?.amount || '0');
      const bAmt = parseFloat(b.available?.amount || '0');
      if (bAmt !== aAmt) return bAmt - aAmt;
      return a.currency.localeCompare(b.currency);
    });

    if (!selectedCustomerId) {
      return <p className="text-sm text-slate-500">Select a customer to view Busha wallet balances.</p>;
    }
    if (walletQuery.isLoading) return <p className="text-sm text-slate-500">Loading wallet from Busha…</p>;
    if (walletQuery.isError) {
      return <p className="text-sm text-red-600">{(walletQuery.error as Error).message}</p>;
    }
    if (!sorted.length) return <p className="text-sm text-slate-500">No balances returned.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {sorted.map((b) => {
          const available = parseFloat(b.available?.amount || '0');
          const pending = parseFloat(b.pending?.amount || '0');
          const isCrypto = b.type === 'crypto';
          return (
            <div
              key={b.id}
              className={`rounded-xl border p-4 ${isCrypto ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/50'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{b.currency}</p>
                  <p className="text-xs text-slate-500">{b.name || b.type}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                  {b.type || '—'}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900 tabular-nums">{available.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Available · pending {pending.toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white">
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold tracking-tight">Busha Test Console</h1>
          <p className="text-indigo-100 mt-2 max-w-3xl text-sm leading-relaxed">
            Full integration test lab: customer KYC, live wallet balances, buy/sell ramps, crypto receive (TRC/USDT),
            crypto send, and transfer inspection. Uses your backend <code className="bg-white/10 px-1 rounded">BUSHA_ENVIRONMENT</code>.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Global customer bar */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 flex flex-col lg:flex-row lg:items-end gap-4 bg-gradient-to-r from-white to-indigo-50/30">
            <div className="flex-1">
              <Field label="Active test customer" hint="All wallet, trade, and lookup actions use this customer">
                <select
                  className={selectClass}
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">Select customer</option>
                  {(customersQuery.data || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} · {c.email} · {c.status}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {selectedCustomer && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge status={selectedCustomer.status} />
                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                  {selectedCustomer.bushaProfileId}
                </span>
                <Btn variant="secondary" onClick={() => refreshCustomerMutation.mutate()} disabled={!selectedCustomerId}>
                  Refresh profile
                </Btn>
                <Btn variant="ghost" onClick={invalidateAll}>
                  Reload all
                </Btn>
              </div>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-200'
              }`}
            >
              <span>{t.label}</span>
              <span className={`block text-[10px] mt-0.5 ${tab === t.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                {t.hint}
              </span>
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Busha API" subtitle="Connection status">
              <div className="space-y-2 text-sm">
                <p>
                  Configured:{' '}
                  <strong className={statusQuery.data?.busha.configured ? 'text-emerald-700' : 'text-red-600'}>
                    {statusQuery.data?.busha.configured ? 'Yes' : 'No'}
                  </strong>
                </p>
                <p className="text-slate-600">Environment: {statusQuery.data?.busha.environment}</p>
                <p className="text-slate-600 break-all">Base: {statusQuery.data?.busha.baseUrl}</p>
                <p className="text-slate-600">Customers: {statusQuery.data?.stats.customerCount} · Trades: {statusQuery.data?.stats.tradeCount}</p>
                {statusQuery.data?.busha.environment === 'production' && (
                  <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                    Production — real money. Test with small amounts only.
                  </p>
                )}
              </div>
            </Card>

            <Card title="PalmPay merchant" subtitle="Used for auto-funding Busha buys">
              <div className="space-y-2 text-sm">
                <p>
                  Configured:{' '}
                  <strong className={statusQuery.data?.palmpay.configured ? 'text-emerald-700' : 'text-red-600'}>
                    {statusQuery.data?.palmpay.configured ? 'Yes' : 'No'}
                  </strong>
                </p>
                {statusQuery.data?.palmpay.balance ? (
                  <p>Available: ₦{statusQuery.data.palmpay.balance.availableBalanceNgn.toLocaleString()}</p>
                ) : (
                  <p className="text-red-600">{statusQuery.data?.palmpay.balanceError || 'Balance unavailable'}</p>
                )}
              </div>
            </Card>

            <Card title="Sell payout bank" subtitle="Where Busha sends NGN after sell" className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Sell settlement mode" hint="App sells credit user NGN wallet; this chooses where Busha sends platform NGN">
                  <select
                    className={selectClass}
                    value={settingsForm.sellPayoutMode}
                    onChange={(e) =>
                      setSettingsForm((f) => ({
                        ...f,
                        sellPayoutMode: e.target.value as 'palmpay_temp' | 'dashboard_bank',
                      }))
                    }
                  >
                    <option value="palmpay_temp">PalmPay temp account</option>
                    <option value="dashboard_bank">Dashboard bank account</option>
                  </select>
                </Field>
                <Field label="Busha app integration">
                  <select
                    className={selectClass}
                    value={settingsForm.isActive ? '1' : '0'}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, isActive: e.target.value === '1' }))}
                  >
                    <option value="1">Active (app uses Busha)</option>
                    <option value="0">Inactive</option>
                  </select>
                </Field>
                <Field label="Bank">
                  <select
                    className={selectClass}
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
                </Field>
                <Field label="Account number">
                  <input
                    className={inputClass}
                    value={settingsForm.payoutAccountNumber}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, payoutAccountNumber: e.target.value }))}
                  />
                </Field>
                <Field label="Account name">
                  <input
                    className={inputClass}
                    value={settingsForm.payoutAccountName}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, payoutAccountName: e.target.value }))}
                  />
                </Field>
                <Field label="Busha recipient ID">
                  <input className={`${inputClass} bg-slate-50`} value={settingsForm.payoutRecipientId} readOnly />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Btn variant="secondary" onClick={() => verifyBankMutation.mutate()} disabled={verifyBankMutation.isPending}>
                  Verify bank
                </Btn>
                <Btn variant="primary" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
                  Save settings
                </Btn>
                <Btn
                  variant="secondary"
                  onClick={() => selectedCustomer && syncRecipientMutation.mutate()}
                  disabled={!selectedCustomer || syncRecipientMutation.isPending}
                >
                  Sync Busha recipient
                </Btn>
              </div>
            </Card>

            <Card title="Quick wallet snapshot" subtitle="Live balances for selected customer" className="lg:col-span-2">
              {renderWalletCards(walletQuery.data)}
            </Card>
          </div>
        )}

        {tab === 'customers' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card title="Create customer">
              {(['email', 'firstName', 'lastName', 'phone'] as const).map((field) => (
                <Field key={field} label={field}>
                  <input
                    className={inputClass}
                    value={customerForm[field]}
                    onChange={(e) => setCustomerForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </Field>
              ))}
              <Btn className="mt-4 w-full" onClick={() => createCustomerMutation.mutate()} disabled={createCustomerMutation.isPending}>
                Create on Busha
              </Btn>
            </Card>

            <Card title="KYC & verification" subtitle="Required before trading in production">
              <div className="space-y-3">
                <Field label="Document type">
                  <select
                    className={selectClass}
                    value={kycForm.documentType}
                    onChange={(e) =>
                      setKycForm((f) => ({ ...f, documentType: e.target.value as BushaKycPayload['documentType'] }))
                    }
                  >
                    <option value="national-id">National ID (NIN)</option>
                    <option value="passport">Passport</option>
                    <option value="drivers-license">Driver&apos;s license</option>
                  </select>
                </Field>
                <Field label="Document number">
                  <input
                    className={inputClass}
                    value={kycForm.documentNumber}
                    onChange={(e) => setKycForm((f) => ({ ...f, documentNumber: e.target.value }))}
                  />
                </Field>
                <Field label="Birth date (DD-MM-YYYY)">
                  <input
                    className={inputClass}
                    value={kycForm.birthDate}
                    onChange={(e) => setKycForm((f) => ({ ...f, birthDate: e.target.value }))}
                  />
                </Field>
                <Field label="Selfie">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const selfieBase64 = await readFileAsBase64(file);
                      setKycForm((f) => ({ ...f, selfieBase64 }));
                    }}
                  />
                </Field>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Btn variant="secondary" onClick={() => submitKycMutation.mutate()} disabled={!selectedCustomerId}>
                    Upload KYC
                  </Btn>
                  <Btn variant="primary" onClick={() => verifyKycMutation.mutate()} disabled={!selectedCustomerId}>
                    Upload + Verify
                  </Btn>
                </div>
                {kycMessage && <p className="text-sm text-slate-600">{kycMessage}</p>}
              </div>
            </Card>

            <Card title="Live profile" subtitle="From Busha API">
              {!customerDetail && !refreshCustomerMutation.isPending && (
                <p className="text-sm text-slate-500">Click Refresh profile on the customer bar.</p>
              )}
              {customerDetail?.bushaRemote && (
                <div className="space-y-2 text-sm">
                  <p>
                    Status: <StatusBadge status={customerDetail.bushaRemote.status || 'unknown'} />
                  </p>
                  <p>Level: {customerDetail.bushaRemote.level ?? '—'}</p>
                  <p>Deposit: {customerDetail.bushaRemote.deposit ? 'Yes' : 'No'}</p>
                  <p>Payout: {customerDetail.bushaRemote.payout ? 'Yes' : 'No'}</p>
                  <p>KYC: {customerDetail.bushaRemote.kyc_status || '—'}</p>
                </div>
              )}
            </Card>

            <Card title="All customers" className="xl:col-span-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Busha ID</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Trades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(customersQuery.data || []).map((c) => (
                      <tr
                        key={c.id}
                        className={`border-b cursor-pointer hover:bg-indigo-50/50 ${c.id === selectedCustomerId ? 'bg-indigo-50' : ''}`}
                        onClick={() => setSelectedCustomerId(c.id)}
                      >
                        <td className="py-3 pr-4">
                          <div className="font-medium">{c.firstName} {c.lastName}</div>
                          <div className="text-xs text-slate-500">{c.email}</div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">{c.bushaProfileId}</td>
                        <td className="py-3 pr-4"><StatusBadge status={c.status} /></td>
                        <td className="py-3">{c._count?.trades ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'wallet' && (
          <div className="space-y-6">
            <Card title="Busha wallet balances" subtitle="Live from GET /v1/balances with customer profile">
              <div className="flex flex-wrap gap-3 mb-4">
                <Field label="Filter by currency (optional)">
                  <select className={selectClass} value={walletFilter} onChange={(e) => setWalletFilter(e.target.value)}>
                    <option value="">All currencies</option>
                    {(currencies?.crypto ?? []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {(currencies?.fiat ?? []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <div className="flex items-end">
                  <Btn variant="secondary" onClick={() => walletQuery.refetch()} disabled={walletQuery.isFetching}>
                    {walletQuery.isFetching ? 'Refreshing…' : 'Refresh wallet'}
                  </Btn>
                </div>
              </div>
              {walletQuery.data?.summary && (
                <p className="text-xs text-slate-500 mb-4">
                  {walletQuery.data.summary.total} accounts · {walletQuery.data.summary.cryptoCount} crypto ·{' '}
                  {walletQuery.data.summary.fiatCount} fiat · {walletQuery.data.summary.nonZeroCount} with balance
                </p>
              )}
              {renderWalletCards(walletQuery.data)}
            </Card>
          </div>
        )}

        {tab === 'trade' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card title="Operation" subtitle="Pick what you want to test" className="xl:col-span-1">
              <div className="grid grid-cols-2 gap-2">
                {(['buy', 'sell', 'receive', 'send'] as TradeMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTradeMode(mode)}
                    className={`p-3 rounded-xl border text-sm font-medium capitalize transition ${
                      tradeMode === mode
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-slate-500 space-y-1">
                {tradeMode === 'buy' && <p>NGN → crypto via PalmPay → Busha temp bank</p>}
                {tradeMode === 'sell' && <p>Crypto → NGN payout (PalmPay temp, dashboard bank, or customer balance)</p>}
                {tradeMode === 'receive' && <p>Generate deposit address (e.g. USDT on TRX / TRC20)</p>}
                {tradeMode === 'send' && <p>Send crypto from Busha balance to external address</p>}
              </div>
            </Card>

            <Card title={`Execute ${tradeMode}`} className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(tradeMode === 'buy' || tradeMode === 'sell') && (
                  <>
                    <Field label="Source currency">
                      <select
                        className={selectClass}
                        value={tradeForm.sourceCurrency}
                        onChange={(e) => setTradeForm((f) => ({ ...f, sourceCurrency: e.target.value }))}
                      >
                        {(tradeMode === 'buy' ? currencies?.fiat : currencies?.crypto)?.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Target currency">
                      <select
                        className={selectClass}
                        value={tradeForm.targetCurrency}
                        onChange={(e) => setTradeForm((f) => ({ ...f, targetCurrency: e.target.value }))}
                      >
                        {(tradeMode === 'buy' ? currencies?.crypto : currencies?.fiat)?.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {(tradeMode === 'receive' || tradeMode === 'send') && (
                  <>
                    <Field label="Crypto currency">
                      <select
                        className={selectClass}
                        value={tradeForm.sourceCurrency}
                        onChange={(e) => setTradeForm((f) => ({ ...f, sourceCurrency: e.target.value, targetCurrency: e.target.value }))}
                      >
                        {(currencies?.crypto ?? []).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Network" hint="USDT + TRX = TRC20">
                      <select
                        className={selectClass}
                        value={tradeForm.network}
                        onChange={(e) => setTradeForm((f) => ({ ...f, network: e.target.value }))}
                      >
                        {networkOptions.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                <Field label="Amount">
                  <input
                    className={inputClass}
                    value={tradeForm.amount}
                    onChange={(e) => setTradeForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </Field>

                {tradeMode === 'buy' && (
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      type="checkbox"
                      checked={tradeForm.autoPalmpayPayout}
                      onChange={(e) => setTradeForm((f) => ({ ...f, autoPalmpayPayout: e.target.checked }))}
                    />
                    Auto PalmPay payout to Busha temp bank
                  </label>
                )}

                {tradeMode === 'sell' && (
                  <Field label="NGN payout destination" hint="PalmPay temp = same virtual account flow as user deposit">
                    <select
                      className={selectClass}
                      value={sellPayoutMode}
                      onChange={(e) =>
                        setSellPayoutMode(e.target.value as 'dashboard_bank' | 'palmpay_temp' | 'customer_balance')
                      }
                    >
                      <option value="palmpay_temp">PalmPay temp account (auto-mapped to Busha)</option>
                      <option value="dashboard_bank">Dashboard payout bank</option>
                      <option value="customer_balance">Customer Busha NGN balance</option>
                    </select>
                  </Field>
                )}

                {tradeMode === 'sell' && (
                  <Field label="Crypto funding">
                    <select
                      className={selectClass}
                      value={tradeForm.fundingMethod}
                      onChange={(e) =>
                        setTradeForm((f) => ({ ...f, fundingMethod: e.target.value as 'balance' | 'address' }))
                      }
                    >
                      <option value="balance">From Busha balance</option>
                      <option value="address">Deposit to generated address</option>
                    </select>
                  </Field>
                )}

                {tradeMode === 'sell' && tradeForm.fundingMethod === 'address' && (
                  <Field label="Deposit network">
                    <select
                      className={selectClass}
                      value={tradeForm.network}
                      onChange={(e) => setTradeForm((f) => ({ ...f, network: e.target.value }))}
                    >
                      {networkOptions.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                )}

                {tradeMode === 'send' && (
                  <>
                    <div className="md:col-span-2">
                      <Field label="Destination address">
                        <input
                          className={inputClass}
                          value={tradeForm.destinationAddress}
                          onChange={(e) => setTradeForm((f) => ({ ...f, destinationAddress: e.target.value }))}
                          placeholder="External wallet address"
                        />
                      </Field>
                    </div>
                    <div className="md:col-span-2">
                      <Field label="Memo (optional)">
                        <input
                          className={inputClass}
                          value={tradeForm.memo}
                          onChange={(e) => setTradeForm((f) => ({ ...f, memo: e.target.value }))}
                        />
                      </Field>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                {tradeMode === 'sell' && sellPayoutMode === 'palmpay_temp' && (
                  <Btn
                    variant="secondary"
                    onClick={() => preparePalmpayPayoutMutation.mutate()}
                    disabled={!selectedCustomerId || preparePalmpayPayoutMutation.isPending}
                  >
                    {preparePalmpayPayoutMutation.isPending ? 'Preparing…' : '1. Prepare PalmPay account'}
                  </Btn>
                )}
                {(tradeMode === 'buy' || tradeMode === 'sell') && (
                  <Btn variant="secondary" onClick={() => previewQuoteMutation.mutate()} disabled={!selectedCustomerId}>
                    {tradeMode === 'sell' && sellPayoutMode === 'palmpay_temp' ? '2. Preview quote' : 'Preview quote'}
                  </Btn>
                )}
                <Btn
                  variant="primary"
                  onClick={() => executeTradeMutation.mutate()}
                  disabled={
                    !selectedCustomerId ||
                    executeTradeMutation.isPending ||
                    (tradeMode === 'sell' && sellPayoutMode === 'palmpay_temp' && !preparedPalmpayPayout)
                  }
                >
                  {tradeMode === 'sell' && sellPayoutMode === 'palmpay_temp' ? '3. Execute sell' : `Execute ${tradeMode}`}
                </Btn>
              </div>

              {preparePalmpayPayoutMutation.isError && (
                <p className="text-sm text-red-600 mt-3">{(preparePalmpayPayoutMutation.error as Error).message}</p>
              )}

              {executeTradeMutation.isError && (
                <p className="text-sm text-red-600 mt-3">{(executeTradeMutation.error as Error).message}</p>
              )}

              {preparedPalmpayPayout && tradeMode === 'sell' && sellPayoutMode === 'palmpay_temp' && (
                <div className="mt-4 space-y-3">
                  <DepositAddressCard
                    title="PalmPay payout account (NGN lands here after sell)"
                    address={preparedPalmpayPayout.palmpay.virtualAccount.accountNumber}
                    network={preparedPalmpayPayout.palmpay.virtualAccount.bankName}
                    amount={String(preparedPalmpayPayout.palmpay.amountNgn)}
                    currency="NGN"
                    transferId={preparedPalmpayPayout.palmpay.merchantOrderId}
                  />
                  <p className="text-xs text-slate-600">
                    Busha recipient: <span className="font-mono">{preparedPalmpayPayout.bushaRecipient.id}</span>
                    {' · '}
                    Est. quote {preparedPalmpayPayout.payoutQuote.source_amount}{' '}
                    {preparedPalmpayPayout.payoutQuote.source_currency} → {preparedPalmpayPayout.payoutQuote.target_amount}{' '}
                    {preparedPalmpayPayout.payoutQuote.target_currency}
                  </p>
                </div>
              )}

              {quotePreview && tradeMode === 'sell' && (
                <div className="mt-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 text-sm text-indigo-950">
                  <p className="font-medium">Where the NGN goes</p>
                  <p className="mt-1">
                    {sellPayoutMode === 'palmpay_temp' && preparedPalmpayPayout
                      ? `PalmPay temp → ${preparedPalmpayPayout.palmpay.virtualAccount.bankName} · ${preparedPalmpayPayout.palmpay.virtualAccount.accountNumber}`
                      : sellPayoutMode === 'dashboard_bank' && settingsForm.payoutRecipientId
                        ? `Dashboard bank → ${settingsForm.payoutBankName || settingsForm.payoutBankCode} · ${settingsForm.payoutAccountNumber}`
                        : sellPayoutMode === 'customer_balance'
                          ? 'Customer Busha NGN balance (Wallet tab)'
                          : 'No payout configured — set Dashboard bank or use PalmPay temp mode'}
                  </p>
                  {tradeForm.fundingMethod === 'balance' && (
                    <p className="mt-1 text-indigo-800">
                      Crypto is taken from the customer&apos;s Busha balance — no crypto deposit address needed.
                    </p>
                  )}
                </div>
              )}

              {quotePreview && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm">
                  <p className="font-medium">Quote {quotePreview.quote.id}</p>
                  <p>
                    {quotePreview.quote.source_amount} {quotePreview.quote.source_currency} →{' '}
                    {quotePreview.quote.target_amount} {quotePreview.quote.target_currency}
                  </p>
                </div>
              )}

              {lastResult?.cryptoDepositAddress &&
                (tradeMode === 'receive' ||
                  (tradeMode === 'sell' && tradeForm.fundingMethod === 'address' && lastResult.side === 'sell')) && (
                <div className="mt-4">
                  <DepositAddressCard
                    address={lastResult.cryptoDepositAddress}
                    network={lastResult.cryptoDepositNetwork}
                    amount={lastResult.sourceAmount}
                    currency={lastResult.sourceCurrency}
                    expiresAt={lastResult.payInExpiresAt}
                    transferId={lastResult.bushaTransferId}
                  />
                </div>
              )}
            </Card>

            <Card title="Wallet before trade" className="xl:col-span-3">
              {renderWalletCards(walletQuery.data)}
            </Card>
          </div>
        )}

        {tab === 'activity' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {pendingDeposits.length > 0 && (
              <Card
                title="Pending deposit addresses"
                subtitle="Send the exact amount to these addresses — wrong amount may fail on Busha"
                className="xl:col-span-2"
              >
                <div className="space-y-3">
                  {pendingDeposits.map((t) => (
                    <DepositAddressCard
                      key={t.id}
                      address={t.cryptoDepositAddress!}
                      network={t.cryptoDepositNetwork}
                      amount={t.sourceAmount}
                      currency={t.sourceCurrency}
                      expiresAt={t.payInExpiresAt}
                      transferId={t.bushaTransferId}
                      compact
                    />
                  ))}
                </div>
              </Card>
            )}

            {(selectedTrade?.cryptoDepositAddress || lastResult?.cryptoDepositAddress) && (
              <Card title="Selected trade deposit" subtitle="Full deposit instructions" className="xl:col-span-2">
                <DepositAddressCard
                  address={(selectedTrade ?? lastResult)!.cryptoDepositAddress!}
                  network={(selectedTrade ?? lastResult)!.cryptoDepositNetwork}
                  amount={(selectedTrade ?? lastResult)!.sourceAmount}
                  currency={(selectedTrade ?? lastResult)!.sourceCurrency}
                  expiresAt={(selectedTrade ?? lastResult)!.payInExpiresAt}
                  transferId={(selectedTrade ?? lastResult)!.bushaTransferId}
                />
              </Card>
            )}

            <Card title="Local trade log" subtitle="Orchestration records in your DB" className="xl:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-2 pr-3">Time</th>
                      <th className="py-2 pr-3">Side</th>
                      <th className="py-2 pr-3">Pair</th>
                      <th className="py-2 pr-3">Deposit</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Busha</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tradesQuery.data || []).map((t) => {
                      const hasDeposit = tradeHasDepositAddress(t);
                      const isSelected = selectedTradeId === t.id;
                      return (
                        <React.Fragment key={t.id}>
                          <tr
                            className={`border-b hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/60' : ''}`}
                          >
                            <td className="py-2 pr-3 text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                            <td className="py-2 pr-3 capitalize">{t.side}</td>
                            <td className="py-2 pr-3">
                              {t.sourceAmount} {t.sourceCurrency} → {t.targetAmount || '?'} {t.targetCurrency}
                            </td>
                            <td className="py-2 pr-3">
                              {hasDeposit ? (
                                <span className="text-xs text-emerald-700 font-medium">Yes</span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-2 pr-3"><StatusBadge status={t.status} /></td>
                            <td className="py-2 pr-3 text-xs font-mono">{t.bushaStatus || '—'}</td>
                            <td className="py-2">
                              <div className="flex flex-wrap gap-1">
                                {hasDeposit && (
                                  <Btn
                                    variant="ghost"
                                    className="!px-2 !py-1"
                                    onClick={() => {
                                      setSelectedTradeId(t.id);
                                      if (t.bushaTransferId) setLookupTransferId(t.bushaTransferId);
                                    }}
                                  >
                                    Address
                                  </Btn>
                                )}
                                <Btn variant="ghost" className="!px-2 !py-1" onClick={() => refreshTradeMutation.mutate(t.id)}>
                                  Refresh
                                </Btn>
                              </div>
                            </td>
                          </tr>
                          {hasDeposit && isSelected && (
                            <tr className="border-b bg-emerald-50/30">
                              <td colSpan={7} className="py-3 px-2">
                                <DepositAddressCard
                                  address={t.cryptoDepositAddress!}
                                  network={t.cryptoDepositNetwork}
                                  amount={t.sourceAmount}
                                  currency={t.sourceCurrency}
                                  expiresAt={t.payInExpiresAt}
                                  transferId={t.bushaTransferId}
                                  compact
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Busha transfers" subtitle="Live from Busha API">
              {!transfersQuery.data?.transfers?.length && (
                <p className="text-sm text-slate-500">No transfers or select a customer.</p>
              )}
              <div className="space-y-2 max-h-80 overflow-auto">
                {(transfersQuery.data?.transfers || []).map((t) => {
                  const address = transferPayInAddress(t);
                  const network = transferPayInNetwork(t);
                  return (
                    <div key={t.id} className="p-3 rounded-xl border border-slate-200 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-mono text-xs">{t.id}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="mt-1">
                        {t.source_amount} {t.source_currency} → {t.target_amount} {t.target_currency}
                      </p>
                      {address && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-500">Deposit address{network ? ` (${network})` : ''}</p>
                          <div className="flex items-start gap-2 mt-1">
                            <p className="font-mono text-xs break-all flex-1">{address}</p>
                            <CopyBtn text={address} />
                          </div>
                        </div>
                      )}
                      <Btn
                        variant="ghost"
                        className="!px-2 !py-1 mt-2"
                        onClick={() => {
                          setLookupTransferId(t.id);
                          lookupTransferMutation.mutate(t.id);
                        }}
                      >
                        Load full transfer
                      </Btn>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Lookup & recipients">
              <div className="space-y-4">
                <Field label="Transfer ID">
                  <div className="flex gap-2">
                    <input className={inputClass} value={lookupTransferId} onChange={(e) => setLookupTransferId(e.target.value)} />
                    <Btn variant="secondary" onClick={() => lookupTransferMutation.mutate()} disabled={!lookupTransferId.trim()}>
                      Get
                    </Btn>
                  </div>
                </Field>
                <Field label="Quote ID">
                  <div className="flex gap-2">
                    <input className={inputClass} value={lookupQuoteId} onChange={(e) => setLookupQuoteId(e.target.value)} />
                    <Btn variant="secondary" onClick={() => lookupQuoteMutation.mutate()} disabled={!lookupQuoteId.trim()}>
                      Get
                    </Btn>
                  </div>
                </Field>
                {lookupResult && <JsonBlock data={lookupResult} />}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-800 mb-2">Bank recipients</p>
                  {(recipientsQuery.data?.recipients || []).length === 0 ? (
                    <p className="text-xs text-slate-500">None — sync from Dashboard tab.</p>
                  ) : (
                    <ul className="text-xs space-y-1">
                      {(recipientsQuery.data?.recipients || []).map((r: any) => (
                        <li key={r.id} className="font-mono bg-slate-50 p-2 rounded-lg">
                          {r.id} · {r.account_name} · {r.account_number}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BushaTestPage;
