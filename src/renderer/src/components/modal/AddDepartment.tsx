import React, { useState } from 'react'


const FloatingInput = (props: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div className="relative">
    <input
      type={props.type || 'text'}
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      placeholder=" "
      className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
    />
    <label
      className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 left-4 bg-white px-1 z-10 ${props.value
        ? 'scale-75 -translate-y-4'
        : 'peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100'
      } peer-focus:scale-75 peer-focus:-translate-y-4`}
    >
      {props.label}
    </label>
  </div>
)
interface AgentEditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedData: Record<string, any>) => void
}

const Department: React.FC<AgentEditProfileModalProps> = ({
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState<{
    name: string,
    status: string,
    description: string,
    profilePhoto?: string
  }>({
    name: '',
    status: '',
    description: '',
    profilePhoto: ''
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        const target = event.target
        if (target && target.result) {
          setFormData((prev) => ({
            ...prev,
            profilePhoto: target.result as string
          }))
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleUpdate = () => {
    onUpdate(formData)
    onClose()
  }

  if (!isOpen) return null

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Add new Department</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-4xl">
            &times;
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={formData.profilePhoto || 'https://via.placeholder.com/80'}
              alt="Profile"
              className="w-20 h-20 object-cover rounded-full border border-gray-300"
            />
            <label
              htmlFor="profilePhoto"
              className="mt-2 block text-sm font-medium text-[#147341] cursor-pointer border text-center rounded-lg py-1 border-green-700"
            >
              Change
            </label>
            <input
              type="file"
              id="profilePhoto"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <FloatingInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <div className="relative">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341] bg-white"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4">
              Status
            </label>
          </div>

          {/* Description Section */}
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341] resize-none"
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4">
              Description
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6">
          <button
            onClick={handleUpdate}
            className="w-full bg-[#147341] text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Add Department
          </button>
        </div>
      </div>
    </div>
  )
}

export default Department
