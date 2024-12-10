// import StatsCard from '@renderer/components/Dashboard/StatsCard';
// import TransactionsFilter from '@renderer/components/Dashboard/TransactionsFilter';
// import TransactionsTable from '@renderer/components/Dashboard/TransactionsTable';
import ChatFilters from '@renderer/components/ChatFilters';
import ChatTable from '@renderer/components/ChatTable';
import StatsCard from '@renderer/components/StatsCard';
import React, { useState } from 'react';


const Chat = () => {
    const sampleData = [
        {
            id: 1,
            name: 'Qamardeen Abdulmalik',
            username: 'Alucard',
            status: 'Declined',
            serviceType: 'Gift Card',
            transactionType: 'Buy - Amazon gift card',
            date: 'Nov 6, 2024',
            amount: '$100',
        },
        {
            id: 2,
            name: 'Adam Sandler',
            username: 'Adam',
            status: 'Successful',
            serviceType: 'Crypto',
            transactionType: 'Sell - BTC',
            date: 'Nov 6, 2024',
            amount: '$100',
        },
        {
            id: 3,
            name: 'Sasha Sloan',
            username: 'Sasha',
            status: 'Successful',
            serviceType: 'Crypto',
            transactionType: 'Buy - USDT',
            date: 'Nov 6, 2024',
            amount: '$100',
        },
    ];

    const [filters, setFilters] = useState({
        status: 'All',
        type: 'All',
        dateRange: 'Last 30 days',
        search: '',
        transactionType: 'All',
        category: 'All'

    });

    // Filter data based on the selected filters
    const filteredData = sampleData.filter((transaction) => {
        const matchesStatus =
            filters.status === 'All' || transaction.status === filters.status;
        const matchesType =
            filters.type === 'All' || transaction.serviceType === filters.type;
        const matchesSearch =
            filters.search === '' ||
            transaction.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            transaction.username.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStatus && matchesType && matchesSearch;
    });
    const [activeChat, setActiveChat] = useState<'giftCard' | 'crypto'>('giftCard');
    return (
        <>
            <div className="p-6 space-y-8 w-full">
                <div className="flex items-center justify-between">
                    {/* Header */}
                    <div className='flex gap-9'>
                        <h1 className="text-[40px] text-gray-800">Chats</h1>

                        {/* Toggle Buttons */}
                        <div className="flex">
                            <button
                                onClick={() => setActiveChat('giftCard')}
                                className={`px-4 py-2 rounded-lg font-medium ${activeChat === 'giftCard' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'
                                    }`}
                            >
                                Gift card chat
                            </button>
                            <button
                                onClick={() => setActiveChat('crypto')}
                                className={`px-4 py-2 rounded-lg font-medium ${activeChat === 'crypto' ? 'text-white bg-green-700' : 'text-gray-800 border border-gray-300'
                                    }`}
                            >
                                Crypto Chat
                            </button>
                        </div>
                    </div>
                    {/* Dropdown */}
                    <select className="ml-4 px-3 py-2 rounded-lg border border-gray-300 text-gray-800">
                        <option>Last 30 days</option>
                        <option>Last 15 days</option>
                        <option>Last 7 days</option>
                    </select>
                </div>


                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Chat" value="20" />
                    <StatsCard title="Successful Transaction" value="15" />
                    <StatsCard title="Pending Chat" value="3" />
                    <StatsCard title="Declined Chat" value="2" />
                </div>

                {/* Transactions Table */}
                <div>

                    <ChatFilters
                        filters={filters}
                        title="Gift card chats"
                        subtitle="Manage total chat and transaction"
                        onChange={(updatedFilters) => setFilters({ ...filters, ...updatedFilters })}
                    />

                    <ChatTable data={filteredData}
                    isChat={true}
                    />
                </div>
            </div>

        </>
    )
}

export default Chat
