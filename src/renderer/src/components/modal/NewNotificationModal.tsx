import React, { useState } from "react";

interface NewNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    title: string;
    message: string;
    image: File | null;
  }) => void;
}

const NewNotificationModal: React.FC<NewNotificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ title?: string; message?: string }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage)); // Generate a preview URL for the selected image
    }
  };

  const validate = () => {
    const validationErrors: { title?: string; message?: string } = {};
    if (!title.trim()) {
      validationErrors.title = "Title is required.";
    }
    if (!message.trim()) {
      validationErrors.message = "Message is required.";
    }
    return validationErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = {
      title,
      message,
      image,
    };
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[500px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        {/* Modal Title */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          New Notification
        </h2>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Title Input */}
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder=" "
              className={`peer w-full border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 ${
                errors.title
                  ? "focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-[#147341] focus:border-[#147341]"
              }`}
            />
            <label
              className={`absolute text-sm ${
                errors.title ? "text-red-500" : "text-gray-500"
              } duration-300 transform -translate-y-4 scale-75 top-0 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4`}
            >
              Title
            </label>
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Message Input */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors((prev) => ({ ...prev, message: undefined }));
              }}
              placeholder=" "
              className={`peer w-full border ${
                errors.message ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 ${
                errors.message
                  ? "focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-[#147341] focus:border-[#147341]"
              }`}
            />
            <label
              className={`absolute text-sm ${
                errors.message ? "text-red-500" : "text-gray-500"
              } duration-300 transform -translate-y-4 scale-75 top-0 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4`}
            >
              Message
            </label>
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="flex flex-col items-start space-y-2">
            <label
              htmlFor="imageInput"
              className="w-[80px] h-[80px] flex items-center justify-center border border-gray-300 rounded-lg cursor-pointer"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
              )}
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500">Image (optional)</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#147341] text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewNotificationModal;
