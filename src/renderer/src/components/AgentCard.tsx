import React from "react";
import { MdVisibility, MdEdit, MdDelete } from "react-icons/md";

interface Agent {
  id: number;
  name: string;
  username: string;
  avatar: string;
  status: "Online" | "Offline";
}

interface AgentCardProps {
  agent: Agent;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg   flex flex-col items-center text-center  border border-gray-200">
      <div className="top-container w-full flex items-center  p-2 ">

        <img
          src={agent.avatar}
          alt={agent.name}
          className="w-[57px]  h-[57px] rounded-full object-cover "
        />
        <div className="flex flex-col items-start ml-4 gap-2 w-full">
          <h3 className="text-[14px] text-black text-left font-[500]">{agent.name}</h3>
          <span className="text-[10px] text-[#00000080]">@{agent.username}</span>

        </div>

        <div className="flex items-center justify-end  w-full mt-8">
          <span
            className={`w-3 h-3 rounded-full ${agent.status === "Online" ? "bg-green-500" : "bg-gray-400"
              }`}
          ></span>
          <span className="ml-2 text-sm text-gray-500">{agent.status}</span>
        </div>
      </div>
      <div className="flex  gap-cols-5 w-full border-t border-gray-200 py-2 px-2 ]">
        <button
          className="flex items-center justify-center  text-gray-600 p-2 rounded-md hover:bg-gray-200"
          onClick={() => onView(agent.id)}
        >
          <MdVisibility size={18} />
        </button>
        <button
          className="flex items-center justify-center  text-gray-600 p-2 rounded-md hover:bg-gray-200"
          onClick={() => onEdit(agent.id)}
        >
          <MdEdit size={18} />
        </button>
        <button
          className="flex items-center justify-center b text-red-600 p-2 rounded-md hover:bg-red-200"
          onClick={() => onDelete(agent.id)}
        >
          <MdDelete size={18} />
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
