import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserAlt } from 'react-icons/fa';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import StatusButton from './StatusButton';
import { Icons } from '@renderer/constant/Icons';
import DepartmentModal from './modal/AddDepartment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteDepartment, editDepartment, getDepartments } from '@renderer/api/queries/adminqueries';
import { Department } from '@renderer/api/queries/datainterfaces';
import { useAuth } from '@renderer/context/authContext';

// Define the Department interface


const DepartmentsTable: React.FC = () => {
  const navigate = useNavigate();
  const {token}=useAuth();
  // State Management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setEditModalOpen(true);
  };

  // API Fetching with React Query
  const { data: departmentsData, isLoading, isError, error } = useQuery({
    queryKey: ['departmentsData'],
    queryFn: () => getDepartments({ token }),
    enabled: !!token,
  });

  // Effect to Set Filtered Departments
  useEffect(() => {
    if (departmentsData) {
      setFilteredDepartments(departmentsData.data || []);
    }
  }, [departmentsData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = departmentsData?.data.filter((department: Department) =>
      department.title.toLowerCase().includes(query)
    );

    setFilteredDepartments(filtered || []);
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: editDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['departmentsData']); // Refresh departments table
      alert('Department added successfully!');
    },
    onError: () => {
      alert('Failed to create department. Please try again.');
    },
  });


  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDepartment({ token, id }),
    onSuccess: () => {
      alert('Department deleted successfully!')
      queryClient.invalidateQueries(['departmentsData'])
    },
    onError: (error) => {
      console.error('Failed to delete Department:', error)
      alert('Error deleting Department.')
    },
  })
  const handledeletDepartment = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate({ id })
    }
  }

  // Handle form submission
  const handleUpdate = (data: Record<string, any>) => {
    mutation.mutate({
      token,
      id: data.id,
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
  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Niche</th>
              <th className="py-3 px-4">No of Agents</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((department) => (
              <>
                <tr key={department.id} className="border-t hover:bg-gray-50">
                  <td className="pt-2 pb-0 px-4 flex items-center gap-3">
                    <div className="bg-gray-300 rounded-full p-2">
                      <img src={Icons.crypto} alt="Icon" />
                    </div>
                    <span>{department.title}</span>
                  </td>
                  <td>
                    <StatusButton title="Active" status={department.status || ''} />
                  </td>
                  <td className="py-3 px-4">{department.niche?.toUpperCase()}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => navigate(`/department-agent?id=${department.id}`)}>
                      {department.noOfAgents || 0}

                    </button>

                  </td>
                  <td className="py-3 px-4">{department.description || 'N/A'}</td>
                  <td className="py-3 px-4 text-center flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/department-agent`)}
                      className="bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                      title="Assign Agents"
                    >
                      <FaUserAlt /> Assign Agents
                    </button>
                    <button
                      onClick={() => navigate(`/details-department/${department.id}`)}
                      className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200"
                      title="View Details"
                    >
                      <MdVisibility />
                    </button>
                    <button
                      onClick={() => handleEditClick(department)}
                      className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200"
                      title="Edit Department"
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => handledeletDepartment(department.id?.toString() || '')}
                      className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                      title="Delete Department"
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
                {selectedDepartment && (
                  <DepartmentModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onUpdate={handleUpdate}
                    actionType="edit"
                    initialData={{
                      id: selectedDepartment.id,
                      name: selectedDepartment.title,
                      status: selectedDepartment.status || 'active',
                      description: selectedDepartment.description || '',
                      icon: selectedDepartment.icon,
                      niche: selectedDepartment.niche,
                      Type: selectedDepartment.Type
                    }}
                  />
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default DepartmentsTable;
