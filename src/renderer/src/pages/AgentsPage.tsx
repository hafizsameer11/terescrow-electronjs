import React, { useState } from "react";
import AgentCard from "@renderer/components/AgentCard";
import { Images } from "@renderer/constant/Image";
import AgentEditProfileModal from "@renderer/components/modal/AgentEditProfileModal";

interface Agent {
  id: number;
  name: string;
  username: string;
  avatar: string;
  status: "Online" | "Offline";
}

const AgentsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Dummy data for agents
  const agents: Agent[] = [
    {
      id: 1,
      name: "Qamardeen Malik",
      username: "Alucard",
      avatar: Images.agent1,
      status: "Online",
    },
    {
      id: 2,
      name: "John Doe",
      username: "jdoe",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      status: "Offline",
    },
    {
      id: 3,
      name: "Jane Smith",
      username: "jsmith",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      status: "Online",
    },
    {
      id: 4,
      name: "Alice Johnson",
      username: "ajohnson",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      status: "Online",
    },
    {
      id: 5,
      name: "Bob Brown",
      username: "bbrown",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      status: "Offline",
    },
    {
      id: 6,
      name: "Mary Lee",
      username: "mlee",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      status: "Online",
    },
    {
      id: 7,
      name: "Chris Green",
      username: "cgreen",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      status: "Online",
    },
  ];

  // Filtered agents based on search query
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const agentData = {
    fullName: selectedAgent?.name || "",
    username: selectedAgent?.username || "",
    role: "Agent",
    departments: ["Buy Crypto", "Sell Crypto"],
    password: "password123",
    profilePhoto: selectedAgent?.avatar || "",
  };

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
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            Add new Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onView={() => alert(`Viewing details of ${agent.name}`)}
            onEdit={() => {
              setSelectedAgent(agent);
              setIsModalOpen(true);
            }}
            onDelete={() => alert(`Deleting ${agent.name}`)}
          />
        ))}
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && selectedAgent && (
        <AgentEditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          agentData={agentData}
          onUpdate={(updatedData) =>
            console.log("Updated Data:", updatedData)
          }
        />
      )}
    </div>
  );
};

export default AgentsPage;
