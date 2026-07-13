import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth, canAccessWalletOperations } from '@renderer/context/authContext';
import WalletAssetsModal from '@renderer/components/modal/WalletAssetsModal';
import AssetTransactionHistoryModal from '@renderer/components/modal/AssetTransactionHistoryModal';
import SendCryptoModal from '@renderer/components/modal/SendCryptoModal';
import DepositAddressModal from '@renderer/components/modal/DepositAddressModal';
import MasterWalletSweepModal from '@renderer/components/modal/MasterWalletSweepModal';
import ChangeNowCreateSwapModal, { type SwapSourcePrefill } from '@renderer/components/modal/ChangeNowCreateSwapModal';
import { MASTER_WALLET_ID, MASTER_WALLET_LABEL } from '@renderer/data/masterWalletData';
import {
  getMasterWalletBalancesSummary,
  getMasterWalletAssets,
  getMasterWalletUserPendingBalances,
  getMasterWalletTransactions,
  masterWalletSend,
  estimateMasterWalletSend,
  getMasterWalletMaxDebit,
} from '@renderer/api/admin/masterWallet';
import { getAdminVendors } from '@renderer/api/admin/vendors';
import { addThousandSeparator, formatNairaAmount } from '@renderer/api/helper';
import {
  normalizeApiWalletTableRow,
  normalizeApiWalletModalAsset,
  sendFlowDisplayTicker,
  sortWalletRowsByUsdDesc,
  type NormalizedWalletTableRow,
  formatMasterWalletQuantityDisplay,
  formatMasterWalletUsdDisplay,
} from '@renderer/utils/masterWalletAssets';
import { formatAssetListSubtitle } from '@renderer/utils/walletCurrencyLabel';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';

export type DisburseAssetContext = {
  rowKey: string;
  symbol: string;
  blockchain?: string;
  displayLabel: string;
  isToken?: boolean;
};
import { MasterWalletAssetAvatar } from '@renderer/components/MasterWalletAssetAvatar';
import type { DepositAddressAsset } from '@renderer/components/modal/DepositAddressModal';
import type { WalletAssetItem } from '@renderer/components/modal/WalletAssetsModal';
import { toastApiError, toastSuccess } from '@renderer/utils/toast';
import PalmPayFundingAccountCard from '@renderer/components/masterWallet/PalmPayFundingAccountCard';

const MasterWalletPage: React.FC = () => {
  const { token, userData } = useAuth();
  const canOperate = canAccessWalletOperations(userData?.role, userData);
  const queryClient = useQueryClient();
  const selectedWalletId = MASTER_WALLET_ID;
  const [balanceCurrency, setBalanceCurrency] = useState<'USD' | 'PALMPAY'>('USD');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [search, setSearch] = useState('');
  const [walletAssetsModalOpen, setWalletAssetsModalOpen] = useState(false);
  const [txHistoryModalOpen, setTxHistoryModalOpen] = useState(false);
  const [txHistoryAsset, setTxHistoryAsset] = useState('');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendAssetCtx, setSendAssetCtx] = useState<DisburseAssetContext | null>(null);
  const [depositPickOpen, setDepositPickOpen] = useState(false);
  const [depositDetail, setDepositDetail] = useState<DepositAddressAsset | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapPrefill, setSwapPrefill] = useState<SwapSourcePrefill | null>(null);
  const [highlightTxId, setHighlightTxId] = useState<number | null>(null);
  const [sweepOpen, setSweepOpen] = useState(false);
  const [sweepInitialAssetId, setSweepInitialAssetId] = useState<string | undefined>();

  const openSweepModal = (assetRowKey?: string) => {
    setSweepInitialAssetId(assetRowKey);
    setSweepOpen(true);
  };

  const { data: summaryData } = useQuery({
    queryKey: ['admin-master-wallet-summary', token],
    queryFn: () => getMasterWalletBalancesSummary(token!),
    enabled: !!token,
  });
  const summaryList = summaryData?.summary ?? [];
  const palmpaySummary = useMemo(
    () => summaryList.find((s: { walletId?: string }) => String(s.walletId).toLowerCase() === 'palmpay'),
    [summaryList]
  );

  const palmpayBalanceDisplay = useMemo(() => {
    if (!palmpaySummary) {
      return { main: '—', sub: '', error: undefined as string | undefined };
    }
    const row = palmpaySummary as Record<string, unknown>;
    const available = row.palmpayAvailableNgn ?? row.totalNgn;
    const main =
      available != null && available !== '—'
        ? `₦${formatNairaAmount(available as string | number)}`
        : '—';
    const frozen = row.palmpayFrozenNgn as number | undefined;
    const unsettled = row.palmpayUnsettledNgn as number | undefined;
    const parts: string[] = [];
    if (frozen != null) parts.push(`Frozen ₦${formatNairaAmount(frozen)}`);
    if (unsettled != null) parts.push(`Unsettled ₦${formatNairaAmount(unsettled)}`);
    return {
      main,
      sub: parts.join(' · '),
      error: row.palmpayError as string | undefined,
    };
  }, [palmpaySummary]);

  const { data: userPendingData, isError: userPendingError, error: userPendingQueryError } = useQuery({
    queryKey: ['admin-master-wallet-user-pending', token],
    queryFn: () => getMasterWalletUserPendingBalances(token!),
    enabled: !!token,
  });

  function fmtPendingUsd(n: number) {
    if (!Number.isFinite(n) || n <= 0) return n === 0 ? '$0' : '—';
    return '$' + addThousandSeparator(Math.round(n * 100) / 100);
  }

  function fmtPendingNgn(n: number) {
    if (!Number.isFinite(n) || n <= 0) return n === 0 ? '₦0' : '—';
    return '₦' + addThousandSeparator(n);
  }

  const balanceSummary = useMemo(() => {
    const row =
      summaryList.find((s: any) => String(s.walletId).toLowerCase() === MASTER_WALLET_ID) ?? summaryList[0];
    if (row) {
      const totalNgnRaw = row.totalNgn as number | string | null | undefined;
      return {
        totalUsd:
          row.totalUsd != null && row.totalUsd !== '—' && Number.isFinite(Number(row.totalUsd))
            ? '$' + addThousandSeparator(Number(row.totalUsd))
            : String(row.totalUsd ?? '—'),
        totalNgn:
          totalNgnRaw == null || totalNgnRaw === '—'
            ? String(totalNgnRaw ?? '—')
            : typeof totalNgnRaw === 'number'
              ? 'N' + addThousandSeparator(totalNgnRaw)
              : 'N' + formatNairaAmount(String(totalNgnRaw)),
        totalBtc: row.totalBtc != null ? String(row.totalBtc) : undefined,
        accountName: row.accountName ?? undefined,
        accountNumber: row.accountNumber ?? undefined,
      };
    }
    return {
      totalUsd: '—',
      totalNgn: '—',
      totalBtc: undefined,
      accountName: undefined,
      accountNumber: undefined,
    };
  }, [summaryList]);

  const { data: assetsRaw = [], isSuccess: assetsLoaded } = useQuery({
    queryKey: ['admin-master-wallet-assets', token, selectedWalletId],
    queryFn: () => getMasterWalletAssets(token!, selectedWalletId),
    enabled: !!token,
  });
  const walletRows = useMemo(() => {
    if (!assetsLoaded) return [];
    const rows = (assetsRaw as any[]).map((a: any) => normalizeApiWalletTableRow(a));
    return sortWalletRowsByUsdDesc(rows);
  }, [assetsRaw, assetsLoaded]);

  const { data: vendorsList } = useQuery({
    queryKey: ['admin-vendors', token],
    queryFn: () => getAdminVendors(token!),
    enabled: !!token && canOperate,
  });
  const vendors = useMemo(() => {
    if (!vendorsList) return [];
    const arr = Array.isArray(vendorsList) ? vendorsList : (vendorsList as any)?.rows ?? (vendorsList as any)?.data ?? [];
    return arr;
  }, [vendorsList]);

  const { data: txHistoryRaw = [], isLoading: txHistoryLoading } = useQuery({
    queryKey: ['admin-master-wallet-transactions', token, selectedWalletId, txHistoryAsset],
    queryFn: () =>
      getMasterWalletTransactions(token!, { walletId: selectedWalletId, assetSymbol: txHistoryAsset || undefined }),
    enabled: !!token && !!txHistoryAsset && txHistoryModalOpen,
  });
  const txHistoryTransactions = (txHistoryRaw as any[]).map((t: any) => ({
    id: t.id ?? t.txId,
    to: t.to ?? t.recipient ?? t.toAddress ?? '—',
    status: t.status ?? 'pending',
    type: t.type ?? '—',
    wallet: t.wallet ?? t.walletId ?? selectedWalletId,
    amount: formatCryptoAmountFromUnknown(t.amount ?? '—'),
    date: t.date ?? t.createdAt ?? '—',
    assetSymbol: t.assetSymbol ?? t.asset ?? txHistoryAsset,
    walletId: selectedWalletId,
    txHash: t.txHash,
    performedBy: t.performedBy,
    vendor: t.vendor,
  }));

  const walletAssetsForModal: WalletAssetItem[] = useMemo(() => {
    if (!assetsLoaded) return [];
    const items = (assetsRaw as any[]).map((a: any) => {
      const n = normalizeApiWalletModalAsset(a);
      return {
        symbol: n.symbol,
        name: n.displayLabel,
        displayLabel: n.displayLabel,
        rowKey: n.rowKey,
        sharedMasterWalletNote: n.sharedMasterWalletNote,
        address: n.address,
        balance: n.balance,
        usdValue: n.usdValue,
        iconUrl: n.iconUrl,
        blockchain: n.blockchain,
        isToken: n.isToken,
      };
    });
    return sortWalletRowsByUsdDesc(items);
  }, [assetsRaw, assetsLoaded]);

  const sendMutation = useMutation({
    mutationFn: (data: { address: string; amountCrypto: string; amountDollar: string; network: string; vendorId?: number }) =>
      masterWalletSend(token!, {
        ...data,
        symbol: sendFlowDisplayTicker(sendAssetCtx?.symbol || 'ETH') || sendAssetCtx?.symbol || 'ETH',
        amountCrypto: data.amountCrypto,
        amountDollar: data.amountDollar,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-master-wallet-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-master-wallet-assets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-master-wallet-transactions'] });
      const asset = sendFlowDisplayTicker(sendAssetCtx?.symbol || 'ETH') || sendAssetCtx?.symbol || 'ETH';
      if (data.txId != null) setHighlightTxId(data.txId);
      setSendModalOpen(false);
      setTxHistoryAsset(asset);
      setTxHistoryModalOpen(true);
      const status = data.status ?? 'successful';
      if (status === 'successful') {
        const feeNote =
          data.networkFee && data.recipientAmount
            ? ` Vendor receives ${data.recipientAmount} (fee ${data.networkFee}).`
            : '';
        toastSuccess(
          data.txHash
            ? `Disbursement sent on-chain. Tx: ${data.txHash.slice(0, 10)}…${feeNote}`
            : `Disbursement completed.${feeNote}`
        );
      } else {
        toastSuccess('Disbursement queued. Check View Tx for status.');
      }
      setSendAssetCtx(null);
    },
    onError: (err) => {
      toastApiError(err, 'Disbursement failed');
    },
  });

  const handleSendProceed = (data: { address: string; amountCrypto: string; amountDollar: string; network: string }) => {
    const addr = data.address.trim();
    const vendorId = vendors?.find((v: any) => String(v.walletAddress ?? '').trim() === addr)?.id;
    sendMutation.mutate({
      ...data,
      address: addr,
      vendorId: vendorId != null ? Number(vendorId) : undefined,
    });
  };

  const filteredRows = useMemo(() => {
    return walletRows.filter(
      (r) =>
        !search ||
        r.symbol.toLowerCase().includes(search.toLowerCase()) ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.displayLabel.toLowerCase().includes(search.toLowerCase()) ||
        (r.blockchain ?? '').toLowerCase().includes(search.toLowerCase())
    );
  }, [walletRows, search]);

  const headerPreviewRows = walletRows;
  const extraAssetCount = Math.max(0, headerPreviewRows.length - 4);

  const openTxHistory = (symbol: string) => {
    setHighlightTxId(null);
    setTxHistoryAsset(sendFlowDisplayTicker(symbol) || symbol);
    setTxHistoryModalOpen(true);
  };
  const sendAssetRow = useMemo(() => {
    if (!sendAssetCtx?.rowKey) return undefined;
    return walletRows.find((r) => r.rowKey === sendAssetCtx.rowKey);
  }, [walletRows, sendAssetCtx]);

  const openDisburseFromRow = (row: NormalizedWalletTableRow) => {
    setSendAssetCtx({
      rowKey: row.rowKey,
      symbol: row.symbol,
      blockchain: row.blockchain,
      displayLabel: row.displayLabel,
      isToken: row.isToken,
    });
    setSendModalOpen(true);
  };
  const openSwap = (row?: NormalizedWalletTableRow) => {
    if (row) {
      setSwapPrefill({
        currency: sendFlowDisplayTicker(row.symbol) || row.symbol,
        blockchain: row.blockchain,
        masterWalletAddress: row.address !== '—' ? row.address : undefined,
        availableBalance: row.masterBalance !== '—' ? row.masterBalance : undefined,
      });
    } else {
      setSwapPrefill(null);
    }
    setSwapOpen(true);
  };

  const rowToDepositAsset = (r: (typeof filteredRows)[0]): DepositAddressAsset => ({
    symbol: r.symbol,
    name: r.displayLabel,
    address: r.address,
    iconUrl: r.iconUrl,
    sharedMasterWalletNote: r.sharedMasterWalletNote,
  });

  const openDepositForRow = (r: (typeof filteredRows)[0]) => {
    setDepositDetail(rowToDepositAsset(r));
  };

  const openDepositFromModalAsset = (a: WalletAssetItem) => {
    setWalletAssetsModalOpen(false);
    setDepositDetail({
      symbol: a.symbol,
      name: a.displayLabel ?? a.name,
      address: a.address ?? '',
      iconUrl: a.iconUrl,
      sharedMasterWalletNote: a.sharedMasterWalletNote,
    });
  };

  return (
    <div className="w-full mb-10">
      <h1 className="text-[40px] font-normal text-gray-800 mb-2">Master Wallet</h1>
      <div className="mb-6 max-w-4xl space-y-3 rounded-xl border border-[#147341]/20 bg-[#f0faf4] px-4 py-4 text-sm text-gray-700">
        <p>
          <span className="font-semibold text-[#147341]">Sweep user deposits</span> (yellow button) — moves{' '}
          <span className="font-medium">all customer deposit balances</span> still &quot;in wallet&quot; for the
          selected coin to a <span className="font-medium">master wallet</span> or <span className="font-medium">vendor</span>.
          Use preview before confirming.
        </p>
        <p>
          <span className="font-semibold text-[#147341]">Send from master wallet</span> — sends crypto already held on
          the platform master wallet to a vendor address (per asset row).
        </p>
        <p>
          <span className="font-semibold text-[#147341]">Swap via ChangeNOW</span> — convert master wallet balance to
          another asset; exchanged funds go to your configured payout address.
        </p>
        <p className="text-xs text-gray-500">
          Each coin is listed separately (e.g. USDT on Tron vs TRX). Tokens on the same network share one master address.
        </p>
      </div>

      <div className="bg-[#147341] rounded-xl p-6 mb-6 flex flex-col lg:flex-row lg:items-stretch gap-6">
        <div className="flex-1">
          <p className="text-white/90 text-sm mb-1">
            {balanceCurrency === 'PALMPAY' ? 'PalmPay balance' : 'Master wallet balance'}
          </p>
          <p className="text-white/80 text-sm mb-3 font-medium">
            {balanceCurrency === 'PALMPAY' ? 'PalmPay · NGN wallet' : MASTER_WALLET_LABEL}
          </p>
          <div className="flex gap-2 mb-2 flex-wrap">
            <button
              type="button"
              onClick={() => setBalanceCurrency('USD')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${balanceCurrency === 'USD' ? 'bg-white text-[#147341]' : 'text-white/80'}`}
            >
              USD
            </button>
            <button
              type="button"
              onClick={() => setBalanceCurrency('PALMPAY')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${balanceCurrency === 'PALMPAY' ? 'bg-white text-[#147341]' : 'text-white/80'}`}
            >
              PalmPay
            </button>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white">
            {balanceCurrency === 'USD' ? balanceSummary.totalUsd : palmpayBalanceDisplay.main}
          </p>
          <p className="text-white/80 text-sm">
            {balanceCurrency === 'USD'
              ? balanceSummary.totalNgn
              : palmpayBalanceDisplay.error
                ? palmpayBalanceDisplay.error
                : palmpayBalanceDisplay.sub || 'Merchant NGN balance (live from PalmPay)'}
          </p>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-white/90 text-sm mb-2">Wallet assets</p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {headerPreviewRows.slice(0, 4).map((r) => (
              <MasterWalletAssetAvatar
                key={r.rowKey}
                symbol={r.symbol}
                iconUrl={'iconUrl' in r ? (r as { iconUrl?: string }).iconUrl : undefined}
                variant="onGreen"
                className="w-8 h-8 text-xs"
              />
            ))}
            {extraAssetCount > 0 && <span className="text-white/90 text-sm">+{extraAssetCount}</span>}
          </div>
          <p className="text-white font-semibold">
            {formatMasterWalletUsdDisplay(headerPreviewRows[0]?.masterUsd)}
          </p>
          <p className="text-white/80 text-sm mb-4">
            {formatMasterWalletQuantityDisplay(headerPreviewRows[0]?.masterBalance, headerPreviewRows[0]?.symbol)}
          </p>
          {balanceCurrency === 'USD' && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDepositPickOpen(true)}
              className="px-4 py-2 bg-white/15 text-white font-medium rounded-lg hover:bg-white/25 border border-white/30"
            >
              Get deposit address
            </button>
            {canOperate && (
              <button
                type="button"
                onClick={() => openSweepModal()}
                title="Sweep all user deposits in wallet for a coin to master wallet or vendor"
                className="px-4 py-2 bg-amber-400 text-gray-900 font-medium rounded-lg hover:bg-amber-300"
              >
                Sweep user deposits
              </button>
            )}
            {canOperate && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const r0 = walletRows[0];
                    if (r0) openDisburseFromRow(r0);
                  }}
                  title="Send from master wallet balance to a vendor"
                  className="px-4 py-2 bg-white text-[#147341] font-medium rounded-lg hover:bg-white/90"
                >
                  Send from master
                </button>
                <button
                  type="button"
                  onClick={() => openSwap(walletRows[0])}
                  title="Swap master wallet crypto via ChangeNOW"
                  className="px-4 py-2 bg-white border border-white/50 text-[#147341] font-medium rounded-lg hover:bg-white/90"
                >
                  Swap (ChangeNOW)
                </button>
              </>
            )}
          </div>
          )}
        </div>
      </div>

      {balanceCurrency === 'PALMPAY' && <PalmPayFundingAccountCard />}

      {!userPendingError && userPendingData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800 mb-1">On-chain pending (deposits)</p>
            <p className="text-2xl font-bold text-blue-900">{fmtPendingUsd(userPendingData.onChainPending.totalUsd)}</p>
            <p className="text-sm text-blue-700 mt-1">
              {fmtPendingNgn(userPendingData.onChainPending.totalNgn)}
              {' · '}
              {userPendingData.onChainPending.usersWithBalance} user
              {userPendingData.onChainPending.usersWithBalance === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-blue-600 mt-2 leading-relaxed">
              Customer deposit credits in the system ledger — crypto may still be at deposit addresses until swept or disbursed.
            </p>
            {userPendingData.onChainPending.assets.length > 0 && (
              <ul className="mt-3 text-xs text-blue-800 space-y-1">
                {userPendingData.onChainPending.assets.slice(0, 4).map((a) => (
                  <li key={a.walletCurrencyId} className="flex justify-between gap-2">
                    <span>{a.displayLabel}</span>
                    <span className="font-medium">{formatMasterWalletUsdDisplay(String(a.totalUsd))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-800 mb-1">System pending (virtual)</p>
            <p className="text-2xl font-bold text-purple-900">{fmtPendingUsd(userPendingData.virtualPending.totalUsd)}</p>
            <p className="text-sm text-purple-700 mt-1">
              {fmtPendingNgn(userPendingData.virtualPending.totalNgn)}
              {' · '}
              {userPendingData.virtualPending.usersWithBalance} user
              {userPendingData.virtualPending.usersWithBalance === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-purple-600 mt-2 leading-relaxed">
              Bought with Naira — admin-held ledger balance, not on-chain at customer deposit addresses.
            </p>
            {userPendingData.virtualPending.assets.length > 0 && (
              <ul className="mt-3 text-xs text-purple-800 space-y-1">
                {userPendingData.virtualPending.assets.slice(0, 4).map((a) => (
                  <li key={a.walletCurrencyId} className="flex justify-between gap-2">
                    <span>{a.displayLabel}</span>
                    <span className="font-medium">{formatMasterWalletUsdDisplay(String(a.totalUsd))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {userPendingError && (
        <p className="mb-4 text-sm text-red-600">
          Could not load customer pending balances.
          {userPendingQueryError instanceof Error ? ` ${userPendingQueryError.message}` : ''}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white"
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-48 bg-white">
          <FiSearch className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4">Master wallet balance</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 px-4 text-center text-gray-500">
                  No master wallet assets found.
                </td>
              </tr>
            ) : (
            filteredRows.map((row) => {
              const opsRow = row;
              return (
              <tr key={row.rowKey} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MasterWalletAssetAvatar symbol={row.symbol} iconUrl={row.iconUrl} />
                    <div>
                      <p className="font-semibold text-gray-800">{row.displayLabel}</p>
                      <p className="text-xs text-gray-500">
                        {row.blockchain
                          ? formatAssetListSubtitle(row.symbol, row.blockchain, row.isToken)
                          : row.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium">{formatMasterWalletUsdDisplay(row.masterUsd)}</p>
                  <p className="text-xs text-gray-500">
                    {formatMasterWalletQuantityDisplay(row.masterBalance, row.symbol)}
                  </p>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => openTxHistory(opsRow.symbol)}
                      className="px-3 py-1.5 bg-[#147341] text-white text-xs font-medium rounded-lg hover:bg-[#0d5a2e]"
                    >
                      View Tx
                    </button>
                    <button
                      type="button"
                      onClick={() => openDepositForRow(opsRow)}
                      className="px-3 py-1.5 bg-white border border-[#147341] text-[#147341] text-xs font-medium rounded-lg hover:bg-green-50"
                    >
                      Deposit address
                    </button>
                    {canOperate && (
                      <button
                        type="button"
                        onClick={() => openSweepModal(opsRow.rowKey)}
                        title="Sweep all in-wallet user deposits for this asset to master wallet or vendor"
                        className="px-3 py-1.5 bg-amber-400 text-gray-900 text-xs font-medium rounded-lg hover:bg-amber-300"
                      >
                        Sweep deposits
                      </button>
                    )}
                    {canOperate && (
                      <>
                        <button
                          type="button"
                          onClick={() => openDisburseFromRow(opsRow)}
                          title="Send this asset from master wallet to a vendor"
                          className="px-3 py-1.5 bg-[#147341] text-white text-xs font-medium rounded-lg hover:bg-[#0d5a2e]"
                        >
                          Send from master
                        </button>
                        <button
                          type="button"
                          onClick={() => openSwap(opsRow)}
                          className="px-3 py-1.5 bg-white border border-[#147341] text-[#147341] text-xs font-medium rounded-lg hover:bg-green-50"
                        >
                          Swap
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setWalletAssetsModalOpen(true)}
        className="mt-4 text-[#147341] font-medium hover:underline"
      >
        View all wallet assets
      </button>

      <WalletAssetsModal
        isOpen={walletAssetsModalOpen}
        onClose={() => setWalletAssetsModalOpen(false)}
        assets={walletAssetsForModal}
        selectedWalletLabel={MASTER_WALLET_LABEL}
        onDisburse={(asset) => {
          setWalletAssetsModalOpen(false);
          const row = walletRows.find((r) => r.rowKey === asset.rowKey) ?? walletRows.find((r) => r.symbol === asset.symbol);
          if (row) openDisburseFromRow(row);
          else {
            setSendAssetCtx({
              rowKey: asset.rowKey ?? asset.symbol,
              symbol: asset.symbol,
              blockchain: asset.blockchain,
              displayLabel: asset.displayLabel ?? asset.name,
              isToken: asset.isToken,
            });
            setSendModalOpen(true);
          }
        }}
        onDepositAddress={openDepositFromModalAsset}
        onCopyAddress={(address) => {
          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) navigator.clipboard.writeText(address);
        }}
      />
      {txHistoryAsset && (
        <AssetTransactionHistoryModal
          isOpen={txHistoryModalOpen}
          onClose={() => {
            setTxHistoryModalOpen(false);
            setTxHistoryAsset('');
            setHighlightTxId(null);
          }}
          assetSymbol={txHistoryAsset}
          transactions={txHistoryTransactions}
          walletLabel={MASTER_WALLET_LABEL}
          loading={txHistoryLoading}
          highlightTxId={highlightTxId}
        />
      )}
      {token && canOperate && (
        <MasterWalletSweepModal
          isOpen={sweepOpen}
          onClose={() => {
            setSweepOpen(false);
            setSweepInitialAssetId(undefined);
          }}
          token={token}
          initialAssetId={sweepInitialAssetId}
          vendors={vendors}
          assets={walletRows.map((r) => ({
            id: r.rowKey,
            symbol: r.symbol,
            blockchain: r.blockchain,
            displayLabel: r.displayLabel,
          }))}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-master-wallet-assets'] });
            queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking'] });
          }}
        />
      )}
      {canOperate && (
      <SendCryptoModal
        isOpen={sendModalOpen}
        onClose={() => {
          setSendModalOpen(false);
          setSendAssetCtx(null);
        }}
        symbol={sendAssetCtx?.symbol || 'ETH'}
        assetDisplayLabel={sendAssetCtx?.displayLabel}
        assetBlockchain={sendAssetCtx?.blockchain}
        assetIsToken={sendAssetCtx?.isToken}
        vendors={vendors}
        availableBalanceCrypto={sendAssetRow?.masterBalance}
        availableBalanceUsd={sendAssetRow?.masterUsd}
        variant="disburse"
        isSubmitting={sendMutation.isPending}
        onEstimate={(body) =>
          estimateMasterWalletSend(token!, {
            ...body,
            symbol: sendFlowDisplayTicker(sendAssetCtx?.symbol || body.symbol) || body.symbol,
          })
        }
        onFetchMaxDebit={(body) =>
          getMasterWalletMaxDebit(token!, {
            ...body,
            symbol: sendFlowDisplayTicker(sendAssetCtx?.symbol || body.symbol) || body.symbol,
          })
        }
        onProceed={handleSendProceed}
      />
      )}
      <DepositAddressModal
        isOpen={!!depositDetail}
        onClose={() => setDepositDetail(null)}
        asset={depositDetail}
      />
      {canOperate && token && (
        <ChangeNowCreateSwapModal
          isOpen={swapOpen}
          onClose={() => setSwapOpen(false)}
          token={token}
          sourceType="master_wallet"
          receiveCurrency={swapPrefill?.currency}
          receiveBlockchain={swapPrefill?.blockchain}
          receiveAmount={swapPrefill?.availableBalance}
          sourcePrefill={swapPrefill ?? undefined}
        />
      )}

      {depositPickOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[55] overflow-y-auto p-6">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h2 className="text-lg font-bold text-gray-800">Choose asset</h2>
              <button
                type="button"
                onClick={() => setDepositPickOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2">
              {walletRows.map((r) => (
                <button
                  key={r.symbol}
                  type="button"
                  onClick={() => {
                    setDepositPickOpen(false);
                    openDepositForRow(r);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#147341] hover:bg-green-50 text-left"
                >
                  <MasterWalletAssetAvatar
                    symbol={r.symbol}
                    iconUrl={'iconUrl' in r ? (r as { iconUrl?: string }).iconUrl : undefined}
                    className="w-10 h-10"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{r.symbol}</p>
                    <p className="text-sm text-gray-500">{r.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterWalletPage;
