import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@renderer/api/customApiCall';
import {
  REFERRAL_SERVICES,
  type ReferralService,
  type UserReferralOverrideRow,
  getReferralsUserOverrides,
  upsertReferralsUserOverride,
  deleteReferralsUserOverride,
} from '@renderer/api/admin/referrals';

function errMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : 'Request failed';
}

const SERVICE_LABELS: Record<ReferralService, string> = {
  BILL_PAYMENT: 'Bill payment',
  GIFT_CARD_BUY: 'Gift card buy',
  GIFT_CARD_SELL: 'Gift card sell',
  CRYPTO_BUY: 'Crypto buy',
  CRYPTO_SELL: 'Crypto sell',
};

interface ReferralUserOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  userId: string | number;
  userName: string;
}

const ReferralUserOverrideModal: React.FC<ReferralUserOverrideModalProps> = ({
  isOpen,
  onClose,
  token,
  userId,
  userName,
}) => {
  const queryClient = useQueryClient();
  const [service, setService] = useState<ReferralService>('CRYPTO_BUY');
  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [commissionValue, setCommissionValue] = useState('');

  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ['admin-referrals-user-overrides', token, userId, isOpen],
    queryFn: () => getReferralsUserOverrides(token, userId),
    enabled: !!token && !!userId && isOpen,
  });

  const selectedOverride = useMemo(
    () => overrides.find((x) => x.service === service),
    [overrides, service]
  );

  useEffect(() => {
    if (!isOpen) return;
    const first = (overrides[0]?.service as ReferralService | undefined) ?? 'CRYPTO_BUY';
    setService(first);
  }, [isOpen, overrides]);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedOverride) {
      setCommissionType(selectedOverride.commissionType);
      setCommissionValue(String(selectedOverride.commissionValue ?? ''));
    } else {
      setCommissionType('PERCENTAGE');
      setCommissionValue('');
    }
  }, [isOpen, selectedOverride]);

  const upsertMut = useMutation({
    mutationFn: () =>
      upsertReferralsUserOverride(token, userId, {
        service,
        commissionType,
        commissionValue: Number(commissionValue),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-referrals-user-overrides'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-referrals-list'] });
      onClose();
    },
    onError: (e) => alert(errMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteReferralsUserOverride(token, userId, service),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-referrals-user-overrides'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-referrals-list'] });
    },
    onError: (e) => alert(errMessage(e)),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[70] p-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit user referral override</h2>
            <p className="text-sm text-gray-500">{userName || `User #${userId}`}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading overrides…</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="text-gray-600">Service</span>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={service}
                    onChange={(e) => setService(e.target.value as ReferralService)}
                  >
                    {REFERRAL_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {SERVICE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-gray-600">Commission type</span>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={commissionType}
                    onChange={(e) => setCommissionType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                  >
                    <option value="PERCENTAGE">PERCENTAGE</option>
                    <option value="FIXED">FIXED</option>
                  </select>
                </label>
              </div>

              <label className="text-sm block">
                <span className="text-gray-600">Commission value</span>
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  placeholder={commissionType === 'PERCENTAGE' ? 'e.g. 1.5' : 'e.g. 500'}
                />
              </label>

              <div className="text-xs text-gray-500">
                {selectedOverride ? (
                  <span>
                    Existing override found for <strong>{SERVICE_LABELS[service]}</strong>. Saving will update it.
                  </span>
                ) : (
                  <span>
                    No override exists for <strong>{SERVICE_LABELS[service]}</strong>. Saving will create one.
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-between gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-red-300 text-red-700 disabled:opacity-50"
            disabled={!selectedOverride || deleteMut.isPending || upsertMut.isPending}
            onClick={() => {
              if (window.confirm(`Delete override for ${SERVICE_LABELS[service]}?`)) deleteMut.mutate();
            }}
          >
            {deleteMut.isPending ? 'Deleting…' : 'Delete override'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300"
              onClick={onClose}
              disabled={deleteMut.isPending || upsertMut.isPending}
            >
              Close
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[#147341] text-white disabled:opacity-50"
              disabled={!commissionValue || upsertMut.isPending || deleteMut.isPending}
              onClick={() => upsertMut.mutate()}
            >
              {upsertMut.isPending ? 'Saving…' : 'Save override'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralUserOverrideModal;
