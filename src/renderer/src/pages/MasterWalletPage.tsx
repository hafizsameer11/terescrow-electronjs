import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import WalletAssetsModal from '@renderer/components/modal/WalletAssetsModal';
import AssetTransactionHistoryModal from '@renderer/components/modal/AssetTransactionHistoryModal';
import SendCryptoModal from '@renderer/components/modal/SendCryptoModal';
import DepositAddressModal from '@renderer/components/modal/DepositAddressModal';
import ChangeNowCreateSwapModal from '@renderer/components/modal/ChangeNowCreateSwapModal';
import {
  MASTER_WALLET_ID,
  MASTER_WALLET_LABEL,
  getTableRows,
  getTransactionsForAsset,
  getAssetsForWalletAssetsModal,
} from '@renderer/data/masterWalletData';
import {
  getMasterWalletBalancesSummary,
  getMasterWalletAssets,
  getMasterWalletTransactions,
  masterWalletSend,
} from '@renderer/api/admin/masterWallet';
import { getAdminVendors } from '@renderer/api/admin/vendors';
import { getVendors } from '@renderer/data/vendorData';
import { addThousandSeparator, formatNairaAmount } from '@renderer/api/helper';
import {
  normalizeApiWalletTableRow,
  normalizeApiWalletModalAsset,
  sendFlowDisplayTicker,
} from '@renderer/utils/masterWalletAssets';
import { MasterWalletAssetAvatar } from '@renderer/components/MasterWalletAssetAvatar';
import type { DepositAddressAsset } from '@renderer/components/modal/DepositAddressModal';
import type { WalletAssetItem } from '@renderer/components/modal/WalletAssetsModal';

const MasterWalletPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const selectedWalletId = MASTER_WALLET_ID;
  const [balanceCurrency, setBalanceCurrency] = useState<'USD' | 'BTC'>('USD');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [search, setSearch] = useState('');
  const [walletAssetsModalOpen, setWalletAssetsModalOpen] = useState(false);
  const [txHistoryModalOpen, setTxHistoryModalOpen] = useState(false);
  const [txHistoryAsset, setTxHistoryAsset] = useState('');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendAsset, setSendAsset] = useState('');
  const [depositPickOpen, setDepositPickOpen] = useState(false);
  const [depositDetail, setDepositDetail] = useState<DepositAddressAsset | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapAsset, setSwapAsset] = useState('');

  const { data: summaryData } = useQuery({
    queryKey: ['admin-master-wallet-summary', token],
    queryFn: () => getMasterWalletBalancesSummary(token!),
    enabled: !!token,
  });
  const summaryList = summaryData?.summary ?? [];
  const balanceSummary = useMemo(() => {
    const row =
      summaryList.find((s: any) => String(s.walletId).toLowerCase() === MASTER_WALLET_ID) ?? summaryList[0];
    if (row) {
      const totalNgnRaw = row.totalNgn as number | string | null | undefined;
      return {
        totalUsd: typeof row.totalUsd === 'number' ? '$' + addThousandSeparator(row.totalUsd) : String(row.totalUsd ?? '—'),
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

  const { data: assetsRaw = [] } = useQuery({
    queryKey: ['admin-master-wallet-assets', token, selectedWalletId],
    queryFn: () => getMasterWalletAssets(token!, selectedWalletId),
    enabled: !!token,
  });
  const walletRows = useMemo(() => {
    if (assetsRaw.length > 0) {
      return (assetsRaw as any[]).map((a: any) => normalizeApiWalletTableRow(a));
    }
    return getTableRows();
  }, [assetsRaw]);

  const { data: vendorsList } = useQuery({
    queryKey: ['admin-vendors', token],
    queryFn: () => getAdminVendors(token!),
    enabled: !!token,
  });
  const vendors = useMemo(() => {
    if (!vendorsList) return getVendors();
    const arr = Array.isArray(vendorsList) ? vendorsList : (vendorsList as any)?.rows ?? (vendorsList as any)?.data ?? [];
    return arr.length ? arr : getVendors();
  }, [vendorsList]);

  const { data: txHistoryRaw = [] } = useQuery({
    queryKey: ['admin-master-wallet-transactions', token, selectedWalletId, txHistoryAsset],
    queryFn: () =>
      getMasterWalletTransactions(token!, { walletId: selectedWalletId, assetSymbol: txHistoryAsset || undefined }),
    enabled: !!token && !!txHistoryAsset && txHistoryModalOpen,
  });
  const txHistoryTransactions = (txHistoryRaw as any[]).length > 0
    ? (txHistoryRaw as any[]).map((t: any) => ({
        id: t.id ?? t.txId,
        to: t.to ?? t.recipient ?? '—',
        status: t.status ?? 'pending',
        type: t.type ?? '—',
        wallet: t.wallet ?? selectedWalletId,
        amount: t.amount ?? '—',
        date: t.date ?? t.createdAt ?? '—',
        assetSymbol: t.assetSymbol ?? t.asset ?? txHistoryAsset,
        walletId: selectedWalletId,
      }))
    : txHistoryAsset
      ? getTransactionsForAsset(txHistoryAsset, selectedWalletId)
      : [];

  const walletAssetsForModal: WalletAssetItem[] = useMemo(() => {
    if (assetsRaw.length > 0) {
      return (assetsRaw as any[]).map((a: any) => {
        const n = normalizeApiWalletModalAsset(a);
        return {
          symbol: n.symbol,
          name: n.name,
          address: n.address,
          balance: n.balance,
          usdValue: n.usdValue,
          iconUrl: n.iconUrl,
        };
      });
    }
    return getAssetsForWalletAssetsModal(selectedWalletId);
  }, [assetsRaw, selectedWalletId]);

  const sendMutation = useMutation({
    mutationFn: (data: { address: string; amountCrypto: string; amountDollar: string; network: string; vendorId?: number }) =>
      masterWalletSend(token!, {
        ...data,
        symbol: sendFlowDisplayTicker(sendAsset || 'ETH') || sendAsset || 'ETH',
        amountCrypto: data.amountCrypto,
        amountDollar: data.amountDollar,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-master-wallet-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-master-wallet-assets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-master-wallet-transactions'] });
      setSendModalOpen(false);
      setSendAsset('');
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

  const filteredRows = walletRows.filter(
    (r) =>
      !search ||
      r.symbol.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase())
  );

  const extraAssetCount = Math.max(0, walletRows.length - 4);

  const openTxHistory = (symbol: string) => {
    setTxHistoryAsset(symbol);
    setTxHistoryModalOpen(true);
  };
  const openDisburse = (symbol: string) => {
    setSendAsset(symbol);
    setSendModalOpen(true);
  };
  const openSwap = (symbol: string) => {
    setSwapAsset(symbol);
    setSwapOpen(true);
  };

  const rowToDepositAsset = (r: (typeof filteredRows)[0]): DepositAddressAsset => ({
    symbol: r.symbol,
    name: r.name,
    address: r.address,
    iconUrl: 'iconUrl' in r ? (r as { iconUrl?: string }).iconUrl : undefined,
  });

  const openDepositForRow = (r: (typeof filteredRows)[0]) => {
    setDepositDetail(rowToDepositAsset(r));
  };

  const openDepositFromModalAsset = (a: WalletAssetItem) => {
    setWalletAssetsModalOpen(false);
    setDepositDetail({
      symbol: a.symbol,
      name: a.name,
      address: a.address ?? '',
      iconUrl: a.iconUrl,
    });
  };

  return (
    <div className="w-full mb-10">
      <h1 className="text-[40px] font-normal text-gray-800 mb-6">Master Wallet</h1>

      <div className="bg-[#147341] rounded-xl p-6 mb-6 flex flex-col lg:flex-row lg:items-stretch gap-6">
        <div className="flex-1">
          <p className="text-white/90 text-sm mb-2">Master Wallet Balance</p>
          <p className="text-white/80 text-sm mb-3 font-medium">{MASTER_WALLET_LABEL}</p>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setBalanceCurrency('USD')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${balanceCurrency === 'USD' ? 'bg-white text-[#147341]' : 'text-white/80'}`}
            >
              USD
            </button>
            <button
              type="button"
              onClick={() => setBalanceCurrency('BTC')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${balanceCurrency === 'BTC' ? 'bg-white text-[#147341]' : 'text-white/80'}`}
            >
              BTC
            </button>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white">
            {balanceCurrency === 'USD' ? balanceSummary.totalUsd : balanceSummary.totalBtc ?? '—'}
          </p>
          <p className="text-white/80 text-sm">
            {balanceCurrency === 'USD' ? balanceSummary.totalNgn : balanceSummary.totalUsd}
          </p>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-white/90 text-sm mb-2">Wallet assets</p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {walletRows.slice(0, 4).map((r) => (
              <MasterWalletAssetAvatar
                key={r.symbol}
                symbol={r.symbol}
                iconUrl={'iconUrl' in r ? (r as { iconUrl?: string }).iconUrl : undefined}
                variant="onGreen"
                className="w-8 h-8 text-xs"
              />
            ))}
            {extraAssetCount > 0 && <span className="text-white/90 text-sm">+{extraAssetCount}</span>}
          </div>
          <p className="text-white font-semibold">{walletRows[0]?.masterBalance ?? '—'}</p>
          <p className="text-white/80 text-sm mb-4">{walletRows[0]?.masterUsd ?? '—'}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDepositPickOpen(true)}
              className="px-4 py-2 bg-white/15 text-white font-medium rounded-lg hover:bg-white/25 border border-white/30"
            >
              Get deposit address
            </button>
            <button
              type="button"
              onClick={() => {
                const s = walletRows[0]?.symbol ?? 'ETH';
                openDisburse(s);
              }}
              className="px-4 py-2 bg-white text-[#147341] font-medium rounded-lg hover:bg-white/90"
            >
              Disburse
            </button>
            <button
              type="button"
              onClick={() => {
                const s = walletRows[0]?.symbol ?? 'ETH';
                openSwap(s);
              }}
              className="px-4 py-2 bg-white border border-white/50 text-[#147341] font-medium rounded-lg hover:bg-white/90"
            >
              Swap via ChangeNOW
            </button>
          </div>
        </div>
      </div>

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
            {filteredRows.map((row) => (
              <tr key={row.symbol} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MasterWalletAssetAvatar
                      symbol={row.symbol}
                      iconUrl={'iconUrl' in row ? (row as { iconUrl?: string }).iconUrl : undefined}
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{row.symbol}</p>
                      <p className="text-xs text-gray-500">{row.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium">{row.masterBalance}</p>
                  <p className="text-xs text-gray-500">{row.masterUsd}</p>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => openTxHistory(row.symbol)}
                      className="px-3 py-1.5 bg-[#147341] text-white text-xs font-medium rounded-lg hover:bg-[#0d5a2e]"
                    >
                      View Tx
                    </button>
                    <button
                      type="button"
                      onClick={() => openDepositForRow(row)}
                      className="px-3 py-1.5 bg-white border border-[#147341] text-[#147341] text-xs font-medium rounded-lg hover:bg-green-50"
                    >
                      Deposit address
                    </button>
                    <button
                      type="button"
                      onClick={() => openDisburse(row.symbol)}
                      className="px-3 py-1.5 bg-[#147341] text-white text-xs font-medium rounded-lg hover:bg-[#0d5a2e]"
                    >
                      Disburse
                    </button>
                    <button
                      type="button"
                      onClick={() => openSwap(row.symbol)}
                      className="px-3 py-1.5 bg-white border border-[#147341] text-[#147341] text-xs font-medium rounded-lg hover:bg-green-50"
                    >
                      Swap
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
        onDisburse={(s) => {
          setWalletAssetsModalOpen(false);
          openDisburse(s);
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
          }}
          assetSymbol={txHistoryAsset}
          transactions={txHistoryTransactions}
          walletLabel={MASTER_WALLET_LABEL}
        />
      )}
      <SendCryptoModal
        isOpen={sendModalOpen}
        onClose={() => {
          setSendModalOpen(false);
          setSendAsset('');
        }}
        symbol={sendAsset || 'ETH'}
        vendors={vendors}
        variant="disburse"
        onProceed={handleSendProceed}
      />
      <DepositAddressModal
        isOpen={!!depositDetail}
        onClose={() => setDepositDetail(null)}
        asset={depositDetail}
      />
      {token && (
        <ChangeNowCreateSwapModal
          isOpen={swapOpen}
          onClose={() => setSwapOpen(false)}
          token={token}
          sourceType="master_wallet"
          receiveCurrency={swapAsset || undefined}
          masterWalletBlockchain="ethereum"
          lockSourceAsset
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
