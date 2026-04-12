import React, { useState } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import { MdCheckCircle, MdPending } from 'react-icons/md';
import type { TrackingStep, TrackingDetails, TrackingDisbursement } from '@renderer/data/transactionTrackingData';
import { formatNairaAmount } from '@renderer/api/helper';

type ModalTab = 'tracking' | 'transaction';

interface TrackingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TrackingStep[];
  details: TrackingDetails | null;
  /** POST …/send-to-vendor (deposit key → vendor). */
  onOpenSendToVendor?: () => void;
  /** POST …/send-to-master-wallet (deposit key → platform master address). */
  onOpenSendToMaster?: () => void;
  onOpenSwapChangeNow?: () => void;
}

function disbursementTypeLabel(type: string | undefined): string {
  const t = (type || '').toLowerCase();
  if (t === 'master_wallet') return 'Master wallet';
  if (t === 'vendor' || t === '') return 'Vendor';
  return type || '—';
}

function masterWalletLabel(status: string) {
  const key = (status || 'unknown').toLowerCase().replace(/\s/g, '');
  const map: Record<string, { label: string; cls: string }> = {
    inwallet: { label: 'In Wallet', cls: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
    transferredtomaster: { label: 'Transferred to Master', cls: 'bg-green-100 text-green-800 border-green-400' },
    senttovendor: { label: 'Sent to vendor', cls: 'bg-blue-100 text-blue-800 border-blue-400' },
    unknown: { label: 'Unknown', cls: 'bg-gray-100 text-gray-600 border-gray-300' },
  };
  const c = map[key] ?? map.unknown;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}>{c.label}</span>;
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  const isSuccess = s === 'successful' || s === 'completed';
  const isPending = s === 'pending' || s === 'processing';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isSuccess ? 'bg-green-100 text-green-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-green-600' : isPending ? 'bg-amber-600' : 'bg-red-600'}`} />
      {status}
    </span>
  );
}

function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
}

const TrackingDetailsModal: React.FC<TrackingDetailsModalProps> = ({
  isOpen,
  onClose,
  steps,
  details,
  onOpenSendToVendor,
  onOpenSendToMaster,
  onOpenSwapChangeNow,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('tracking');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Tracking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>

        <div className="p-4 border-b flex gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === 'tracking' ? 'bg-[#147341] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tracking Steps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transaction')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === 'transaction' ? 'bg-[#147341] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Transaction Details
          </button>
        </div>

        {activeTab === 'tracking' && (
          <div className="p-6">
            {steps.length === 0 ? (
              <p className="text-center text-gray-500">No tracking steps available.</p>
            ) : (
              <div className="flex flex-col">
                {steps.map((step, index) => {
                  const isCompleted = step.status === 'completed';
                  return (
                    <React.Fragment key={index}>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {isCompleted ? (
                            <MdCheckCircle className="text-green-500 text-2xl shrink-0" />
                          ) : (
                            <MdPending className="text-yellow-500 text-2xl shrink-0" />
                          )}
                          {index < steps.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-300 my-1" />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <h3 className="font-semibold text-gray-800">{step.title}</h3>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(step.date).toLocaleString()}
                          </p>
                          {Object.keys(step.details).length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                              {Object.entries(step.details).map(([key, val]) =>
                                val != null ? (
                                  <div key={key} className="flex gap-2">
                                    <span className="text-gray-500 capitalize shrink-0">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                    <span className="text-gray-800 font-mono text-xs break-all">{String(val)}</span>
                                  </div>
                                ) : null
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transaction' && details && (
          <div className="p-6 space-y-5">
            {details.customer && (
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                  {details.customer.firstname?.[0]}{details.customer.lastname?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{details.customer.firstname} {details.customer.lastname}</p>
                  <p className="text-sm text-gray-500">{details.customer.email}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  {statusBadge(details.status)}
                  {masterWalletLabel(details.masterWalletStatus)}
                </div>
              </div>
            )}

            <Section title="On-Chain Info">
              <Field label="TX Hash" value={details.txHash} mono copyable />
              <Field label="From" value={details.fromAddress} mono copyable />
              <Field label="To" value={details.toAddress} mono copyable />
              <Field label="Block" value={details.blockNumber ?? '—'} />
              <Field label="Confirmations" value={String(details.confirmations)} />
            </Section>

            <Section title="Value">
              <Field label="Crypto Amount" value={`${details.amount} ${details.currency}`} />
              <Field label="USD Value" value={`$${details.amountUsd}`} />
              <Field label="NGN Value" value={`₦${formatNairaAmount(details.amountNaira)}`} />
              <Field label="Blockchain" value={details.blockchain} className="capitalize" />
            </Section>

            <Section title="Transaction">
              <Field label="Transaction ID" value={details.transactionId} mono copyable />
              <Field label="Status" value={details.status} className="capitalize" />
              <Field label="Master Wallet" value={details.masterWalletStatus} />
              <Field label="Created" value={new Date(details.createdAt).toLocaleString()} />
              <Field label="Updated" value={new Date(details.updatedAt).toLocaleString()} />
            </Section>

            {details.receivedAsset && (
              <Section title="Received Asset (Internal)">
                <Field label="Account ID" value={details.receivedAsset.accountId ?? '—'} mono />
                <Field label="Status" value={details.receivedAsset.status} />
                <Field label="Reference" value={details.receivedAsset.reference ?? '—'} />
                <Field label="Deposit Date" value={details.receivedAsset.transactionDate ? new Date(details.receivedAsset.transactionDate).toLocaleString() : '—'} />
              </Section>
            )}

            {details.disbursements && details.disbursements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Disbursements</h3>
                <div className="space-y-3">
                  {details.disbursements.map((d: TrackingDisbursement, i: number) => (
                    <div
                      key={String(d.id ?? i)}
                      className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50/80"
                    >
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="text-gray-500">Type</span>
                        <span className="text-gray-800 font-medium">{disbursementTypeLabel(d.disbursementType)}</span>
                      </div>
                      <Field label="Status" value={d.status ?? '—'} />
                      <Field label="Amount" value={d.amount ?? '—'} />
                      <Field label="USD" value={d.amountUsd ?? '—'} />
                      <Field label="To" value={d.toAddress ?? '—'} mono />
                      <Field label="TX hash" value={d.txHash ?? '—'} mono copyable />
                      <Field
                        label="Vendor"
                        value={
                          (d.disbursementType || '').toLowerCase() === 'master_wallet'
                            ? '—'
                            : d.vendor
                              ? `${d.vendor.name} (#${d.vendor.id})`
                              : d.vendorId != null
                                ? `#${d.vendorId}`
                                : '—'
                        }
                      />
                      <Field label="Network fee" value={d.networkFee ?? '—'} />
                      {d.gasFundingTxHash ? (
                        <Field label="Gas funding tx" value={d.gasFundingTxHash} mono copyable />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(onOpenSendToVendor || onOpenSendToMaster || onOpenSwapChangeNow) && (
              <div className="rounded-lg border border-[#147341]/30 bg-[#147341]/5 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800">Actions</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-medium">Deposit disbursements</span> sign from the customer <span className="font-medium">deposit</span> key and
                  create <span className="font-mono">ReceivedAssetDisbursement</span> rows — not <span className="font-mono">POST …/master-wallet/send</span>{' '}
                  (treasury signing). Vendor: <span className="font-mono">POST …/send-to-vendor</span> + <span className="font-mono">vendorId</span>. Master:{' '}
                  <span className="font-mono">POST …/send-to-master-wallet</span> (optional <span className="font-mono">amount</span> must equal full receive if set).
                </p>
                <div className="flex flex-wrap gap-2">
                  {onOpenSendToVendor && (
                    <button
                      type="button"
                      onClick={() => onOpenSendToVendor()}
                      className="px-4 py-2 bg-[#147341] text-white text-sm font-medium rounded-lg hover:bg-[#0d5a2e]"
                    >
                      Send to vendor
                    </button>
                  )}
                  {onOpenSendToMaster && (
                    <button
                      type="button"
                      onClick={() => onOpenSendToMaster()}
                      className="px-4 py-2 bg-white border border-[#147341] text-[#147341] text-sm font-medium rounded-lg hover:bg-green-50"
                    >
                      Send to master wallet
                    </button>
                  )}
                  {onOpenSwapChangeNow && (
                    <button
                      type="button"
                      onClick={() => onOpenSwapChangeNow()}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
                    >
                      Swap via ChangeNOW
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Use the table checkboxes + “Bulk send to vendor” for many receives at once (vendor only).</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transaction' && !details && (
          <div className="p-6 text-center text-gray-500">Loading details...</div>
        )}
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  copyable,
  className = '',
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  className?: string;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 px-4">
      <span className="text-gray-500 text-sm">{label}</span>
      <div className="flex items-center gap-1.5 max-w-[60%]">
        <span className={`text-sm text-gray-800 text-right break-all ${mono ? 'font-mono text-xs' : ''} ${className}`}>
          {value}
        </span>
        {copyable && value && value !== '—' && (
          <button
            type="button"
            onClick={() => copyToClipboard(value)}
            className="text-gray-400 hover:text-gray-700 shrink-0"
            title="Copy"
          >
            <IoCopyOutline className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TrackingDetailsModal;
