import React, { useEffect, useState } from "react";
import AgentCard from "@renderer/components/AgentCard";
import { Images } from "@renderer/constant/Image";
import AgentEditProfileModal from "@renderer/components/modal/AgentEditProfileModal";
import AddAgentProfileModal from "@renderer/components/modal/AddAgentProfileModal";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgentByDepartment, getCustomerDetails, getDepartments } from "@renderer/api/queries/adminqueries";
import { token } from "@renderer/api/config";
import { Agent } from "@renderer/api/queries/datainterfaces";
import { Department } from "@renderer/components/DepartmentsTable";
// interface Agent {
//   id: number;
//   name: string;
//   username: string;
//   avatar: string;
//   status: "Online" | "Offline";
// }

const AgentsPage: React.FC = () => {
  const location = useLocation();

  // Extract the department ID from the query string
  const queryParams = new URLSearchParams(location.search);
  const departmentId = queryParams.get("id");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const [selectedDepartment, setSelectedDepartment] = useState<Department[] | null>([]);

//fetching all depart
const { data: departmentsData, isLoading:isDepartmetnLoadin, isError: isDepartmentError, error: departmenterror } = useQuery({
  queryKey: ['departmentsData'],
  queryFn: () => getDepartments({ token }),
  enabled: !!token,
});

// Effect to Set Filtered Departments
useEffect(() => {
  if (departmentsData) {
    setSelectedDepartment(departmentsData.data)
  }
}, [departmentsData]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["agentsData", departmentId],
    queryFn: () => getAgentByDepartment({ token, id: departmentId! }),
    enabled: !!departmentId,
  });


  const filteredAgents = data?.data.filter(
    (agent) =>
      agent.user.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Buy Crypto - Agents</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add new Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAgents?.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onView={() => alert(`Viewing details of ${agent.user.username}`)}
            onEdit={() => {
              setSelectedAgent(agent);
              setIsEditModalOpen(true);
            }}
            onDelete={() => alert(`Deleting ${agent.user.username}`)}
          />
        ))}
      </div>

      Edit Profile Modal
      {isEditModalOpen && selectedAgent && (
        <AgentEditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          agentData={selectedAgent}
          departmentData={selectedDepartment}
          onUpdate={(updatedData) =>
            console.log("Updated Data:", updatedData)
          }
        />
      )}

      {/* Add Profile Modal */}
      {/* {isAddModalOpen && (
        <AddAgentProfileModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onUpdate={(updatedData) => console.log("Updated Data:", updatedData)}
          agentData={agentData}
        />
      )} */}
    </div>
  );
};

export default AgentsPage;
