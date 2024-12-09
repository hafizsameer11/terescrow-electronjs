import React, { useState } from "react";
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
    profilePhoto?: string; // Optional profile photo
  };
  onUpdate: (updatedData: Record<string, string | undefined>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onUpdate,
}) => {
  const [formData, setFormData] = useState(userData);
  const [showPassword, setShowPassword] = useState(false);

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
            profilePhoto: event.target.result as string, // Set base64 image
          }));
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    console.log("Updated Data:", formData); // Log updated data
    onUpdate(formData);
    onClose();
  };

  if (!isOpen) return null;

  const FloatingInput = ({
    label,
    name,
    type = "text",
    value,
    handleChange,
  }: {
    label: string;
    name: string;
    type?: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder=" "
        className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
      />
      <label
        className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 left-4 bg-white px-1 z-10
          ${value ? "scale-75 -translate-y-4" : "peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100"}
          peer-focus:scale-75 peer-focus:-translate-y-4`}
      >
        {label}
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={formData.profilePhoto || "https://via.placeholder.com/80"}
              alt="Profile"
              className="w-20 h-20 object-cover rounded-full border border-gray-300"
            />
            <label
              htmlFor="profilePhoto"
              className="-ml-1 mt-5 border border-[#147341]  text-[#147341] text-xs px-6 py-1 rounded-lg cursor-pointer "
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

        {/* Form Section */}
        <div className="space-y-4">
          <FloatingInput
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            handleChange={handleChange}
          />

          <FloatingInput
            label="Username"
            name="username"
            value={formData.username}
            handleChange={handleChange}
          />

          <FloatingInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            handleChange={handleChange}
          />

          <FloatingInput
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            handleChange={handleChange}
          />

          {/* Gender */}
          <div className="relative">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341] bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4">
              Gender
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341] pr-10"
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 bg-white px-1 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Update Button */}
        <div className="mt-6">
          <button
            onClick={handleUpdate}
            className="w-full bg-[#147341] text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
