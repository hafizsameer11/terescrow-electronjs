import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import {
  getPalmpayBanks,
  verifyPalmpayBankAccount,
  type StroWalletTopupSettingsForm,
  type StroWalletSettingsResponse,
} from '@renderer/api/admin/merchants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initial?: StroWalletSettingsResponse;
  onSubmit: (data: StroWalletTopupSettingsForm) => void;
  isSubmitting?: boolean;
};

type BankOption = { value: string; label: string; bankName: string };

const emptyForm: StroWalletTopupSettingsForm = {
  topupBankCode: '',
  topupBankName: '',
  topupAccountNumber: '',
  topupAccountName: '',
  isActive: true,
};

export default function StroWalletConfigModal({
  isOpen,
  onClose,
  initial,
  onSubmit,
  isSubmitting,
}: Props) {
  const { token } = useAuth();
  const [form, setForm] = useState<StroWalletTopupSettingsForm>(emptyForm);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const { data: banks = [], isLoading: banksLoading, isError: banksError } = useQuery({
    queryKey: ['admin-palmpay-banks', token],
    queryFn: () => getPalmpayBanks(token!),
    enabled: !!token && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const bankOptions = useMemo<BankOption[]>(
    () =>
      [...banks]
        .sort((a, b) => a.bankName.localeCompare(b.bankName))
        .map((b) => ({
          value: b.bankCode,
          label: `${b.bankName} (${b.bankCode})`,
          bankName: b.bankName,
        })),
    [banks]
  );

  const selectedBank = bankOptions.find((o) => o.value === form.topupBankCode) ?? null;

  const verifyMutation = useMutation({
    mutationFn: () =>
      verifyPalmpayBankAccount(token!, {
        bankCode: form.topupBankCode!.trim(),
        accountNumber: form.topupAccountNumber!.trim(),
      }),
    onSuccess: (result) => {
      if (result.isValid && result.accountName) {
        setForm((s) => ({ ...s, topupAccountName: result.accountName }));
        setVerifyMessage(`Verified: ${result.accountName}`);
      } else {
        setVerifyMessage(result.errorMessage || 'Account could not be verified');
      }
    },
    onError: (err: Error) => setVerifyMessage(err.message || 'Verification failed'),
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      topupBankCode: initial?.topupBankCode ?? '',
      topupBankName: initial?.topupBankName ?? '',
      topupAccountNumber: initial?.topupAccountNumber ?? '',
      topupAccountName: initial?.topupAccountName ?? '',
      isActive: initial?.isActive ?? true,
    });
    setVerifyMessage(null);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topupBankCode?.trim()) {
      setVerifyMessage('Please select a bank from the PalmPay list.');
      return;
    }
    onSubmit(form);
  };

  const canVerify =
    !!form.topupBankCode?.trim() &&
    !!form.topupAccountNumber?.trim() &&
    form.topupAccountNumber.trim().length >= 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">StroWallet top-up account</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-900 space-y-2">
            <p className="font-medium">API keys are set in server .env</p>
            <ul className="text-xs font-mono space-y-1 text-blue-800">
              <li>STROWALLET_PUBLIC_KEY {initial?.configured ? '✓' : '(required)'}</li>
              <li>STROWALLET_SECRET_KEY {initial?.hasSecretKey ? '✓' : '(optional)'}</li>
              <li>STROWALLET_MERCHANT_ID {initial?.merchantId ? '✓' : '(optional)'}</li>
              <li>STROWALLET_WEBSITE_URL {initial?.websiteUrl ? '✓' : '(optional)'}</li>
            </ul>
            {initial?.publicKeyMasked && (
              <p className="text-xs text-blue-700">Public key: {initial.publicKeyMasked}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">PalmPay payout destination</h3>
            <p className="text-xs text-gray-500 mb-3">
              Select the bank from PalmPay&apos;s list so the correct bank code is used for payouts.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank *</label>
                <Select<BankOption>
                  options={bankOptions}
                  value={selectedBank}
                  onChange={(opt) => {
                    setVerifyMessage(null);
                    setForm((s) => ({
                      ...s,
                      topupBankCode: opt?.value ?? '',
                      topupBankName: opt?.bankName ?? '',
                    }));
                  }}
                  isLoading={banksLoading}
                  isDisabled={banksLoading || banksError}
                  placeholder={banksLoading ? 'Loading banks…' : 'Search and select bank'}
                  noOptionsMessage={() => (banksError ? 'Failed to load banks' : 'No banks found')}
                  className="text-sm"
                  classNamePrefix="strowallet-bank"
                />
                {banksError && (
                  <p className="text-xs text-red-600 mt-1">Could not load PalmPay bank list. Check PalmPay config.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank code</label>
                <input
                  readOnly
                  value={form.topupBankCode ?? ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
                  placeholder="Auto-filled when you select a bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account number *</label>
                <input
                  required
                  inputMode="numeric"
                  value={form.topupAccountNumber ?? ''}
                  onChange={(e) => {
                    setVerifyMessage(null);
                    setForm((s) => ({ ...s, topupAccountNumber: e.target.value.replace(/\D/g, '') }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                  placeholder="10-digit NUBAN"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">Account name *</label>
                  <button
                    type="button"
                    disabled={!canVerify || verifyMutation.isPending}
                    onClick={() => verifyMutation.mutate()}
                    className="text-xs text-[#147341] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {verifyMutation.isPending ? 'Verifying…' : 'Verify with PalmPay'}
                  </button>
                </div>
                <input
                  required
                  value={form.topupAccountName ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, topupAccountName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Account holder name"
                />
                {verifyMessage && (
                  <p
                    className={`text-xs mt-1 ${verifyMessage.startsWith('Verified') ? 'text-green-700' : 'text-amber-700'}`}
                  >
                    {verifyMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
            />
            <span className="text-sm text-gray-700">Enable StroWallet top-ups</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.topupBankCode}
              className="px-4 py-2 bg-[#147341] text-white rounded-lg disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
