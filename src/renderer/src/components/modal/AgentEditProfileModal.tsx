import React, { useState, useEffect } from "react";
import Select, { MultiValue } from "react-select";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Agent, Department } from "@renderer/api/queries/datainterfaces";
// import { Department } from "../DepartmentsTable";

interface OptionType {
  value: number;
  label: string;
}

interface AgentEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: Agent;
  onUpdate: (updatedData: Record<string, any>) => void;
  departmentData?: Department[] | null;
}

const AgentEditProfileModal: React.FC<AgentEditProfileModalProps> = ({
  isOpen,
  onClose,
  agentData,
  onUpdate,
  departmentData,
}) => {
  const [formData, setFormData] = useState(agentData);
  const [selectedDepartments, setSelectedDepartments] = useState<OptionType[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (agentData && departmentData) {
      const assignedDepartmentIds = agentData.assignedDepartments.map(
        (dept) => dept.departmentId
      );

      const preselectedDepartments = departmentData
        .filter((dept) => assignedDepartmentIds.includes(dept.id))
        .map((dept) => ({
          value: dept.id,
          label: dept.title,
        }));

      setSelectedDepartments(preselectedDepartments);
    }
  }, [agentData, departmentData]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, user: { ...prev.user, [name]: value } }));
  };

  const handleDepartmentsChange = (selectedOptions: MultiValue<OptionType>) => {
    setSelectedDepartments(selectedOptions as OptionType[]);
    setFormData((prev) => ({
      ...prev,
      departments: selectedOptions?.map((opt) => ({
        id: opt.value,
        title: opt.label,
      })) || [],
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              profilePicture: event.target.result as string,
            },
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

  const FloatingInput = (props: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="relative">
      <input
        type={props.type || "text"}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        placeholder=" "
        className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
      />
      <label
        className={`absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-2 left-4 bg-white px-1 ${
          props.value ? "scale-75 -translate-y-4" : "peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100"
        } peer-focus:scale-75 peer-focus:-translate-y-4`}
      >
        {props.label}
      </label>
    </div>
  );

  const departmentOptions: OptionType[] =
    departmentData?.map((dept) => ({
      value: dept.id,
      label: dept.title,
    })) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Agent Profile</h2>
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
              src={
                formData.user.profilePicture || "https://via.placeholder.com/80"
              }
              alt="Profile"
              className="w-20 h-20 object-cover rounded-full border border-gray-300"
            />
            <label
              htmlFor="profilePhoto"
              className="mt-2 block text-sm font-medium text-[#147341] cursor-pointer"
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
            name="firstname"
            value={formData?.user?.firstname || ""}
            onChange={handleChange}
          />
          <FloatingInput
            label="Username"
            name="username"
            value={formData?.user?.username || ""}
            onChange={handleChange}
          />

          {/* Role Dropdown */}
          <div className="relative">
            <select
              name="role"
              value={formData.user.role}
              onChange={handleChange}
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341] bg-white"
            >
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
            </select>
            <label className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-3 left-4 bg-white px-1">
              Role
            </label>
          </div>

          {/* Departments Dropdown */}
          <div className="relative">
            <Select
              isMulti
              options={departmentOptions}
              value={selectedDepartments}
              onChange={handleDepartmentsChange}
              placeholder="Select Departments"
              className="text-sm"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.user.password}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] pr-10"
            />
            <label className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-3 left-4 bg-white px-1">
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

export default AgentEditProfileModal;
