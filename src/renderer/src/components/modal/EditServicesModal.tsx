import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { editCategory, getDepartments } from '@renderer/api/queries/adminqueries'
import { token } from '@renderer/api/config'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Category } from '@renderer/api/queries/datainterfaces'
import { getImageUrl } from '@renderer/api/helper'

interface EditServicesModalProps {
  isOpen: boolean
  onClose: () => void
  service: Category | null
}

interface OptionType {
  value: number
  label: string
}

const EditServicesModal: React.FC<EditServicesModalProps> = ({ isOpen, onClose, service }) => {
  const [title, setTitle] = useState('Sample Service Title')
  const [subtitle, setSubtitle] = useState('Sample Service Subtitle')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>('https://via.placeholder.com/150')
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<{ value: number; label: string }[]>(
    []
  )

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

  const {
    data: departmentsData,
    isLoading: isDepartmetnLoading,
    isError: isDepartmentError,
    error: departmenterror
  } = useQuery({
    queryKey: ['departmentsData'],
    queryFn: () => getDepartments({ token }),
    enabled: !!token
  })

  const mutation = useMutation({
    mutationFn: editCategory,
    onSuccess: () => {
      alert('Category Updated successfully!')
      // resetForm()
      onClose()
    },
    onError: (error) => {
      console.error('Error creating category:', error)
      alert('Failed to create category.')
    }
  })
  useEffect(() => {
    if (service) {
      const assignedDepartmentIds = service.departments?.map((dept) => dept.departmentId)

      const preselectedDepartments =
        departmentsData?.data
          ?.filter((dept) => assignedDepartmentIds?.includes(dept.id))
          ?.map((dept) => ({
            value: dept.id,
            label: dept.title
          })) || []
      setSelectedDepartments(preselectedDepartments)
      setTitle(service?.title || '')
      setSubtitle(service?.subTitle || '') // Fix: Subtitle now editable
      setImagePreview(getImageUrl(service?.image) || 'https://via.placeholder.com/150')

    }
  }, [service, departmentsData])

  const handleDepartmentsChange = (selectedOptions: any) => {
    setSelectedDepartments(selectedOptions as OptionType[])
  }

  const departmentOptions: OptionType[] =
    departmentsData?.data?.map((dept) => ({
      value: dept.id,
      label: dept.title
    })) || []

  const handleSubmit = () => {
    // Validate fields
    if (!title  || selectedDepartments.length === 0) {
      alert('Please fill all required fields.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('subtitle', subtitle)
    formData.append('image', image)
    formData.append('departmentIds', JSON.stringify(selectedDepartments.map((d) => d.value)))

    mutation.mutate({
      token: token,
      id: service?.id.toString() || '',
      data: formData
    })
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

          {/* Departments Selection */}
          <div className="relative">
            <Select
              isMulti
              options={departmentOptions}
              value={selectedDepartments}
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
