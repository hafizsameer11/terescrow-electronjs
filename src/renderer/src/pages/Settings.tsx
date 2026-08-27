import { createRol } from '@renderer/api/queries/rolemanagement';
import PrivacyPageModal from '@renderer/components/modal/PrivacyPageModal';
import RoleModal from '@renderer/components/modal/RoleModal';
import StroWalletConfigModal from '@renderer/components/modal/StroWalletConfigModal';
import StroWalletTopupModal from '@renderer/components/modal/StroWalletTopupModal';
import PermissionTable from '@renderer/components/PermissionTable';
import UserDetail from '@renderer/components/UserDetail';
import { useAuth } from '@renderer/context/authContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  getPlatformOperationSettings,
  updatePlatformOperationSettings,
} from '@renderer/api/admin/platformSettings';
import {
  getMerchantsOverview,
  getStroWalletSettings,
  saveStroWalletTopupSettings,
  topUpStroWallet,
  type StroWalletTopupSettingsForm,
} from '@renderer/api/admin/merchants';
type SettingsTab =
  | 'profile'
  | 'role_management'
  | 'merchants'
  | 'operation_controls';

const Settings = () => {
  const { userData, token: authToken } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const validTabs: SettingsTab[] = ['profile', 'role_management', 'merchants', 'operation_controls'];
  const initialTab: SettingsTab =
    tabFromUrl === 'crypto_rates' ||
    tabFromUrl === 'ticker_mapping' ||
    tabFromUrl === 'vendors' ||
    tabFromUrl === 'swap_payout_wallets'
      ? 'profile'
      : (tabFromUrl && validTabs.includes(tabFromUrl as SettingsTab) ? (tabFromUrl as SettingsTab) : null) ||
        (location.pathname === '/settings/merchants' ? 'merchants' : 'profile');
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [isPrivacyModal, setIsPrivacyModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [strowalletConfigOpen, setStrowalletConfigOpen] = useState(false);
  const [strowalletTopupOpen, setStrowalletTopupOpen] = useState(false);
  const [palmpayWithdrawDisabled, setPalmpayWithdrawDisabled] = useState(false);
  const [cryptoOutsideSendDisabled, setCryptoOutsideSendDisabled] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get('tab') === 'crypto_rates') {
      navigate('/rates?tab=crypto', { replace: true });
      return;
    }
    if (
      searchParams.get('tab') === 'ticker_mapping' ||
      searchParams.get('tab') === 'swap_payout_wallets' ||
      location.pathname === '/settings/vendors'
    ) {
      navigate('/settings', { replace: true });
      return;
    }
    if (location.pathname === '/settings/merchants') setActiveTab('merchants');
    else {
      const raw = searchParams.get('tab');
      const t = raw as SettingsTab | null;
      setActiveTab(t && validTabs.includes(t) ? t : 'profile');
    }
  }, [searchParams, location.pathname, navigate]);

  const { data: operationSettings } = useQuery({
    queryKey: ['admin-platform-operation-settings', authToken],
    queryFn: () => getPlatformOperationSettings(authToken!),
    enabled: !!authToken && activeTab === 'operation_controls',
  });
  const { data: merchantsOverview, refetch: refetchMerchants } = useQuery({
    queryKey: ['admin-merchants-overview', authToken],
    queryFn: () => getMerchantsOverview(authToken!),
    enabled: !!authToken && activeTab === 'merchants',
  });
  const { data: strowalletSettings } = useQuery({
    queryKey: ['admin-strowallet-settings', authToken],
    queryFn: () => getStroWalletSettings(authToken!),
    enabled: !!authToken && activeTab === 'merchants',
  });

  useEffect(() => {
    if (operationSettings) {
      setPalmpayWithdrawDisabled(operationSettings.palmpayWithdrawDisabled);
      setCryptoOutsideSendDisabled(operationSettings.cryptoOutsideSendDisabled);
    }
  }, [operationSettings]);

  const updateOperationSettingsMutation = useMutation({
    mutationFn: () =>
      updatePlatformOperationSettings(authToken!, {
        palmpayWithdrawDisabled,
        cryptoOutsideSendDisabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-operation-settings'] });
    },
  });
  const saveStrowalletConfigMutation = useMutation({
    mutationFn: (payload: StroWalletTopupSettingsForm) => saveStroWalletTopupSettings(authToken!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-merchants-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-strowallet-settings'] });
      setStrowalletConfigOpen(false);
    },
  });
  const topupStrowalletMutation = useMutation({
    mutationFn: (amount: number) => topUpStroWallet(authToken!, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-merchants-overview'] });
      setStrowalletTopupOpen(false);
    },
  });

  const setTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (tab === 'merchants') navigate('/settings/merchants');
    else if (tab === 'profile') navigate('/settings');
    else navigate(`/settings?tab=${tab}`);
  };

  const { mutate: createRole } = useMutation({
    mutationFn: (data: { name: string }) => createRol(authToken!, data),
    onSuccess: () => alert('Role created successfully.'),
    onError: () => alert('Failed to create role.'),
  });

  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex justify-between gap-9">
        <div>
          <h1 className="text-[40px] text-gray-800 font-normal">Settings</h1>
          <div className="flex items-center mt-5 flex-wrap gap-2">
            <button onClick={() => setTab('profile')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'profile' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'}`}>Profile</button>
            {userData?.role === 'admin' && (
              <>
                <button onClick={() => setTab('role_management')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'role_management' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'}`}>Role Management</button>
                <button onClick={() => setTab('merchants')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'merchants' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'}`}>Merchants</button>
                <button onClick={() => setTab('operation_controls')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'operation_controls' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'}`}>Operation controls</button>
              </>
            )}
          </div>
        </div>
        {activeTab === 'profile' && userData?.role === 'admin' && (
          <div className="flex justify-end items-center flex-1">
            <button className="px-4 py-2 rounded-xl font-normal bg-[#147341] text-white" onClick={() => setIsPrivacyModal(true)}>Privacy Policy Page Links</button>
          </div>
        )}
        {activeTab === 'merchants' && (
          <div className="flex justify-end items-end flex-1 gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl font-normal border border-[#147341] text-[#147341]"
              onClick={() => refetchMerchants()}
            >
              Refresh balances
            </button>
          </div>
        )}
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-4">
          <UserDetail />
          <p className="text-xs text-gray-500">
            Renderer errors are appended to{' '}
            <span className="font-mono">logs/renderer-errors.log</span> in the app user data folder (via Electron IPC).
          </p>
        </div>
      ) : activeTab === 'merchants' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PalmPay card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-gray-800">PalmPay</h2>
                  <p className="text-sm text-gray-500">Merchant wallet for payouts &amp; deposits</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${merchantsOverview?.palmpay.configured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {merchantsOverview?.palmpay.configured ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Environment</dt>
                  <dd className="text-gray-800">{merchantsOverview?.palmpay.environment ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Merchant ID</dt>
                  <dd className="text-gray-800 font-mono text-xs">{merchantsOverview?.palmpay.merchantId ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">App ID</dt>
                  <dd className="text-gray-800 font-mono text-xs">{merchantsOverview?.palmpay.appId ?? '—'}</dd>
                </div>
              </dl>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">Available balance</p>
                {merchantsOverview?.palmpay.balance ? (
                  <p className="text-2xl font-semibold text-gray-900">
                    ₦{merchantsOverview.palmpay.balance.availableBalanceNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-sm text-amber-700">
                    {merchantsOverview?.palmpay.balanceError || 'Balance unavailable'}
                  </p>
                )}
                {merchantsOverview?.palmpay.balance && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: ₦{merchantsOverview.palmpay.balance.currentBalanceNgn.toLocaleString()} · Frozen: ₦{merchantsOverview.palmpay.balance.frozenBalanceNgn.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500">PalmPay credentials are managed via server environment variables.</p>
            </div>

            {/* StroWallet card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-gray-800">StroWallet</h2>
                  <p className="text-sm text-gray-500">Bill payments (airtime, data, electricity, cable)</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${merchantsOverview?.strowallet.configured ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {merchantsOverview?.strowallet.configured ? 'Keys in .env' : 'Set STROWALLET_PUBLIC_KEY in .env'}
                </span>
              </div>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Public key</dt>
                  <dd className="text-gray-800 font-mono text-xs">{merchantsOverview?.strowallet.publicKeyMasked ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Merchant ID</dt>
                  <dd className="text-gray-800 font-mono text-xs">{merchantsOverview?.strowallet.merchantId ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Secret key</dt>
                  <dd className="text-gray-800 font-mono text-xs">{merchantsOverview?.strowallet.hasSecretKey ? 'Set in .env' : '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Top-up account</dt>
                  <dd className="text-gray-800 text-right">
                    {merchantsOverview?.strowallet.topupBank?.accountNumber
                      ? `${merchantsOverview.strowallet.topupBank.bankName || merchantsOverview.strowallet.topupBank.bankCode} · ${merchantsOverview.strowallet.topupBank.accountNumber}`
                      : '—'}
                  </dd>
                </div>
              </dl>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">NGN balance</p>
                {merchantsOverview?.strowallet.balanceNgn?.balance != null ? (
                  <p className="text-2xl font-semibold text-gray-900">
                    ₦{merchantsOverview.strowallet.balanceNgn.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-sm text-amber-700">
                    {merchantsOverview?.strowallet.balanceError || (merchantsOverview?.strowallet.configured ? 'Could not load balance' : 'Add STROWALLET_PUBLIC_KEY to server .env')}
                  </p>
                )}
                {merchantsOverview?.strowallet.balanceUsd?.balance != null && (
                  <p className="text-xs text-gray-500 mt-1">
                    USD: ${merchantsOverview.strowallet.balanceUsd.balance.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#147341] text-white text-sm"
                  onClick={() => setStrowalletConfigOpen(true)}
                >
                  Edit top-up account
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-[#147341] text-[#147341] text-sm disabled:opacity-50"
                  disabled={!merchantsOverview?.strowallet.configured || !merchantsOverview?.strowallet.topupBank?.accountNumber}
                  onClick={() => setStrowalletTopupOpen(true)}
                >
                  Top up via PalmPay
                </button>
              </div>
              <p className="text-xs text-gray-500">
                API keys: <span className="font-mono">STROWALLET_PUBLIC_KEY</span> in server{' '}
                <span className="font-mono">.env</span> (same pattern as PalmPay).
              </p>
            </div>
          </div>

          {/* Recent StroWallet top-ups */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-800">Recent StroWallet top-ups (PalmPay payout)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">PalmPay order</th>
                    <th className="px-4 py-3">By</th>
                  </tr>
                </thead>
                <tbody>
                  {(merchantsOverview?.strowallet.recentTopups ?? []).map((t) => (
                    <tr key={t.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium">₦{parseFloat(t.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.accountNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          t.status === 'completed' ? 'bg-green-100 text-green-800' :
                          t.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{t.palmpayOrderNo || t.palmpayOrderId || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {t.initiatedBy ? `${t.initiatedBy.firstname} ${t.initiatedBy.lastname}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(merchantsOverview?.strowallet.recentTopups ?? []).length === 0 && (
              <p className="p-6 text-center text-gray-500">No top-ups yet.</p>
            )}
          </div>

          <StroWalletConfigModal
            isOpen={strowalletConfigOpen}
            onClose={() => setStrowalletConfigOpen(false)}
            initial={strowalletSettings}
            onSubmit={(data) => saveStrowalletConfigMutation.mutate(data)}
            isSubmitting={saveStrowalletConfigMutation.isPending}
          />
          <StroWalletTopupModal
            isOpen={strowalletTopupOpen}
            onClose={() => setStrowalletTopupOpen(false)}
            overview={merchantsOverview?.strowallet}
            onSubmit={(amount) => topupStrowalletMutation.mutate(amount)}
            isSubmitting={topupStrowalletMutation.isPending}
          />
          {(saveStrowalletConfigMutation.isError || topupStrowalletMutation.isError) && (
            <p className="text-sm text-red-600">
              {(saveStrowalletConfigMutation.error as Error)?.message ||
                (topupStrowalletMutation.error as Error)?.message ||
                'Request failed'}
            </p>
          )}
          {(saveStrowalletConfigMutation.isSuccess || topupStrowalletMutation.isSuccess) && (
            <p className="text-sm text-green-700">Saved successfully.</p>
          )}
        </div>
      ) : activeTab === 'operation_controls' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800">Global operation controls</h2>
            <p className="text-sm text-gray-500 mt-1">
              Applies to all users. When disabled, the mobile app receives a generic &quot;Something went wrong&quot; error.
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={palmpayWithdrawDisabled}
              onChange={(e) => setPalmpayWithdrawDisabled(e.target.checked)}
            />
            <span>
              <span className="block font-medium text-gray-800">Stop PalmPay withdrawals</span>
              <span className="block text-sm text-gray-500">Blocks NGN bank withdrawals via PalmPay payout for every user.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={cryptoOutsideSendDisabled}
              onChange={(e) => setCryptoOutsideSendDisabled(e.target.checked)}
            />
            <span>
              <span className="block font-medium text-gray-800">Stop crypto outside send</span>
              <span className="block text-sm text-gray-500">Blocks sending crypto to external wallet addresses for every user.</span>
            </span>
          </label>
          <button
            type="button"
            onClick={() => updateOperationSettingsMutation.mutate()}
            disabled={updateOperationSettingsMutation.isPending}
            className="px-4 py-2 rounded-lg bg-[#147341] text-white disabled:opacity-60"
          >
            {updateOperationSettingsMutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
          {updateOperationSettingsMutation.isSuccess && (
            <p className="text-sm text-green-700">Settings saved.</p>
          )}
        </div>
      ) : (
        <div>
          <PermissionTable />
          <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={(roleName) => createRole({ name: roleName })} />
        </div>
      )}

      <PrivacyPageModal isOpen={isPrivacyModal} onClose={() => setIsPrivacyModal(false)} />
    </div>
  );
};

export default Settings;
