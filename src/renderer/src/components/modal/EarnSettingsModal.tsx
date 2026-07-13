import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import { getReferralsEarnSettings, updateReferralsEarnSettings } from '@renderer/api/admin/referrals';

interface EarnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EarnSettingsModal: React.FC<EarnSettingsModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [signupBonusNgn, setSignupBonusNgn] = useState(10000);
  const [minFirstWithdrawalNgn, setMinFirstWithdrawalNgn] = useState(20000);
  const [commissionReferralTradesPct, setCommissionReferralTradesPct] = useState(5);
  const [commissionDownlineTradesPct, setCommissionDownlineTradesPct] = useState(2);

  const { data: settings } = useQuery({
    queryKey: ['admin-referrals-earn-settings', token],
    queryFn: () => getReferralsEarnSettings(token!),
    enabled: !!token && isOpen,
  });

  useEffect(() => {
    if (settings) {
      setSignupBonusNgn(settings.signupBonusNgn ?? 10000);
      setMinFirstWithdrawalNgn(settings.minFirstWithdrawalNgn ?? 20000);
      setCommissionReferralTradesPct(settings.commissionReferralTradesPct ?? 5);
      setCommissionDownlineTradesPct(settings.commissionDownlineTradesPct ?? 2);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (body: {
      signupBonusNgn: number;
      minFirstWithdrawalNgn: number;
      commissionReferralTradesPct: number;
      commissionDownlineTradesPct: number;
    }) => updateReferralsEarnSettings(token!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-referrals-earn-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrals-commission-settings'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleUpdate = () => {
    updateMutation.mutate({
      signupBonusNgn,
      minFirstWithdrawalNgn,
      commissionReferralTradesPct,
      commissionDownlineTradesPct,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Earn Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500">
            Signup bonus and first-withdrawal minimum match referral commission settings (NGN).
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signup bonus</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-600">₦</span>
              <input
                type="number"
                min={0}
                step={1}
                value={signupBonusNgn}
                onChange={(e) => setSignupBonusNgn(Number(e.target.value) || 0)}
                className="flex-1 px-3 py-2 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min balance for first withdrawal</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-600">₦</span>
              <input
                type="number"
                min={0}
                step={1}
                value={minFirstWithdrawalNgn}
                onChange={(e) => setMinFirstWithdrawalNgn(Number(e.target.value) || 0)}
                className="flex-1 px-3 py-2 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission on referral trades</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <input
                type="number"
                min={0}
                max={100}
                value={commissionReferralTradesPct}
                onChange={(e) => setCommissionReferralTradesPct(Number(e.target.value) || 0)}
                className="flex-1 px-3 py-2 outline-none"
              />
              <span className="px-3 py-2 bg-gray-100 text-gray-600">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission on downline trades</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <input
                type="number"
                min={0}
                max={100}
                value={commissionDownlineTradesPct}
                onChange={(e) => setCommissionDownlineTradesPct(Number(e.target.value) || 0)}
                className="flex-1 px-3 py-2 outline-none"
              />
              <span className="px-3 py-2 bg-gray-100 text-gray-600">%</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarnSettingsModal;
