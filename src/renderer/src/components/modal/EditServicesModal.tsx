import React, { useState } from 'react'
import Select from 'react-select'

interface EditServicesModalProps {
  isOpen: boolean
  onClose: () => void
}

const departmentOptions = [
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'IT Support', label: 'IT Support' },
  { value: 'Finance', label: 'Finance' }
]

const EditServicesModal: React.FC<EditServicesModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('Sample Service Title')
  const [subtitle, setSubtitle] = useState('Sample Service Subtitle')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>('https://via.placeholder.com/150')
  const [role, setRole] = useState<string>('Agent')
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value)
  }

  const handleDepartmentsChange = (selectedOptions: any) => {
    setDepartments(selectedOptions || [])
  }

  const handleSubmit = () => {
    console.log({
      title,
      subtitle,
      image,
      role,
      departments
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

        <h2 className="text-lg font-semibold text-gray-700 mb-4">Edit Service</h2>

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

          {/* Image Upload */}
          <label htmlFor="imageInput" className="cursor-pointer">
            <img
              src={imagePreview || ''}
              alt="Preview"
              className="w-20 h-16 border object-cover rounded-lg"
            />
          </label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="relative">
            <Select
              isMulti
              options={departmentOptions}
              value={departments}
              onChange={handleDepartmentsChange}
              placeholder="Select Departments"
              className="text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#147341] text-white rounded-lg px-4 py-3 font-semibold hover:bg-green-700"
          >
            Update Service
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditServicesModal
