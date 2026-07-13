import React, { useState, useEffect, useMemo } from 'react';
import { sendFlowDisplayTicker } from '@renderer/utils/masterWalletAssets';
import {
  formatVendorDisburseLabel,
  getDisburseNetworkOptionsForAsset,
  vendorMatchesDisburseAsset,
} from '@renderer/utils/disburseNetworkLabels';
import {
  formatCryptoAmount,
  formatUsdAmount,
  parseAmountString,
  usdPerCryptoFromBalances,
} from '@renderer/utils/cryptoAmountSync';
import type { MasterWalletSendEstimate } from '@renderer/api/admin/masterWallet';

export type SendModalVendor = {
  id: string | number;
  name: string;
  network: string;
  currency: string;
  walletAddress: string;
};

interface SendCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  /** e.g. tron, ethereum — scopes network + vendor list (USDT TRC20 vs ERC20). */
  assetBlockchain?: string;
  assetDisplayLabel?: string;
  assetIsToken?: boolean;
  recipientName?: string;
  vendors?: SendModalVendor[];
  availableBalanceCrypto?: string;
  availableBalanceUsd?: string;
  variant?: 'send' | 'disburse';
  onProceed?: (data: { address: string; amountCrypto: string; amountDollar: string; network: string }) => void;
  isSubmitting?: boolean;
  onEstimate?: (body: {
    address: string;
    amountCrypto: string;
    network: string;
    symbol: string;
  }) => Promise<MasterWalletSendEstimate>;
  onFetchMaxDebit?: (body: { network: string; symbol: string }) => Promise<{
    maxWalletDebit: string;
    recipientAmount: string;
    networkFee: string;
    feeAsset: string;
  } | null>;
}

type RecipientMode = 'vendor' | 'manual';
type DisburseStep = 'form' | 'review';

const UTXO_NETWORKS = new Set(['Bitcoin', 'Litecoin', 'Dogecoin']);

const DEFAULT_NETWORK_BY_TICKER: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  TRX: 'TRON',
  TRON: 'TRON',
  BNB: 'BSC',
  BSC: 'BSC',
  SOL: 'Solana',
  LTC: 'Litecoin',
  DOGE: 'Dogecoin',
  USDT: 'Ethereum',
  USDC: 'Ethereum',
};

function defaultNetworkForSymbol(symbol: string): string {
  const ticker = sendFlowDisplayTicker(symbol).toUpperCase();
  return DEFAULT_NETWORK_BY_TICKER[ticker] ?? 'Ethereum';
}

function isUtxoNetwork(network: string): boolean {
  return UTXO_NETWORKS.has(network);
}

const SendCryptoModal: React.FC<SendCryptoModalProps> = ({
  isOpen,
  onClose,
  symbol,
  assetBlockchain,
  assetDisplayLabel,
  assetIsToken,
  recipientName = '',
  vendors = [],
  availableBalanceCrypto,
  availableBalanceUsd,
  variant = 'send',
  onProceed,
  isSubmitting = false,
  onEstimate,
  onFetchMaxDebit,
}) => {
  const displayTicker = useMemo(() => sendFlowDisplayTicker(symbol) || symbol, [symbol]);
  const useReviewFlow = variant === 'disburse' && !!onEstimate;

  const networkOptions = useMemo(
    () => getDisburseNetworkOptionsForAsset(displayTicker, assetBlockchain, assetIsToken),
    [displayTicker, assetBlockchain, assetIsToken]
  );

  const vendorsForSelect = useMemo(() => {
    if (variant === 'disburse') {
      if (assetBlockchain) {
        return vendors.filter((v) => vendorMatchesDisburseAsset(v, displayTicker, assetBlockchain));
      }
      return vendors;
    }
    return vendors.filter((v) => vendorMatchesDisburseAsset(v, symbol, assetBlockchain));
  }, [variant, vendors, symbol, displayTicker, assetBlockchain]);

  const usdPerUnit = useMemo(
    () => usdPerCryptoFromBalances(availableBalanceCrypto, availableBalanceUsd),
    [availableBalanceCrypto, availableBalanceUsd]
  );

  const maxCrypto = useMemo(
    () => parseAmountString(availableBalanceCrypto) ?? 0,
    [availableBalanceCrypto]
  );

  const [step, setStep] = useState<DisburseStep>('form');
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('manual');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amountCrypto, setAmountCrypto] = useState('');
  const [amountDollar, setAmountDollar] = useState('');
  const [network, setNetwork] = useState('Ethereum');
  const [estimate, setEstimate] = useState<MasterWalletSendEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [maxLoading, setMaxLoading] = useState(false);

  const utxoFeeMode = useReviewFlow && isUtxoNetwork(network);

  const syncUsdFromCrypto = (cryptoStr: string) => {
    const crypto = parseAmountString(cryptoStr);
    if (crypto == null) {
      setAmountDollar('');
      return;
    }
    if (usdPerUnit != null && crypto >= 0) {
      setAmountDollar(formatUsdAmount(crypto * usdPerUnit));
    }
  };

  const syncCryptoFromUsd = (usdStr: string) => {
    const usd = parseAmountString(usdStr);
    if (usd == null) return;
    if (usdPerUnit != null && usdPerUnit > 0 && usd >= 0) {
      setAmountCrypto(formatCryptoAmount(usd / usdPerUnit));
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setStep('form');
    setEstimate(null);
    setEstimateError(null);
    setAmountCrypto('');
    setAmountDollar('');
    const nets = getDisburseNetworkOptionsForAsset(
      sendFlowDisplayTicker(symbol) || symbol,
      assetBlockchain,
      assetIsToken
    );
    setNetwork(nets[0]?.value ?? defaultNetworkForSymbol(symbol));
    setSelectedVendorId('');
    setWalletAddress('');
    const list = variant === 'disburse' ? vendors : vendors.filter((v) => vendorMatchesAssetSymbol(v.currency, symbol));
    setRecipientMode(list.length > 0 ? 'vendor' : 'manual');
  }, [isOpen, symbol, assetBlockchain, assetIsToken, vendors, variant]);

  useEffect(() => {
    if (recipientMode !== 'vendor' || !selectedVendorId) return;
    const v = vendors.find((x) => String(x.id) === String(selectedVendorId));
    if (v) {
      setWalletAddress(v.walletAddress);
      if (networkOptions.length === 0) {
        setNetwork(v.network);
      }
    }
  }, [recipientMode, selectedVendorId, vendors, networkOptions.length]);

  const handleCryptoChange = (value: string) => {
    setAmountCrypto(value);
    syncUsdFromCrypto(value);
    setEstimate(null);
  };

  const handleUsdChange = (value: string) => {
    setAmountDollar(value);
    syncCryptoFromUsd(value);
    setEstimate(null);
  };

  const handleMax = async () => {
    if (maxCrypto <= 0 && !onFetchMaxDebit) return;
    setMaxLoading(true);
    try {
      if (useReviewFlow && onFetchMaxDebit) {
        const maxData = await onFetchMaxDebit({
          network,
          symbol: displayTicker,
        });
        if (maxData?.maxWalletDebit) {
          const debit = parseAmountString(maxData.maxWalletDebit) ?? 0;
          setAmountCrypto(formatCryptoAmount(debit));
          if (usdPerUnit != null) {
            setAmountDollar(formatUsdAmount(debit * usdPerUnit));
          }
          setEstimate(null);
          return;
        }
      }
      if (maxCrypto <= 0) return;
      const formatted = formatCryptoAmount(maxCrypto);
      setAmountCrypto(formatted);
      if (usdPerUnit != null) {
        setAmountDollar(formatUsdAmount(maxCrypto * usdPerUnit));
      } else {
        const usd = parseAmountString(availableBalanceUsd);
        if (usd != null) setAmountDollar(formatUsdAmount(usd));
      }
      setEstimate(null);
    } finally {
      setMaxLoading(false);
    }
  };

  const buildPayload = () => ({
    address: walletAddress.trim(),
    amountCrypto,
    amountDollar,
    network,
  });

  const runEstimate = async (): Promise<MasterWalletSendEstimate | null> => {
    if (!onEstimate) return null;
    setEstimateLoading(true);
    setEstimateError(null);
    try {
      const result = await onEstimate({
        address: walletAddress.trim(),
        amountCrypto,
        network,
        symbol: displayTicker,
      });
      setEstimate(result);
      if (!result.sufficient) {
        setEstimateError(result.message ?? 'Insufficient balance for this disbursement');
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load fee breakdown';
      setEstimateError(msg);
      setEstimate(null);
      return null;
    } finally {
      setEstimateLoading(false);
    }
  };

  const handleReview = async () => {
    const result = await runEstimate();
    if (result?.sufficient) setStep('review');
  };

  const handleConfirm = () => {
    onProceed?.(buildPayload());
  };

  const handleProceed = () => {
    if (useReviewFlow) {
      void handleReview();
      return;
    }
    onProceed?.(buildPayload());
  };

  if (!isOpen) return null;

  const verb = variant === 'disburse' ? 'Disburse' : 'Send';
  const assetTitle = assetDisplayLabel?.trim() || displayTicker;
  const title = recipientName ? `${verb} ${assetTitle} (${recipientName})` : `${verb} ${assetTitle}`;

  const canPickVendor = vendorsForSelect.length > 0;
  const hasMax = maxCrypto > 0 || !!onFetchMaxDebit;
  const availableLabel =
    availableBalanceCrypto && availableBalanceCrypto !== '—'
      ? `${availableBalanceCrypto}${availableBalanceUsd && availableBalanceUsd !== '—' ? ` (${availableBalanceUsd})` : ''}`
      : null;

  const formValid = !!walletAddress.trim() && !!parseAmountString(amountCrypto);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {step === 'review' ? 'Review disbursement' : title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>

        {step === 'review' && estimate ? (
          <div className="p-4 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm">
              <p className="font-semibold text-gray-800">Amount breakdown</p>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">To address</span>
                <span className="font-mono text-xs text-right break-all max-w-[55%]">{walletAddress.trim()}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Total from wallet</span>
                <span className="font-medium">
                  {estimate.requestedAmount} {estimate.feeAsset || displayTicker}
                </span>
              </div>
              {estimate.feeDeductedFromAmount && parseAmountString(estimate.networkFee) ? (
                <div className="flex justify-between gap-2 text-amber-800">
                  <span>Network fee (deducted)</span>
                  <span>
                    −{estimate.networkFee} {estimate.feeAsset}
                  </span>
                </div>
              ) : parseAmountString(estimate.networkFee) ? (
                <div className="flex justify-between gap-2 text-amber-800">
                  <span>Est. network fee</span>
                  <span>
                    {estimate.networkFee} {estimate.feeAsset}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between gap-2 border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-800">Recipient receives</span>
                <span className="font-semibold text-[#147341]">
                  {estimate.recipientAmount} {estimate.feeAsset || displayTicker}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Available on-chain: {estimate.availableBalance} {estimate.feeAsset || displayTicker}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
              >
                {isSubmitting ? 'Processing…' : 'Confirm disburse'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Recipient</span>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                  <input
                    type="radio"
                    name="send-recipient"
                    className="text-[#147341] focus:ring-[#147341]"
                    checked={recipientMode === 'vendor'}
                    disabled={!canPickVendor}
                    onChange={() => {
                      setRecipientMode('vendor');
                      setSelectedVendorId('');
                      setWalletAddress('');
                    }}
                  />
                  Vendor
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                  <input
                    type="radio"
                    name="send-recipient"
                    className="text-[#147341] focus:ring-[#147341]"
                    checked={recipientMode === 'manual'}
                    onChange={() => {
                      setRecipientMode('manual');
                      setSelectedVendorId('');
                      setWalletAddress('');
                    }}
                  />
                  Manual address
                </label>
              </div>
            {!canPickVendor && (
              <p className="text-xs text-gray-500 mt-1">
                {variant === 'disburse'
                  ? assetBlockchain
                    ? `No vendors for ${assetTitle}. Use manual address.`
                    : 'No vendors configured. Use manual address.'
                  : `No vendors for ${displayTicker}. Use manual address.`}
              </p>
            )}
            </div>

            {recipientMode === 'vendor' && canPickVendor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
                >
                  <option value="">Select vendor…</option>
                  {vendorsForSelect.map((v) => (
                    <option key={String(v.id)} value={String(v.id)}>
                      {variant === 'disburse' ? formatVendorDisburseLabel(v) : `${v.name} (${v.network})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {recipientMode === 'vendor' ? 'Wallet address (from vendor)' : 'Wallet address'}
              </label>
              <div className="bg-[#147341] text-white rounded-lg p-3">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-green-200 outline-none text-sm"
                  placeholder="0x... or bc1..."
                />
              </div>
              {recipientMode === 'vendor' && !selectedVendorId && (
                <p className="text-xs text-amber-700 mt-1">Choose a vendor to load their payout address.</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  {utxoFeeMode ? 'Total from wallet' : 'Amount in crypto'}
                </label>
                {availableLabel && <span className="text-xs text-gray-500">Available: {availableLabel}</span>}
              </div>
              {utxoFeeMode && (
                <p className="text-xs text-gray-500 mb-1">
                  Network fee is deducted from this amount. The vendor receives the remainder.
                </p>
              )}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountCrypto}
                  onChange={(e) => handleCryptoChange(e.target.value)}
                  className="flex-1 px-3 py-2 outline-none min-w-0"
                  placeholder="0"
                />
                <span className="px-3 py-2 bg-gray-100 text-gray-600 font-medium shrink-0">{displayTicker}</span>
                <button
                  type="button"
                  onClick={() => void handleMax()}
                  disabled={!hasMax || maxLoading}
                  className="px-3 py-2 bg-[#147341] text-white text-xs font-semibold hover:bg-[#0d5a2e] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {maxLoading ? '…' : 'MAX'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount in dollar</label>
              <input
                type="text"
                inputMode="decimal"
                value={amountDollar}
                onChange={(e) => handleUsdChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
                placeholder="$0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
              {networkOptions.length <= 1 && networkOptions[0] ? (
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 text-sm font-medium">
                  {networkOptions[0].label}
                </div>
              ) : (
                <select
                  value={network}
                  onChange={(e) => {
                    setNetwork(e.target.value);
                    setEstimate(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
                >
                  {networkOptions.length > 0
                    ? networkOptions.map((n) => (
                        <option key={n.value} value={n.value}>
                          {n.label}
                        </option>
                      ))
                    : (
                      <option value={network}>{network}</option>
                    )}
                </select>
              )}
              {assetBlockchain && (
                <p className="text-xs text-gray-500 mt-1">
                  Sending from master wallet asset: {assetTitle}
                </p>
              )}
            </div>

            {estimateError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {estimateError}
              </p>
            )}

            {!useReviewFlow && <p className="text-sm text-gray-500">Transaction fee : $0.5</p>}

            <button
              type="button"
              onClick={handleProceed}
              disabled={isSubmitting || estimateLoading || !formValid}
              className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
            >
              {estimateLoading
                ? 'Calculating fees…'
                : isSubmitting
                  ? 'Processing…'
                  : useReviewFlow
                    ? 'Review disbursement'
                    : variant === 'disburse'
                      ? 'Disburse'
                      : 'Proceed'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendCryptoModal;
