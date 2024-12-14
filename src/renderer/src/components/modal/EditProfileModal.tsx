import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string;
    gender: string;
    password: string;
    profilePhoto?: string;
  };
  onUpdate: (updatedData: Record<string, string | undefined>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({ ...userData });
  const [showPassword, setShowPassword] = useState(false);

  // Sync formData only when modal is opened or userData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(userData);
    }
  }, [isOpen, userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            profilePhoto: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={formData.profilePhoto || "https://via.placeholder.com/80"}
              alt="Profile"
              className="w-20 h-20 object-cover rounded-full border border-gray-300"
            />
            <label
              htmlFor="profilePhoto"
              className="mt-5 border border-[#147341] text-[#147341] text-xs px-6 py-1 rounded-lg cursor-pointer"
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

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Full Name</span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Username</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Phone Number</span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Gender</span>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          <label className="block relative">
            <span className="block text-sm font-medium text-gray-700">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-9 right-4 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </label>

          <div className="mt-6">
            <button
              type="submit"
              onClick={handleUpdate}
              className="w-full bg-[#147341] text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
