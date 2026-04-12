import React, { useState } from 'react';
import type { ReferralByUser } from '@renderer/data/referralsData';

interface ReferralsByUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  referrals: ReferralByUser[];
}

const ReferralsByUserModal: React.FC<ReferralsByUserModalProps> = ({
  isOpen,
  onClose,
  userName,
  referrals,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(referrals[0]?.referredName ?? null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Referrals by {userName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-2">
          {referrals.map((r) => {
            const isExpanded = expandedId === r.referredName;
            return (
              <div key={r.referredName} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : r.referredName)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {r.referredName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{r.referredName}</p>
                      <p className="text-xs text-gray-500">{r.referredAt}</p>
                    </div>
                  </div>
                  <span className="text-gray-400">
                    {isExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-4 pt-0 border-t border-gray-100 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{r.referredName} Stats</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Gift card buy trades: {r.stats.giftCardBuy}</li>
                        <li>Gift card sell trades: {r.stats.giftCardSell}</li>
                        <li>Crypto trades: {r.stats.cryptoTrades}</li>
                        <li>No of users {r.referredName.split(' ')[0]} referred: {r.stats.noOfUsersReferred}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Amount {userName.split(' ')[0]} Earned from {r.referredName.split(' ')[0]}
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Amount earned from trades: {r.earned.amountEarnedFromTrades}</li>
                        <li>Amount earned from GC trades: {r.earned.fromGcTrades}</li>
                        <li>Amount earned from Crypto trades: {r.earned.fromCryptoTrades}</li>
                        <li>Amount earned from downlines: {r.earned.fromDownlines}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReferralsByUserModal;
