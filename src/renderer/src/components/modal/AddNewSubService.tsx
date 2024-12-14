import React, { useState } from 'react'
import Select from 'react-select'

interface AddNewSubServiceProps {
  isOpen: boolean
  onClose: () => void
}

const serviceOptions = [
  { value: 'Web Development', label: 'Web Development' },
  { value: 'App Development', label: 'App Development' },
  { value: 'Graphic Design', label: 'Graphic Design' },
  { value: 'Content Writing', label: 'Content Writing' },
  { value: 'Digital Marketing', label: 'Digital Marketing' }
]

const AddNewSubService: React.FC<AddNewSubServiceProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [services, setServices] = useState<{ value: string; label: string }[]>([])

  const handleServicesChange = (selectedOptions: any) => {
    setServices(selectedOptions || [])
  }

  const handleSubmit = () => {
    console.log({
      title,
      subtitle,
      price,
      services
    })
    onClose() // Close the modal after submission
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[500px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Sub Service</h2>

        <div className="space-y-4">
          {/* Title Input */}
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4">
              Title
            </label>
          </div>

          {/* Subtitle Input */}
          <div className="relative">
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4">
              Subtitle
            </label>
          </div>

          {/* Price Input */}
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || '')}
              min="0"
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4">
              Price
            </label>
          </div>

          {/* Services Selection */}
          <div className="relative">
            <Select
              isMulti
              options={serviceOptions}
              value={services}
              onChange={handleServicesChange}
              placeholder="Select Services"
              className="text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#147341] text-white rounded-lg px-4 py-3 font-semibold hover:bg-green-700"
          >
            Add Sub Service
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddNewSubService
