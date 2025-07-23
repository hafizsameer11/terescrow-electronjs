import React, { useState } from 'react'
import Select from 'react-select'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAgent } from '@renderer/api/queries/adminqueries'
import { Department } from '@renderer/api/queries/datainterfaces'
import { useAuth } from '@renderer/context/authContext'

interface OptionType {
  value: number;
  label: string;
}

interface AgentEditProfileModalProps {
  isOpen: boolean
  onClose: () => void,
  departmentData?: Department[] | null
}

const AddAgentProfileModal: React.FC<AgentEditProfileModalProps> = ({
  isOpen,
  onClose,
  departmentData
}) => {
  const queryClient = useQueryClient()
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    username: '',
    gender: '',
    countryId: 1,
    countr: 'Nigeria',
    departmentIds: [] as number[],
    profilePhoto: null,
  })
  const [showPassword, setShowPassword] = useState(false)

  const createAgentMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries(['agentsData'])
      onClose()
    },
    onError: (error) => {
      alert('Error creating agent: ' + error.message)
      console.error('Error creating agent:', error)
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentsChange = (selectedOptions: any) => {
    setFormData((prev) => ({
      ...prev,
      departmentIds: selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [],
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
      }))
    }
  }



  const handleCreateAgent = () => {
    const requestData = {
      ...formData,
      token,
    }
    createAgentMutation.mutate({ token, data: requestData })
  }

  if (!isOpen) return null
  const departmentOptions: OptionType[] =
    departmentData?.map((dept) => ({
      value: dept.id,
      label: dept.title,
    })) || [];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-6  " style={{ overflowY: 'scroll' }}>
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 mt-32">
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Add new Agent</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-4xl">
            &times;
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
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

        <div className="space-y-4">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341]"
          />

          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341]"
          />

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341]"
          />
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341]"
          />
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="PhoneNumber"
            className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341]"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341]"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <Select
            isMulti
            options={departmentOptions}
            value={departmentOptions.filter((opt) =>
              formData.departmentIds.includes(opt.value)
            )}
            onChange={handleDepartmentsChange}
            placeholder="Select Departments"
            className="text-sm"
          />

          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341]"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}

              className="absolute right-4 top-3 text-gray-600 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500"
          >
            {/* {showPassword ? <FaEyeSlash /> : <FaEye />} */}
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={handleCreateAgent}
            className="w-full bg-[#147341] text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Add Agent
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddAgentProfileModal
