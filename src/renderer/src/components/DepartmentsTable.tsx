import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaUserAlt } from "react-icons/fa";
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import StatusButton from "./StatusButton";
import { Icons } from "@renderer/constant/Icons";

interface Department {
  id: number;
  name: string;
  status: string; // Active or Inactive
  noOfAgents: number;
  description: string;
}

const departmentsData: Department[] = [
  {
    id: 1,
    name: "Buy Crypto",
    status: "Active",
    noOfAgents: 3,
    description: "Buying of cryptocurrency",
  },
  {
    id: 2,
    name: "Sell Crypto",
    status: "Active",
    noOfAgents: 3,
    description: "Selling of cryptocurrency",
  },
  {
    id: 3,
    name: "Buy Gift Card",
    status: "Active",
    noOfAgents: 3,
    description: "Buying of giftcard",
  },
  {
    id: 4,
    name: "Sell Gift Card",
    status: "Active",
    noOfAgents: 3,
    description: "Selling of giftcard",
  },
];

const DepartmentsTable: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState(departmentsData);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = departmentsData.filter((department) =>
      department.name.toLowerCase().includes(query)
    );
    setFilteredDepartments(filtered);
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">

        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">No of Agents</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((department) => (
              <tr key={department.id} className="border-t hover:bg-gray-50">
                <td className="pt-2 pb-0 px-4 flex items-center gap-3">
                  <div className="bg-gray-300 rounded-full p-2">
                    {/* Use your Icons.crypto */}
                    <img src={Icons.crypto} alt="" />
                  </div>
                  <span>{department.name}</span>
                </td>
                <td>
                  <StatusButton title="Active" status={department.status} />
                </td>
                <td className="py-3 px-4">{department.noOfAgents}</td>
                <td className="py-3 px-4">{department.description}</td>
                <td className="py-3 px-4 text-center flex justify-center gap-2">
                  <button
                     onClick={() => navigate(`/department-agent?id=${department.id}`)} // Navigate to Agent Page
                    className="bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                    title="Assign Agents"
                  >
                    <FaUserAlt /> Assign Agents
                  </button>
                  <button

                    className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200"
                    title="View Details"
                  >
                    <MdVisibility />
                  </button>
                  <button
                    className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200"
                    title="Edit Department"
                  >
                    <MdEdit />
                  </button>
                  <button
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                    title="Delete Department"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>g
      </div>
    </div>
  );
};

export default DepartmentsTable;
