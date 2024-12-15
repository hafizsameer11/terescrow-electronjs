import React, { useState } from 'react';
import DepartmentsTable from '@renderer/components/DepartmentsTable';
import AddDepartmentModal from '@renderer/components/modal/AddDepartment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment } from '@renderer/api/queries/adminqueries';
import { token } from '@renderer/api/config';

const Departments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize query client
  const queryClient = useQueryClient();

  // Define mutation for creating a department
  const mutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['departmentsData']); // Refresh departments table
      setIsModalOpen(false); // Close modal after success
      alert('Department added successfully!');
    },
    onError: () => {
      alert('Failed to create department. Please try again.');
    },
  });

  // Handle form submission
  const handleUpdate = (data: Record<string, any>) => {
    mutation.mutate({
      token,
      data: {
        title: data.name,
        description: data.description,
        status: data.status,
        Type: data.Type || 'buy',
        niche: data.niche || 'crypto',
        icon: data.icon || '',
      },
    });
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="p-6 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[40px] font-normal text-gray-800">Departments</h1>
        <button
          onClick={handleOpenModal}
          className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800"
        >
          Add New Department
        </button>
      </div>

      {/* Departments Table */}
      <DepartmentsTable />

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
        actionType="add"
      />
    </div>
  );
};

export default Departments;
