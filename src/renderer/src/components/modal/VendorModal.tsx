import React, { useEffect, useState } from 'react';
import {
  VENDOR_NETWORKS,
  VENDOR_CURRENCIES,
  type Vendor,
  type VendorNetwork,
  type VendorCurrency,
} from '@renderer/data/vendorData';

export interface VendorFormData {
  name: string;
  network: VendorNetwork;
  currency: VendorCurrency;
  walletAddress: string;
  notes: string;
}

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
  onSubmit: (data: VendorFormData) => void;
}

const emptyForm: VendorFormData = {
  name: '',
  network: 'Ethereum',
  currency: 'USDT',
  walletAddress: '',
  notes: '',
};

const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose, vendor, onSubmit }) => {
  const [form, setForm] = useState<VendorFormData>(emptyForm);

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name,
        network: vendor.network,
        currency: vendor.currency,
        walletAddress: vendor.walletAddress,
        notes: vendor.notes ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [vendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.walletAddress.trim()) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{vendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Wallet name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
              placeholder="e.g. Yellow Card Withdrawal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
            <select
              value={form.network}
              onChange={(e) => setForm((f) => ({ ...f, network: e.target.value as VendorNetwork }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
            >
              {VENDOR_NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as VendorCurrency }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
            >
              {VENDOR_CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet address</label>
            <div className="bg-[#147341]/10 border border-[#147341] rounded-lg p-2">
              <input
                type="text"
                value={form.walletAddress}
                onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
                placeholder="0x... or bc1... or address"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
              placeholder="e.g. Primary USDT payout"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || !form.walletAddress.trim()}
              className="flex-1 py-2 px-4 bg-[#147341] text-white rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {vendor ? 'Save' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorModal;
