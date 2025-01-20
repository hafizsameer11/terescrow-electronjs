import { API_BASE_URL } from "@renderer/api/config";
import axios, { Axios } from "axios";
import { useEffect, useState } from "react";
import KycLimitsModal from "./modal/KycLimitsModal";
interface KycLimit {
  id: number;
  tier: string;
  cryptoSellLimit: string;
  cryptoBuyLimit: string;
  giftCardSellLimit: string;
  giftCardBuyLimit: string;
}
const KycLimitsTable: React.FC = () => {
  const [kycLimits, setKycLimits] = useState<KycLimit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<KycLimit | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/admin/operations/get-kyc-limits`)
      .then((response) => {
        setKycLimits(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching KYC limits:', error);
      });
  }, []);

  const handleEditClick = (kycLimit: KycLimit) => {
    setSelectedLimit(kycLimit);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedLimit(null); // Null indicates adding a new limit
    setIsModalOpen(true);
  };

  return (
    <div className="my-6 bg-white rounded-lg shadow-md">
      {/* Add Button */}
      {/* <div className="flex justify-end p-4">
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add New Limit
        </button>
      </div> */}

      {/* Table */}
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Tier</th>
            <th className="py-3 px-4">Crypto Sell Limit</th>
            <th className="py-3 px-4">Crypto Buy Limit</th>
            <th className="py-3 px-4">Gift Card Sell Limit</th>
            <th className="py-3 px-4">Gift Card Buy Limit</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {kycLimits.map((limit) => (
            <tr key={limit.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4 font-semibold">{limit.tier}</td>
              <td className="py-3 px-4">{limit.cryptoSellLimit}</td>
              <td className="py-3 px-4">{limit.cryptoBuyLimit}</td>
              <td className="py-3 px-4">{limit.giftCardSellLimit}</td>
              <td className="py-3 px-4">{limit.giftCardBuyLimit}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleEditClick(limit)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <KycLimitsModal
          limit={selectedLimit
            ? {
              cryptoBuyLimit: selectedLimit.cryptoBuyLimit || "",
              cryptoSellLimit: selectedLimit.cryptoSellLimit || "",
              giftcardBuyLimit: selectedLimit.giftCardBuyLimit || "",
              giftcardSellLimit: selectedLimit.giftCardSellLimit || "",
              id: selectedLimit.id || 0,
              tier: selectedLimit.tier || "",
            }
            : null} // Pass null for adding a new limit
          onClose={() => setIsModalOpen(false)}
          onUpdate={(updatedLimit) => {
            if (selectedLimit) {
              // Update existing limit
              setKycLimits((prev) =>
                prev.map((limit) =>
                  limit.id === updatedLimit.id ? updatedLimit : limit
                )
              );
            } else {
              // Add new limit
              setKycLimits((prev) => [...prev, updatedLimit]);
            }
            setIsModalOpen(false);
          }}
        />
      )}




    </div>
  );
};

export default KycLimitsTable;
