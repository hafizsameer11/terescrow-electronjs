import { Images } from '@renderer/constant/Image'
import React from 'react'

interface WelcomeModalProps {
  onClose: () => void
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 modal-background">
      <div className="bg-white rounded-lg w-[90%] max-w-md p-6 relative shadow-lg">
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
        <div className="flex flex-col items-center space-y-4">
          <div className="border-b border-gray-200">
            <h2>Welcome to tercesecrow</h2>
            <p>
              Welcome to tercesecrow, your no 1 hub for trading your gift card and crypto. We are
              always here to serve you.
            </p>
          </div>
        </div>
        <div className="flex gap-4 my-3">
          <img src={Images.galleryImg} alt="" width={80} height={80} className="object-cover" />
          <img src={Images.galleryImg} alt="" width={80} height={80} className="object-cover" />
        </div>
        <div className="flex justify-between text-sm border-t pt-2 items-center">
          <p>Nov 7, 2024 - 10:22 am</p>
          <p>Delivered</p>
        </div>
        <div>
          <button className={`px-4 py-2 rounded-lg font-medium bg-green-700 text-white `}>
            Resend
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal
