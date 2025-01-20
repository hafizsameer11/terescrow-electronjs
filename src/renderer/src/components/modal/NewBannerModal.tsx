import { useState } from 'react'

const NewBannerModal = ({ modalVisible, setModalVisible, onSend }) => {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImageFile(file) // Store the file for upload
      setPreviewImage(URL.createObjectURL(file)) // Preview the image
    }
    onSend(file)
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedImageFile(null)
    setPreviewImage(null)
  }

  if (!modalVisible) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-md p-6 rounded-lg bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-center m-auto font-semibold">New Banner</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 text-3xl">
            &times;
          </button>
        </div>

        <div className="mt-5 flex w-full justify-center">
          <label className="cursor-pointer w-full">
            <div className="h-20 border flex items-center justify-center w-full rounded-md">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-gray-500 text-center">Select an image</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageSelection} className="hidden" />
          </label>
        </div>

        <div className="mt-6">
          <button
            onClick={() => onSend(selectedImageFile)}
            className="w-full p-3 text-white bg-green-700 rounded-lg hover:bg-green-800"
            disabled={!selectedImageFile}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewBannerModal
