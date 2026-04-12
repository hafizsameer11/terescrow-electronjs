import { createRol } from '@renderer/api/queries/rolemanagement';
import PrivacyPageModal from '@renderer/components/modal/PrivacyPageModal';
import RoleModal from '@renderer/components/modal/RoleModal';
import VendorModal from '@renderer/components/modal/VendorModal';
import type { VendorFormData } from '@renderer/components/modal/VendorModal';
import PermissionTable from '@renderer/components/PermissionTable';
import UserDetail from '@renderer/components/UserDetail';
import { useAuth } from '@renderer/context/authContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  getAdminVendors,
  createAdminVendor,
  updateAdminVendor,
  deleteAdminVendor,
  type VendorRow,
  type VendorPayload,
} from '@renderer/api/admin/vendors';
import {
  archiveChangeNowPayoutAddress,
  createChangeNowPayoutAddress,
  getChangeNowInternalMap,
  getChangeNowPayoutAddresses,
  upsertChangeNowTickerMapping,
  updateChangeNowPayoutAddress,
} from '@renderer/api/admin/changenow';
type SettingsTab =
  | 'profile'
  | 'role_management'
  | 'vendors'
  | 'swap_payout_wallets'
  | 'ticker_mapping';

const Settings = () => {
  const { userData, token: authToken } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const validTabs: SettingsTab[] = ['profile', 'role_management', 'vendors', 'swap_payout_wallets', 'ticker_mapping'];
  const initialTab: SettingsTab =
    tabFromUrl === 'crypto_rates'
      ? 'profile'
      : (tabFromUrl && validTabs.includes(tabFromUrl as SettingsTab) ? (tabFromUrl as SettingsTab) : null) ||
        (location.pathname === '/settings/vendors' ? 'vendors' : 'profile');
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [isPrivacyModal, setIsPrivacyModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRow | null>(null);
  const [newWallet, setNewWallet] = useState({ label: '', address: '', extraId: '', toNetworkHint: '', isDefault: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get('tab') === 'crypto_rates') {
      navigate('/rates?tab=crypto', { replace: true });
      return;
    }
    if (location.pathname === '/settings/vendors') setActiveTab('vendors');
    else {
      const raw = searchParams.get('tab');
      const t = raw as SettingsTab | null;
      setActiveTab(t && validTabs.includes(t) ? t : 'profile');
    }
  }, [searchParams, location.pathname, navigate]);

  const { data: vendors = [] } = useQuery({
    queryKey: ['admin-vendors', authToken],
    queryFn: () => getAdminVendors(authToken!),
    enabled: !!authToken && activeTab === 'vendors',
  });
  const { data: payoutAddressData } = useQuery({
    queryKey: ['admin-changenow-payout-addresses', authToken],
    queryFn: () => getChangeNowPayoutAddresses(authToken!),
    enabled: !!authToken && activeTab === 'swap_payout_wallets',
  });
  const { data: mapData } = useQuery({
    queryKey: ['admin-changenow-map-internal', authToken],
    queryFn: () => getChangeNowInternalMap(authToken!),
    enabled: !!authToken && activeTab === 'ticker_mapping',
  });

  const createVendorMutation = useMutation({
    mutationFn: (payload: VendorPayload) => createAdminVendor(authToken!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-vendors'] }),
  });
  const updateVendorMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<VendorPayload> }) => updateAdminVendor(authToken!, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-vendors'] }),
  });
  const deleteVendorMutation = useMutation({
    mutationFn: (id: number) => deleteAdminVendor(authToken!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-vendors'] }),
  });
  const createPayoutMutation = useMutation({
    mutationFn: () =>
      createChangeNowPayoutAddress(authToken!, {
        label: newWallet.label,
        address: newWallet.address,
        extraId: newWallet.extraId || null,
        toNetworkHint: newWallet.toNetworkHint || null,
        isDefault: newWallet.isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-changenow-payout-addresses'] });
      setNewWallet({ label: '', address: '', extraId: '', toNetworkHint: '', isDefault: false });
    },
  });
  const archivePayoutMutation = useMutation({
    mutationFn: (id: number) => archiveChangeNowPayoutAddress(authToken!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-changenow-payout-addresses'] }),
  });
  const setDefaultPayoutMutation = useMutation({
    mutationFn: (id: number) => updateChangeNowPayoutAddress(authToken!, id, { isDefault: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-changenow-payout-addresses'] }),
  });
  const upsertMappingMutation = useMutation({
    mutationFn: ({ id, ticker }: { id: number; ticker: string }) => upsertChangeNowTickerMapping(authToken!, id, ticker),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-changenow-map-internal'] }),
  });

  const setTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (tab === 'vendors') navigate('/settings/vendors');
    else if (tab === 'profile') navigate('/settings');
    else navigate(`/settings?tab=${tab}`);
  };

  const handleVendorSubmit = (data: VendorFormData) => {
    if (editingVendor) updateVendorMutation.mutate({ id: editingVendor.id, payload: data });
    else createVendorMutation.mutate(data);
    setEditingVendor(null);
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
                <button onClick={() => setTab('vendors')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'vendors' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'}`}>Vendors</button>
                <button onClick={() => setTab('swap_payout_wallets')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'swap_payout_wallets' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'}`}>Swap payout wallets</button>
                <button onClick={() => setTab('ticker_mapping')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'ticker_mapping' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'}`}>Ticker mapping</button>
              </>
            )}
          </div>
        </div>
        {activeTab === 'profile' && userData?.role === 'admin' && (
          <div className="flex justify-end items-center flex-1">
            <button className="px-4 py-2 rounded-xl font-normal bg-[#147341] text-white" onClick={() => setIsPrivacyModal(true)}>Privacy Policy Page Links</button>
          </div>
        )}
        {activeTab === 'vendors' && (
          <div className="flex justify-end items-end flex-1">
            <button className="px-4 py-2 rounded-xl font-normal bg-[#147341] text-white" onClick={() => { setEditingVendor(null); setVendorModalOpen(true); }}>Add Vendor</button>
          </div>
        )}
      </div>

      {activeTab === 'profile' ? (
        <UserDetail />
      ) : activeTab === 'vendors' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Network</th><th className="px-4 py-3">Currency</th><th className="px-4 py-3">Wallet address</th><th className="px-4 py-3">Notes</th><th className="px-4 py-3 w-32">Actions</th></tr></thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-gray-600">{v.network}</td>
                    <td className="px-4 py-3 text-gray-600">{v.currency}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-sm max-w-[200px] truncate" title={v.walletAddress}>{v.walletAddress}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{v.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => { setEditingVendor(v); setVendorModalOpen(true); }} className="text-[#147341] hover:underline mr-2">Edit</button>
                      <button type="button" onClick={() => deleteVendorMutation.mutate(v.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {vendors.length === 0 && <p className="p-6 text-center text-gray-500">No vendors yet.</p>}
          <VendorModal isOpen={vendorModalOpen} onClose={() => { setVendorModalOpen(false); setEditingVendor(null); }} vendor={editingVendor as any} onSubmit={handleVendorSubmit} />
        </div>
      ) : activeTab === 'swap_payout_wallets' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-5 gap-2">
            <input value={newWallet.label} onChange={(e) => setNewWallet((s) => ({ ...s, label: e.target.value }))} placeholder="Label" className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input value={newWallet.address} onChange={(e) => setNewWallet((s) => ({ ...s, address: e.target.value }))} placeholder="Address" className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2" />
            <input value={newWallet.toNetworkHint} onChange={(e) => setNewWallet((s) => ({ ...s, toNetworkHint: e.target.value }))} placeholder="Network hint" className="px-3 py-2 border border-gray-300 rounded-lg" />
            <button type="button" onClick={() => createPayoutMutation.mutate()} className="px-4 py-2 bg-[#147341] text-white rounded-lg">Add wallet</button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium"><th className="px-4 py-3">Label</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Network</th><th className="px-4 py-3">Default</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {(payoutAddressData?.items ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{p.label ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.address}</td>
                    <td className="px-4 py-3">{p.toNetworkHint ?? '—'}</td>
                    <td className="px-4 py-3">{p.isDefault ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 space-x-2">
                      {!p.isDefault && <button type="button" onClick={() => setDefaultPayoutMutation.mutate(p.id)} className="text-[#147341] hover:underline">Set default</button>}
                      <button type="button" onClick={() => archivePayoutMutation.mutate(p.id)} className="text-red-600 hover:underline">Archive</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'ticker_mapping' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium"><th className="px-4 py-3">Blockchain</th><th className="px-4 py-3">Currency</th><th className="px-4 py-3">Current ticker</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Override</th></tr></thead>
            <tbody>
              {(mapData?.items ?? []).map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{m.blockchain}</td>
                  <td className="px-4 py-3">{m.currency}</td>
                  <td className="px-4 py-3 font-medium">{m.changenowTicker}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${m.mappingSource === 'database' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{m.mappingSource}</span></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-[#147341] hover:underline"
                      onClick={() => {
                        const v = window.prompt(`Override ticker for ${m.currency}`, m.changenowTicker);
                        if (v && v.trim()) upsertMappingMutation.mutate({ id: m.id, ticker: v.trim() });
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
