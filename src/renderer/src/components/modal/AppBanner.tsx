import { Icons } from '@renderer/constant/Icons'
import { Images } from '@renderer/constant/Image'
import { useState } from 'react'

const AppBanner = ({ modalVisible, setModalVisible, onSend }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(URL.createObjectURL(file))
    }
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedImage(null)
  }

  if (!modalVisible) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-md p-6 rounded-lg bg-white shadow-lg transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-5 flex w-full justify-center">
          <label className="cursor-pointer w-full">
            <div className="h-20 border flex items-center justify-center w-full rounded-md">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full object-cover rounded-full"
                />
              ) : (
                <span className="text-gray-500 w-full text-center">
                  <img src={Images.tableImg} className="w-full object-cover" alt="" />
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-10">
          <div className="flex justify-between text-sm">
            <span>Nov 7, 2024 - 10:22 am</span>
            <span>Delivered</span>
          </div>
        </div>

        <div className="mt-6 flex">
          <button
            onClick={() => onSend(selectedImage)}
            className="mr-2 p-3 text-center text-white bg-green-700 rounded-lg hover:bg-green-800"
            disabled={!selectedImage}
          >
            Resend
          </button>
          <button className="px-3 text-center text-white bg-gray-100 rounded-lg hover:bg-gray-300">
            <img src={Icons.edit} alt="" width={15} />
          </button>
          <button
            className="px-3 ms-2 text-center text-white bg-gray-100 rounded-lg hover:bg-gray-300"
            onClick={closeModal}
          >
            <img src={Icons.cross} alt="" width={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppBanner
