import React, { useState, useEffect } from "react";
import Select, { MultiValue } from "react-select";
import { useMutation } from "@tanstack/react-query";
import { API_DOMAIN } from "@renderer/api/config";
import { getImageUrl } from "@renderer/api/helper";

interface OptionType {
  value: number;
  label: string;
}

interface AgentEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: {
    id: number;
    assignedDepartments: { departmentId: number }[];
    user: {
      firstname: string;
      username: string;
      email: string;
      profilePicture?: string;
    };
    AgentStatus: string;
  };
  onUpdate: (updatedData: Record<string, any>) => void;
  departmentData?: { id: number; title: string }[] | null;
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
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  useEffect(() => {
    console.log("agent data", agentData);
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

    setFormData((prev) => {
      if (name === "AgentStatus") {
        // Update AgentStatus directly
        return { ...prev, [name]: value };
      }
      // Update user fields
      return { ...prev, user: { ...prev.user, [name]: value } };
    });
  };

  const handleDepartmentsChange = (selectedOptions: MultiValue<OptionType>) => {
    setSelectedDepartments(selectedOptions as OptionType[]);
  };


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhotoFile(e.target.files[0]);
    }
  };

  const handleUpdate = () => {
    const updatedData = {
      ...formData,
      assignedDepartments: selectedDepartments.map((opt) => opt.value),
      profilePicture: profilePhotoFile || formData.user.profilePicture,
    };


    // Mock API call using a dummy URL
    fetch(`${API_DOMAIN}/admin/operations/update-agent/${agentData.id}`, {
      method: "POST",
      body: JSON.stringify(updatedData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Update successful:", data);
        onUpdate(updatedData);
        onClose();
      })
      .catch((error) => {
        console.error("Update failed:", error);
        alert("Failed to update agent.");
      });
  };

  if (!isOpen) return null;

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


        {/* Form Section */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="firstname"
              value={formData?.user?.firstname || ""}
              onChange={handleChange}
              disabled
              placeholder="First Name"
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData?.user?.username || ""}
              onChange={handleChange}
              placeholder="Username"
              disabled
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
            />
          </div>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData?.user?.email || ""}
              onChange={handleChange}
              placeholder="Email"
              disabled
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341]"
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative">
            <select
              name="AgentStatus"
              value={formData.AgentStatus}
              onChange={handleChange}
              className="peer w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#147341] focus:border-[#147341] bg-white"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
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
