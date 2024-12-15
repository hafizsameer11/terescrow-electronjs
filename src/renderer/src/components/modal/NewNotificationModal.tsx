import React, { useState, useEffect } from 'react'
import TeamGroupModal from './TeamGroupModal'

interface NewNotificationModalProps {
  isOpen: boolean
  actionType: 'add' | 'edit'
  onClose: () => void
  onSubmit: (formData: {
    title: string
    message: string
    image: File | null
    recipientType: string
    customerSelection: string[]
  }) => void
  initialData?: {
    title: string
    message: string
    imagePreview?: string
    recipientType: string
    customerSelection: string[]
  }
}

const NewNotificationModal: React.FC<NewNotificationModalProps> = ({
  isOpen,
  actionType,
  onClose,
  onSubmit,
  initialData = {
    title: '',
    message: '',
    imagePreview: null,
    recipientType: 'customer',
    customerSelection: ['All']
  }
}) => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [recipientType, setRecipientType] = useState('customer')
  const [customerSelection, setCustomerSelection] = useState<string[]>(['All'])
  const [errors, setErrors] = useState<{ title?: string; message?: string }>({})
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  // Populate form fields if editing
  useEffect(() => {
    if (actionType === 'edit' && initialData) {
      setTitle(initialData.title)
      setMessage(initialData.message)
      setImagePreview(initialData.imagePreview || null)
      setRecipientType(initialData.recipientType)
      setCustomerSelection(initialData.customerSelection)
    }
  }, [actionType, initialData])

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

  const handleRecipientTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientType(e.target.value)
  }

  const handleCustomerSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setCustomerSelection(selectedOptions)
    if (selectedOptions.includes('All')) {
      handleOpenModal()
    }
  }

  const handleOpenModal = () => setIsCustomerModalOpen(true)
  const handleCloseModal = () => setIsCustomerModalOpen(false)

  const validate = () => {
    const validationErrors: { title?: string; message?: string } = {}
    if (!title.trim()) validationErrors.title = 'Title is required.'
    if (!message.trim()) validationErrors.message = 'Message is required.'
    return validationErrors
  }

  const handleSubmit = () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit({
      title,
      message,
      image,
      recipientType,
      customerSelection
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[500px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
        >
          &times;
        </button>

        {/* Modal Title */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {actionType === 'add' ? 'New Notification' : 'Edit Notification'}
        </h2>

        <div className="space-y-4">
          {/* Title Input */}
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setErrors((prev) => ({ ...prev, title: undefined }))
              }}
              placeholder=" "
              className={`peer w-full border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'focus:ring-red-500 focus:border-red-500'
                  : 'focus:ring-[#147341] focus:border-[#147341]'
              }`}
            />
            <label
              className={`absolute text-sm ${
                errors.title ? 'text-red-500' : 'text-gray-500'
              } duration-300 transform -translate-y-4 scale-75 top-2 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4`}
            >
              Title
            </label>
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Message Input */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setErrors((prev) => ({ ...prev, message: undefined }))
              }}
              placeholder=" "
              className={`peer w-full border ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              } rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 ${
                errors.message
                  ? 'focus:ring-red-500 focus:border-red-500'
                  : 'focus:ring-[#147341] focus:border-[#147341]'
              }`}
            />
            <label
              className={`absolute text-sm ${
                errors.message ? 'text-red-500' : 'text-gray-500'
              } duration-300 transform -translate-y-4 scale-75 top-2 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4`}
            >
              Message
            </label>
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
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

          {/* Recipient Type */}
          <div className="space-x-4">
            <label>
              <input
                type="radio"
                value="customer"
                checked={recipientType === 'customer'}
                onChange={handleRecipientTypeChange}
              />
              Customer
            </label>
            <label>
              <input
                type="radio"
                value="agent"
                checked={recipientType === 'agent'}
                onChange={handleRecipientTypeChange}
              />
              Agent
            </label>
          </div>
          
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#147341] text-white rounded-lg px-4 py-3 font-semibold hover:bg-green-700"
          >
            {actionType === 'add' ? 'Send Notification' : 'Update Notification'}
          </button>
        </div>
      </div>

      <TeamGroupModal
        modalVisible={isCustomerModalOpen}
        setModalVisible={setIsCustomerModalOpen}
        onUserSelection={(selectedUsers) => console.log(selectedUsers)}
      />
    </div>
  )
}

export default NewNotificationModal
