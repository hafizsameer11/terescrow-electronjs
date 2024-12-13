import React, { useState } from 'react'

interface Activity {
  id: number
  description: string
  date: string
}

interface TableProps {
  data: Activity[]
}

const ActivityTable: React.FC<TableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage)

  // Get the data for the current page
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handlers for pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-lg font-semibold px-4 pt-4">Activities</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="py-4 px-4">Description</th>
            <th className="py-4 px-4 text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((activity) => (
            <tr key={activity.id} className="border-b hover:bg-gray-100">
              <td className="py-4 px-4">{activity.description}</td>
              <td className="py-4 px-4 text-right">{activity.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {data.length > itemsPerPage && (
        <div className="flex justify-between items-center px-4 py-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityTable
