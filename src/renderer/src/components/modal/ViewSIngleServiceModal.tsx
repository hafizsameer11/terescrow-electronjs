import { SingleCategory } from '@renderer/api/queries/datainterfaces'
import React from 'react'

interface ViewSIngleServiceModalProps {
  onClose: () => void
  data: SingleCategory
}

const ViewSIngleServiceModal: React.FC<ViewSIngleServiceModalProps> = ({
  onClose,
  data
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 modal-background">
      <div className="bg-white rounded-lg w-[90%] max-w-md p-6 relative shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
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

        {/* Title & Subtitle */}
        <div className="flex flex-col items-center space-y-4">
          <div className="border-b border-gray-200 w-full text-center pb-4">
            <h2 className="text-xl font-semibold text-gray-800 pb-2">{data?.title}</h2>
            <p className="pb-4 text-gray-600">{data?.subTitle}</p>
          </div>
        </div>

        {/* Image Preview */}
        <div className="flex justify-center my-4">
          <img src={data?.image} alt="Service" width={150} height={150} className="object-cover rounded-lg" />
        </div>

        {/* Departments List */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Departments</h3>
          {data?.departments?.length ? (
            <ul className="list-disc list-inside space-y-1">
              {data.departments.map((dept, index) => (
                <li key={index} className="text-gray-700">
                  {dept?.title || 'Unknown Department'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No departments assigned.</p>
          )}
        </div>

       
      </div>
    </div>
  )
}

export default ViewSIngleServiceModal
