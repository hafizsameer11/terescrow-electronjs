import React, { useState } from 'react';

interface Transaction {
  id: number;
  name: string;
  username: string;
  status: string;
  serviceType: string;
  transactionType: string;
  date: string;
  amount: string;
}

interface TransactionsTableProps {
  data: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ data }) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md ">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Name, Username</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Service Type</th>
            <th className="py-3 px-4">Transaction Type</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-1"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction) => (
            <tr key={transaction.id} className="border-t hover:bg-gray-50 relative">
              <td className="py-3 px-4">
                <div>
                  <span className="font-semibold">{transaction.name}</span>
                  <span className="text-sm text-gray-500"> ({transaction.username})</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded-lg ${transaction.status === 'Successful'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}
                >
                  {transaction.status}
                </span>
              </td>
              <td className="py-3 px-4">{transaction.serviceType}</td>
              <td className="py-3 px-4">{transaction.transactionType}</td>
              <td className="py-3 px-4">{transaction.date}</td>
              <td className="py-3 px-4">{transaction.amount}</td>
              <td className="py-3 px-4 text-right ">
                <button
                  onClick={() => toggleMenu(transaction.id)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  &#x22EE; {/* Vertical ellipsis */}
                </button>
                {activeMenu === transaction.id && (
                  <div
                    className="absolute right-0 mt-2 bg-[#F6F7FF] rounded-md w-48 z-50"
                    style={{
                      boxShadow: '0px 4px 6px #00000040', // Custom drop shadow
                    }}
                  >
                    <button
                      onClick={() => console.log('View Customer Details')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Customer Details
                    </button>
                    <button
                      onClick={() => console.log('View Transaction Details')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Transaction Details
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
