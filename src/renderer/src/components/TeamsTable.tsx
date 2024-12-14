import { Agent } from '@renderer/api/queries/datainterfaces'
import { formatDateTime } from '@renderer/utils/customfunctions'
// import { Agent } from 'http'
import React, { useState } from 'react'

// Define the interface for the team member data


// Define props interface
interface TeamsTableProps {
  data: Agent[]
  // data: AgentByDepartmentResponse[]
}

const TeamsTable: React.FC<TeamsTableProps> = ({ data }) => {
  // Pagination states
  if(!data) return null
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(data?.length / itemsPerPage)

  // Get paginated data
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Page change handler
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-4 px-2"></th>
            <th className="py-4 px-4">Name, Username</th>
            <th className="py-4 px-4">Date Added</th>
            <th className="py-4 px-4">Role</th>
            <th className="py-4 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
        {paginatedData?.map((member) =>
          {
            const { date, time } = formatDateTime(member.user.createdAt || "");
          return(
            <tr key={member.id} className="border-t hover:bg-gray-50">
              <td className="py-4 ps-3">
                <div className="text-center bg-gray-200 rounded-full py-4 text-xl">
                  {member.user.firstname?.split('')[0]} {/* Extracts the first word */}
                </div>
              </td>
              <td className="py-4 px-4">
                <div>
                  <div className="font-semibold">{member.user.firstname} {member.user.lastname}</div>
                  <div className="text-sm text-gray-500">({member.user.username})</div>
                </div>
              </td>
              <td className="py-4 px-4">{date}</td>
              <td className="py-4 px-4">{member.user.role}</td>
              <td className="py-4 px-4 text-right">
                {/* Placeholder for action buttons */}
                <div className="flex justify-end space-x-2">
                </div>
              </td>
            </tr>
          )}
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4 border-t">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'
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
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default TeamsTable
