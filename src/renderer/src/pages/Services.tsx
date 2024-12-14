// import AddNewService from '@renderer/components/modal/AddNewService'
// import AddNewSubService from '@renderer/components/modal/AddSubService'
// import ServicesTable from '@renderer/components/ServicesTable'
// import SubServicesTable from '@renderer/components/SubServicesTable'
import AddNewService from '@renderer/components/modal/AddNewService'
import AddNewSubService from '@renderer/components/modal/AddNewSubService'
import ServicesTable from '@renderer/components/ServicesTable'
import SubServicesTable from '@renderer/components/SubServicesTable'
import React, { useState } from 'react'

// This is done by Hassan and Abu-Bakar
const Services: React.FC = () => {
  const [activeOption, setActiveOption] = useState<'Main Services' | 'Sub Services'>(
    'Main Services'
  )
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isSubServiceModalOpen, setIsSubServiceModalOpen] = useState(false)

  const handleOpenModal = () => {
    activeOption === 'Main Services' ? setIsServiceModalOpen(true) : setIsSubServiceModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsServiceModalOpen(false)
    setIsSubServiceModalOpen(false)
  }

  return (
    <div className="overflow-x-auto w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Services</h2>

        <div className="flex space-x-4">
          <div>
            <button
              onClick={() => setActiveOption('Main Services')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeOption === 'Main Services'
                  ? 'text-white bg-green-700'
                  : 'text-gray-800 border border-gray-300'
              }`}
            >
              Main Services
            </button>

            <button
              onClick={() => setActiveOption('Sub Services')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeOption === 'Sub Services'
                  ? 'text-white bg-green-700'
                  : 'text-gray-800 border border-gray-300'
              }`}
            >
              Sub Services
            </button>
          </div>

          <button
            className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
            onClick={handleOpenModal}
          >
            {activeOption === 'Main Services' ? 'Add New Service' : 'Add New Sub-Service'}
          </button>
        </div>
      </div>

      {activeOption === 'Main Services' ? <ServicesTable /> : <SubServicesTable />}

      {/* Conditional Modals */}
      <AddNewService isOpen={isServiceModalOpen} onClose={handleCloseModal} />
      <AddNewSubService isOpen={isSubServiceModalOpen} onClose={handleCloseModal} />
    </div>
  )
}

export default Services
