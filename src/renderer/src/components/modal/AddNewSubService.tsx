import { token } from '@renderer/api/config'
import { getCategories, createSubCategory } from '@renderer/api/queries/adminqueries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import Select from 'react-select'

interface AddNewSubServiceProps {
  isOpen: boolean
  onClose: () => void
}

const AddNewSubService: React.FC<AddNewSubServiceProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [selectedCategories, setSelectedCategories] = useState<{ value: number; label: string }[]>([])

  // Fetch categories
  const { data: categoriesData, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ token }),
    enabled: !!token,
  })

  // Create SubCategory Mutation
  const mutation = useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => {
      alert('Sub-category created successfully!')
      // invalidateQueries(['subcategories'])
      queryClient.invalidateQueries(['subcategories'])
      resetForm()
      onClose()
    },
    onError: (error) => {
      console.error('Error creating sub-category:', error)
      alert('Failed to create sub-category.')
    }
  })

  const resetForm = () => {
    setTitle('')
    setSubtitle('')
    setPrice('')
    setSelectedCategories([])
  }

  const handleCategoriesChange = (selectedOptions: any) => {
    setSelectedCategories(selectedOptions || [])
  }

  const handleSubmit = () => {
    if (!title || !price || selectedCategories.length === 0) {
      alert('Please fill all required fields.')
      return
    }

    const data = {
      title,
      price,
      catIds: selectedCategories.map((cat) => cat.value)
    }

    mutation.mutate({
      token: token,
      data
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

          {/* Categories Selection */}
          <div className="relative">
            <Select
              isMulti
              options={categoriesData?.data.map((cat: any) => ({
                value: cat.id,
                label: cat.title
              }))}
              value={selectedCategories}
              onChange={handleCategoriesChange}
              placeholder="Select Categories"
              className="text-sm"
              isLoading={isLoading}
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
