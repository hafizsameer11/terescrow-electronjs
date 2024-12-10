import React, { useState } from 'react';
import { ChatUser } from './TeamChat';

interface TeamGroupCreateProps {
    users: ChatUser[];
    onClose: () => void;
    onCreateGroup: (selectedUsers: ChatUser[]) => void;
}

const TeamGroupCreate: React.FC<TeamGroupCreateProps> = ({ users, onClose, onCreateGroup }) => {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState('');

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const toggleUserSelection = (userId: number) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = () => {
        const groupMembers = users.filter((user) => selectedUsers.includes(user.id));
        onCreateGroup(groupMembers);
        onClose();
    };

    return (
        <div className="fixed inset-0 max-w-[25rem] flex ms-[315px] items-center z-50">
            <div className="bg-white w-[90vw]  rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">New Group</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Search team member"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                />
                <div className="max-h-64 overflow-y-auto">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 rounded-lg"
                        >
                            <div className="flex items-center">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full mr-4 object-cover"
                                />
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-gray-500">@{user.name.toLowerCase()}</div>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                                className="w-5 h-5"
                            />
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleCreateGroup}
                    className="w-full mt-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                    disabled={selectedUsers.length === 0}
                >
                    Create Group
                </button>
            </div>
        </div>
    );
};

export default TeamGroupCreate;
