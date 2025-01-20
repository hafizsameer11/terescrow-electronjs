import React, { useState } from 'react';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleName: string) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [roleName, setRoleName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (roleName) {
      onSubmit(roleName);
      onClose();
    } else {
      alert('Please enter a valid role name.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-bold mb-4">Create Role</h2>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="Enter role name"
          className="border border-gray-300 p-2 rounded w-full"
        />
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
