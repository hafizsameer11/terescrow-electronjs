import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, getSingleCategory, deleteCategory } from '@renderer/api/queries/adminqueries'
import { token } from '@renderer/api/config'
import ViewSIngleServiceModal from './modal/ViewSIngleServiceModal'

const ServicesTable = () => {
  const queryClient = useQueryClient()

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch all categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ token }),
    enabled: !!token,
  })

  // Fetch single category when an ID is selected
  const { data: singleCategory, isLoading: isSingleLoading } = useQuery({
    queryKey: ['singleCategory', selectedCategoryId],
    queryFn: () => getSingleCategory({ token, id: selectedCategoryId! }),
    enabled: !!selectedCategoryId,
  })

  // Mutation for deleting a category
  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCategory({ token, id }),
    onSuccess: () => {
      alert('Category deleted successfully!')
      queryClient.invalidateQueries(['categories'])
    },
    onError: (error) => {
      console.error('Failed to delete category:', error)
      alert('Error deleting category.')
    },
  })

  const handleOpenViewModal = (id: string) => {
    setSelectedCategoryId(id)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedCategoryId(null)
  }

  const handleOpenEditModal = () => setIsEditModalOpen(true)
  const handleCloseEditModal = () => setIsEditModalOpen(false)

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Subtitle</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {categories?.data.map((category, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">
                <img src={category.image} alt={category.title} className="object-cover w-16 h-16" />
              </td>
              <td className="px-4 py-2">{category.title}</td>
              <td className="px-4 py-2">{category.subTitle}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                  onClick={() => handleOpenViewModal(category.id?.toString())}
                >
                  <AiOutlineEye size={20} />
                </button>
                <button
                  className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                  onClick={handleOpenEditModal}
                >
                  <AiOutlineEdit size={20} />
                </button>
                <button
                  className="text-red-500 bg-gray-100 p-2 rounded-lg"
                  onClick={() => handleDeleteCategory(category.id?.toString())}
                >
                  <AiOutlineDelete size={22} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isViewModalOpen && singleCategory && (
        <ViewSIngleServiceModal data={singleCategory.data} onClose={handleCloseViewModal} />
      )}
    </div>
  )
}

export default ServicesTable
