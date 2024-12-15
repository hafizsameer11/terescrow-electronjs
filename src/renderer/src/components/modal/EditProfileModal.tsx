import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateCustomer } from "@renderer/api/queries/adminqueries"; // Adjust import path
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { token } from "@renderer/api/config";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    gender: string;
    firstname: string;
    lastname: string;
    country: string;
    password: string;
    profilePhoto?: string;
  };
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  const [formData, setFormData] = useState({ ...userData });
  const [showPassword, setShowPassword] = useState(false);

  // Mutation for updating customer
  const mutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      alert("Customer updated successfully!");
      onClose(); // Close modal on success
    },
    onError: (error) => {
      console.error("Error updating customer:", error);
      alert("Failed to update customer.");
    },
  });

  useEffect(() => {
    if (isOpen) setFormData(userData); // Sync when modal opens
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
            profilePhoto: event.target.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    mutation.mutate({
      token: token, // Replace with actual token logic
      id: formData.id,
      data: {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        firstname: formData.firstname,
        lastname: formData.lastname,
        country: formData.country,
        profilePicture: formData.profilePhoto || "",
      },
    });
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
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Full Name</span>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Last Name</span>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
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
              <option value="male">Male</option>
              <option value="female">Female</option>
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
