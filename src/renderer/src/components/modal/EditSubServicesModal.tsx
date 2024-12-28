import { editSubCategory, getCategories } from '@renderer/api/queries/adminqueries'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { SubCategory } from '@renderer/api/queries/datainterfaces'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '@renderer/context/authContext'

interface EditServicesModalProps {
  isOpen: boolean
  onClose: () => void
  subcategory: SubCategory
}

interface OptionType {
  value: number
  label: string
}

const EditSubServicesModal: React.FC<EditServicesModalProps> = ({
  isOpen,
  onClose,
  subcategory
}) => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [price, setPrice] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<OptionType[]>([])
  const {token}=useAuth();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ token }),
    enabled: !!token
  })

  // Prepopulate fields when the modal opens
  useEffect(() => {
    if (subcategory && isOpen) {
      const assignedCategories = subcategory.categories?.map((cat) => cat.id)
      const preselectedCategories =
        categories?.data
          ?.filter((cat) => assignedCategories?.includes(cat.id))
          ?.map((cat) => ({
            value: cat.id,
            label: cat.title
          })) || []

      setSelectedCategories(preselectedCategories)
      setTitle(subcategory?.title || '')
      // setSubtitle(subcategory?.subTitle || '')
      setPrice(subcategory?.price || '')
    }
  }, [subcategory, categories, isOpen])

  const handleCategoriesChange = (selectedOptions: OptionType[]) => {
    setSelectedCategories(selectedOptions)
  }
  const mutation = useMutation({
    mutationFn: (data: { title: string; price: string; categories: number[] }) =>
      editSubCategory({ token, id: subcategory.id, data }),
    onSuccess: () => {
      alert('SubCategory updated successfully!');
      onClose();
    },
    onError: (error) => {
      console.error('Error updating subcategory:', error);
      alert('Failed to update SubCategory.');
    },
  });

  const handleSubmit = () => {
    // Validate form fields
    if (!title || !price || selectedCategories.length === 0) {
      alert('Please fill all required fields.');
      return;
    }

    // Collect data to submit
    const submittedData = {
      title,
      price,
      categories: selectedCategories.map((cat) => cat.value),
    };

    mutation.mutate(submittedData); // Call the mutation
  };

  const categoryOptions: OptionType[] =
    categories?.data?.map((cat) => ({
      value: cat.id,
      label: cat.title
    })) || []

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

          {/* Price Input */}
          <div className="relative">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
              options={categoryOptions}
              value={selectedCategories}
              onChange={handleCategoriesChange}
              placeholder="Select Categories"
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

export default EditSubServicesModal
