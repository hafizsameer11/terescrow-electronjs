import React from 'react';



// const transactions: Transaction[] = [
//   {
//     id: 1,
//     name: 'Qamardeen Abdulmalik',
//     username: 'Alucard',
//     status: 'Declined',
//     serviceType: 'Gift Card',
//     transactionType: 'Buy - Amazon gift card',
//     date: 'Nov 6, 2024',
//     amount: '$100',
//   },
//   {
//     id: 2,
//     name: 'Adam Sandler',
//     username: 'Adam',
//     status: 'Successful',
//     serviceType: 'Crypto',
//     transactionType: 'Sell - BTC',
//     date: 'Nov 6, 2024',
//     amount: '$100',
//   },
//   {
//     id: 3,
//     name: 'Sasha Sloan',
//     username: 'Sasha',
//     status: 'Successful',
//     serviceType: 'Crypto',
//     transactionType: 'Buy - USDT',
//     date: 'Nov 6, 2024',
//     amount: '$100',
//   },
// ];

const TransactionsTable: React.FC<TransactionsTableProps> = ({data} ) => {
  return (
    <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Name, Username</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Service Type</th>
            <th className="py-3 px-4">Transaction Type</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction) => (
            <tr key={transaction.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4">
                <div>
                  <span className="font-semibold">{transaction.name}</span>
                  <span className="text-sm text-gray-500"> ({transaction.username})</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded-lg ${
                    transaction.status === 'Successful'
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
