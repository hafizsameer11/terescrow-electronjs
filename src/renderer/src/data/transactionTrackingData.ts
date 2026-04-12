export type MasterWalletStatus = 'inWallet' | 'transferredToMaster' | 'unknown' | 'sentToVendor' | string;

export interface TrackingListItem {
  id: number;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerId: number;
  status: string;
  /** received_assets.status or "unknown" — includes sentToVendor, transferredToMaster, etc. */
  masterWalletStatus: string;
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
}

export interface TrackingStep {
  title: string;
  status: 'completed' | 'pending' | string;
  date: string;
  details: Record<string, string | number | null>;
}

export interface TrackingDetails {
  transactionId: string;
  status: string;
  masterWalletStatus: string;
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
  createdAt: string;
  updatedAt: string;
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
  networkFee?: string | null;
  createdAt?: string;
  gasFundingTxHash?: string | null;
}
