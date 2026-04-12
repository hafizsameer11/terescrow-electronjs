import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@renderer/api/customApiCall';
import {
  getReferralsCommissionSettings,
  updateReferralsCommissionSettings,
  type CommissionSettingRow,
  type ReferralService,
} from '@renderer/api/admin/referrals';

function errMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : 'Request failed';
}

function rowKey(r: CommissionSettingRow): string {
  return r.service;
}

const ReferralCommissionSettings: React.FC<{ token: string }> = ({ token }) => {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, CommissionSettingRow>>({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-referrals-commission-settings', token],
    queryFn: () => getReferralsCommissionSettings(token),
    enabled: !!token,
  });

  useEffect(() => {
    const next: Record<string, CommissionSettingRow> = {};
    for (const r of rows) next[rowKey(r)] = { ...r };
    setDrafts(next);
  }, [rows]);

  const saveMut = useMutation({
    mutationFn: (body: Parameters<typeof updateReferralsCommissionSettings>[1]) =>
      updateReferralsCommissionSettings(token, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-referrals-commission-settings'] }),
    onError: (e) => alert(errMessage(e)),
  });

  const updateDraft = (service: ReferralService, patch: Partial<CommissionSettingRow>) => {
    setDrafts((prev) => ({
      ...prev,
      [service]: { ...prev[service], ...patch, service },
    }));
  };

  const saveRow = (service: ReferralService) => {
    const d = drafts[service];
    if (!d) return;
    saveMut.mutate({
      service: d.service,
      commissionType: d.commissionType,
      commissionValue: Number(d.commissionValue),
      level2Pct: Number(d.level2Pct),
      signupBonus: Number(d.signupBonus),
      minFirstWithdrawal: Number(d.minFirstWithdrawal),
      isActive: d.isActive,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Commission settings</h2>
        <p className="text-sm text-gray-500 mt-1">Per-service referral commission (NGN bonuses and thresholds where applicable).</p>
      </div>
      {isLoading ? (
        <p className="p-6 text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-medium">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">L2 %</th>
                <th className="px-4 py-3">Signup bonus</th>
                <th className="px-4 py-3">Min 1st withdrawal</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 w-24">Save</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const d = drafts[rowKey(r)] ?? r;
                return (
                  <tr key={r.service} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{d.service}</td>
                    <td className="px-4 py-3">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={d.commissionType}
                        onChange={(e) =>
                          updateDraft(d.service, { commissionType: e.target.value as 'PERCENTAGE' | 'FIXED' })
                        }
                      >
                        <option value="PERCENTAGE">PERCENTAGE</option>
                        <option value="FIXED">FIXED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-24 border border-gray-300 rounded px-2 py-1"
                        value={d.commissionValue}
                        onChange={(e) => updateDraft(d.service, { commissionValue: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-16 border border-gray-300 rounded px-2 py-1"
                        value={d.level2Pct}
                        onChange={(e) => updateDraft(d.service, { level2Pct: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-28 border border-gray-300 rounded px-2 py-1"
                        value={d.signupBonus}
                        onChange={(e) => updateDraft(d.service, { signupBonus: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-28 border border-gray-300 rounded px-2 py-1"
                        value={d.minFirstWithdrawal}
                        onChange={(e) => updateDraft(d.service, { minFirstWithdrawal: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={d.isActive}
                        onChange={(e) => updateDraft(d.service, { isActive: e.target.checked })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-[#147341] hover:underline font-medium disabled:opacity-50"
                        disabled={saveMut.isPending}
                        onClick={() => saveRow(d.service)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {rows.length === 0 && !isLoading && (
        <p className="p-6 text-center text-gray-500">No commission settings returned.</p>
      )}
    </div>
  );
};

export default ReferralCommissionSettings;
