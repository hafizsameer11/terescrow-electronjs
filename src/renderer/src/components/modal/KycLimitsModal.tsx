import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@renderer/api/config';

interface KycLimit {
  id: number;
  tier: string;
  cryptoSellLimit: string;
  cryptoBuyLimit: string;
  giftcardSellLimit: string;
  giftcardBuyLimit: string;
}

interface ModalProps {
  limit: KycLimit | null; // null for add operation
  onClose: () => void;
  onUpdate: (updatedLimit: KycLimit) => void;
}

const KycLimitsModal: React.FC<ModalProps> = ({ limit, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<KycLimit>({
    id: limit?.id || 0,
    tier: limit?.tier || '',
    cryptoSellLimit: limit?.cryptoSellLimit || '',
    cryptoBuyLimit: limit?.cryptoBuyLimit || '',
    giftcardSellLimit: limit?.giftcardSellLimit || '',
    giftcardBuyLimit: limit?.giftcardBuyLimit || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(limit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = isEdit
        ? await axios.post(`${API_BASE_URL}/api/admin/operations/update-kyc-limit/${formData.id}`, formData)
        : await axios.post(`${API_BASE_URL}/api/admin/operations/create-kyc-limit`, formData);

      onUpdate(response.data.data);
      onClose();
    } catch (err: any) {
      console.error('Error saving KYC limits:', err);
      setError(err.response?.data?.message || 'Failed to save KYC limit.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (limit) {
      setFormData(limit);
    }
  }, [limit]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? 'Edit KYC Limit' : 'Add New KYC Limit'}
        </h2>
        {error && (
          <div className="mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">Tier</span>
              <select
                name="tier"
                value={formData.tier}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={isEdit}
              >
                <option value="" >
                  Select Tier
                </option>
                <option value="tier1">Tier 1</option>
                <option value="tier2">Tier 2</option>
                
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Crypto Sell Limit</span>
              <input
                type="text"
                name="cryptoSellLimit"
                value={formData.cryptoSellLimit}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Crypto Buy Limit</span>
              <input
                type="text"
                name="cryptoBuyLimit"
                value={formData.cryptoBuyLimit}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Gift Card Sell Limit</span>
              <input
                type="text"
                name="giftcardSellLimit"
                value={formData.giftcardSellLimit}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Gift Card Buy Limit</span>
              <input
                type="text"
                name="giftcardBuyLimit"
                value={formData.giftcardBuyLimit}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white bg-blue-600 rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KycLimitsModal;
