import { getRate } from '@renderer/api/queries/adminqueries';
import { Rate } from '@renderer/api/queries/datainterfaces';
import { useAuth, canManageExchangeRates } from '@renderer/context/authContext';
import { formatDateTime } from '@renderer/utils/customfunctions';
import { formatNairaAmount } from '@renderer/api/helper';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CryptoRatesSettings from '@renderer/components/rates/CryptoRatesSettings';
import { GIFT_CARD_TRANSACTION_TYPES } from '@renderer/types/cryptoRates';

type RatesPageTab = 'crypto' | 'gift-card' | 'history';

const RatesHistory: React.FC = () => {
  const [filterDate, setFilterDate] = useState('Last 30 Days');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { token, userData } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canManageRates = canManageExchangeRates(userData?.role, userData);

  const tabParam = searchParams.get('tab');
  const activeTab: RatesPageTab = (() => {
    if (!canManageRates) return 'history';
    if (tabParam === 'history') return 'history';
    if (tabParam === 'gift-card') return 'gift-card';
    if (tabParam === 'crypto') return 'crypto';
    return userData?.role === 'agent' ? 'crypto' : 'history';
  })();

  const setRatesTab = (t: RatesPageTab) => {
    if (t === 'crypto') navigate('/rates?tab=crypto');
    else if (t === 'gift-card') navigate('/rates?tab=gift-card');
    else navigate('/rates?tab=history');
  };

  const { data: ratesData, isLoading, isError, error } = useQuery({
    queryKey: ['ratesData'],
    queryFn: () => getRate({ token }),
    enabled: !!token,
  });

  const handleFilterData = (): Rate[] => {
    let filteredData = ratesData?.data || [];

    if (filterDate === 'Last 7 Days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filteredData = filteredData.filter((rate) => new Date(rate.createdAt || '') >= sevenDaysAgo);
    } else if (filterDate === 'Last Year') {
      const currentYear = new Date().getFullYear();
      filteredData = filteredData.filter((rate) => new Date(rate.createdAt || '').getFullYear() === currentYear);
    }

    return filteredData;
  };

  const filteredData = handleFilterData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-[40px] font-semibold text-gray-800 mb-4">Rates</h1>

      {canManageRates && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRatesTab('crypto')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'crypto' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'
            }`}
          >
            Crypto exchange rates
          </button>
          <button
            type="button"
            onClick={() => setRatesTab('gift-card')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'gift-card' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'
            }`}
          >
            Gift card buy rates
          </button>
          <button
            type="button"
            onClick={() => setRatesTab('history')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'history' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'
            }`}
          >
            Rates history
          </button>
        </div>
      )}

      {activeTab === 'crypto' && canManageRates && token ? (
        <CryptoRatesSettings token={token} />
      ) : activeTab === 'gift-card' && canManageRates && token ? (
        <CryptoRatesSettings token={token} transactionTypes={GIFT_CARD_TRANSACTION_TYPES} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-[30px] font-[400] text-gray-600">Rates History</h2>
              <p className="text-[20px] text-gray-500">View rates history table</p>
            </div>
            <div className="flex gap-4">
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last Year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className=" text-[#00000080] uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Logged by</th>
                  <th className="py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((rate, index) => {
                  const { date, time } = formatDateTime(rate.createdAt || '');
                  return (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{date}</td>
                      <td className="py-3 px-4">{time}</td>
                      <td className="py-3 px-4">₦{formatNairaAmount(rate.rate)}/$1</td>
                      <td className="py-3 px-4">{rate.agent}</td>
                      <td className="py-3 px-4 flex flex-col">
                        <span>${rate.amount}</span>
                        <span className=" text-[#00000080] text-[14px]">₦{formatNairaAmount(rate.amountNaira)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RatesHistory;
