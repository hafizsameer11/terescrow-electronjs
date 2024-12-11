import React, { useState } from 'react';
import DepartmentsTable from '@renderer/components/DepartmentsTable';
import AddDepartmentModal from '@renderer/components/modal/AddDepartment';

const Departments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSubmit = (data: { name: string; status: string; description: string }) => {
    console.log('New Department Data:', data);
  };

  return (
    <div className="p-6 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[40px] font-normal text-gray-800">Departments</h1>
        <button
          onClick={handleOpenModal}
          className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800"
        >
          Add new Department
        </button>
      </div>

      <DepartmentsTable />
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={() => {}}
      />
    </div>
  );
};

export default Departments;
