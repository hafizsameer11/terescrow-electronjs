import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createWayOfHearing, getWaysOfHearing, WaysOfHearingResponse } from '@renderer/api/queries/adminqueries';
// import { getWaysOfHearing, createWayOfHearing } from '@renderer/api/queries/wayOfHearingQueries';
// import { WayOfHearing, WaysOfHearingResponse } from '@renderer/api/types/wayOfHearingTypes';

const WaysOfHearing = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newMeans, setNewMeans] = useState('');

  // Fetching Data
  const { data, isLoading, isError } = useQuery<WaysOfHearingResponse>({
    queryKey: ['waysOfHearing'],
    queryFn: getWaysOfHearing,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (means: string) => createWayOfHearing({ means }),
    onSuccess: () => {
      queryClient.invalidateQueries(['waysOfHearing']); // Refetch data after mutation
      setModalOpen(false);
      setNewMeans('');
    },
  });

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Ways of Hearing</h1>

      {/* Dynamic Cards Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {data?.data.grouped.map((item) => (
          <div key={item.name} className="bg-white text-black p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold">{item.name}</h2>
            <p className="text-xl">{item.count} users</p>
          </div>
        ))}
      </div>

      {/* Add New Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-4"
      >
        + Add Way of Hearing
      </button>

      {/* Table Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading && <p className="text-gray-600 p-4">Loading...</p>}
        {isError && <p className="text-red-500 p-4">Failed to load data</p>}

        {!isLoading && !isError && data?.data?.list.length > 0 ? (
          <table className="w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Means</th>
                <th className="px-4 py-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.list.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.means}</td>
                  <td className="px-4 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 p-4">No data found</p>
        )}
      </div>

      {/* Modal for Adding New Way of Hearing */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4">Add Way of Hearing</h2>
            <input
              type="text"
              placeholder="Enter way of hearing..."
              value={newMeans}
              onChange={(e) => setNewMeans(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(newMeans)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaysOfHearing;
