export type MasterWalletStatus = 'inWallet' | 'transferredToMaster' | 'unknown' | 'sentToVendor' | string;

export type LedgerRowType =
  | 'on_chain_deposit'
  | 'virtual_purchase'
  | 'sell_virtual'
  | 'sell_on_chain'
  | 'send'
  | 'unknown';

export interface TrackingListItem {
  id: number;
  transactionId: string;
  ledgerType?: LedgerRowType;
  balanceBucket?: string | null;
  sellBatchId?: string | null;
  customerName: string;
  customerEmail: string;
  customerId: number;
  status: string;
  /** received_assets.status or "unknown" — includes sentToVendor, transferredToMaster, etc. */
  masterWalletStatus: string;
  /** True for fake/scam/revoked deposits (no credit). */
  flagged?: boolean;
  flagReason?: string | null;
  pendingVerification?: boolean;
  txHash: string;
  amount: string;
  amountUsd: string;
  amountNaira: string;
  currency: string;
  blockchain: string;
  fromAddress: string;
  toAddress: string;
  confirmations: number;
  blockNumber: string | null;
  date: string;
  /** Crypto units sold on platform after this receive (SELL only, not BUY). */
  soldAmount?: string;
  soldAmountUsd?: string;
  soldAmountNaira?: string;
  userRetentionUsd?: string;
  /** Live on-chain balance at customer deposit address (Tron USDT via TronScan). */
  onChainDepositBalance?: string | null;
}

export interface TrackingStep {
  title: string;
  status: 'completed' | 'pending' | string;
  date: string;
  details: Record<string, string | number | null>;
}

export interface TrackingDetails {
  transactionId: string;
  ledgerType?: LedgerRowType;
  balanceBucket?: string | null;
  sellBatchId?: string | null;
  status: string;
  masterWalletStatus: string;
  flagged?: boolean;
  flagReason?: string | null;
  pendingVerification?: boolean;
  depositVerification?: {
    status: string;
    attempts: number;
    provider: string | null;
    failureReason: string | null;
    failureReasonLabel?: string | null;
    failureReasonDetail?: string | null;
    rejectionCode?: string | null;
    rejectionStage?: string | null;
    webhookAmount: string | null;
    onChainAmount: string | null;
    contractAddress: string | null;
    nextRetryAt: string | null;
  } | null;
  currency: string;
  blockchain: string;
  amount: string;
  amountUsd: string;
  amountNaira: string;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  blockNumber: string | null;
  confirmations: number;
  customer: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    profilePicture: string | null;
  } | null;
  receivedAsset: {
    id: number;
    accountId: string | null;
    status: string;
    reference: string | null;
    index: number | null;
    transactionDate: string | null;
  } | null;
  /** Admin vendor disbursements (ReceivedAssetDisbursement) returned with details. */
  disbursements?: TrackingDisbursement[];
  virtualAccount?: {
    id: number;
    accountId: string;
    currency: string;
    blockchain: string;
    virtualBalance?: string | null;
    onChainBalance?: string | null;
    totalBalance?: string | null;
    walletCurrency?: {
      symbol: string | null;
      name: string | null;
      isToken: boolean | null;
      tokenType: string | null;
    } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  soldAmount?: string;
  soldAmountUsd?: string;
  soldAmountNaira?: string;
  userRetentionUsd?: string;
  /** Live on-chain balance at customer deposit address (Tron USDT via TronScan). */
  onChainDepositBalance?: string | null;
}

export interface TrackingDisbursement {
  id?: number;
  /** e.g. `vendor`, `master_wallet` — deposit-originated outflows from ReceivedAssetDisbursement */
  disbursementType?: string;
  status?: string;
  amount?: string;
  amountUsd?: string | null;
  currency?: string;
  blockchain?: string;
  toAddress?: string;
  txHash?: string | null;
  vendor?: {
    id: number;
    name: string;
    walletAddress: string;
  } | null;
  vendorId?: number;
  adminUserId?: number;
  performedBy?: {
    userId: number;
    name: string;
    role: string;
  };
  networkFee?: string | null;
  createdAt?: string;
  gasFundingTxHash?: string | null;
}
