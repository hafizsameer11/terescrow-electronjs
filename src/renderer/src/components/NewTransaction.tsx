import { useState } from 'react'
import SellGiftCardInputs from './SellGiftCardInputs'
import BuyCrypto from './BuyCrypto'
// import { icons } from "@/constants";

const NewTransaction = () => {
  const [modalVisibility, setModalVisible] = useState(true)
  const [selectedService, setSelectedService] = useState('Sell - Gift Card') // Change this to dynamic state

  const closeModal = () => {
    setModalVisible(false)
  }

    const handleServiceChange = (service) => {
      setSelectedService(service)
    }

  return (
    <>
      {modalVisibility && (
        <div className="absolute w-full h-full right-[100%] flex items-center rounded-lg justify-center z-50">
          {/* Modal content */}
          <div className="bg-white overflow-y-scroll h-[100%] rounded-lg shadow-lg w-11/12 max-w-lg overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold flex-1 text-center">New Transaction</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <div className="text-gray-500 hover:text-gray-700 focus:outline-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6">
              {selectedService === 'Sell - Gift Card' && (
                <SellGiftCardInputs selectedService={selectedService} />
              )}
              {selectedService === 'Buy - Crypto' && <BuyCrypto selectedService={selectedService} />}
            </div>

            {/* Modal Footer */}
            <div className="px-9 pb-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="bg-green-800 w-full text-white px-4 py-2 rounded-md hover:bg-green-900"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NewTransaction
