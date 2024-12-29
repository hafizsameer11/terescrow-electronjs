import { getImageUrl } from '@renderer/api/helper';
import { getAllAgentss } from '@renderer/api/queries/adminqueries';
import { AllAgentsResponse } from '@renderer/api/queries/datainterfaces';
import { Images } from '@renderer/constant/Image';
import { useAuth } from '@renderer/context/authContext';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

interface Agent {
  id: number;
  src: string;
  alt: string;
}

const OnlineAgents: React.FC = () => {
  const agents: Agent[] = [
    { id: 1, src: Images.agent1, alt: 'Agent 1' },
    { id: 2, src: Images.agent1, alt: 'Agent 2' },
    { id: 3, src: Images.agent1, alt: 'Agent 3' },

  ];
  const {token}=useAuth()
  const { data: allAgentsData, isLoading, isError } = useQuery<AllAgentsResponse>({
    queryKey: ['all-agents'],
    queryFn: () => getAllAgentss({ token }),
  });

  return (
    <div className="flex flex-col items-center ">
      <span className={`text-sm text-[#00000080] mb-2 font-[400]`}>Online Agents</span>
      <div className="flex -space-x-2">
        { !isLoading && allAgentsData?.data.map((agent) => (
          <img
            key={agent.id}
            src={getImageUrl(agent.user.profilePicture || "") || "N/A"}
            alt={agent.user.username}
            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
          />
        ))}
        <span className="w-10 h-10 flex items-center justify-center bg-gray-300 text-gray-600 text-sm font-semibold rounded-full border-2 border-white shadow-md">
          +3
        </span>
      </div>
    </div>
  );
};

export default OnlineAgents;
