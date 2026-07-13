import React from 'react';
import { Icons } from '@renderer/constant/Icons';
import { useAuth } from '@renderer/context/authContext';
import { useQuery } from '@tanstack/react-query';
import { AllAgentsResponse } from '@renderer/api/queries/datainterfaces';
import { getAllAgentss } from '@renderer/api/queries/adminqueries';
import { getImageUrl } from '@renderer/api/helper';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@renderer/context/socketContext';

const OnlineAgentsModal: React.FC<{ onCLose: () => void }> = (props) => {
  const { token } = useAuth();
  const { onlineAgents } = useSocket();
  const navigate = useNavigate();

  const handleclick = (id: number | string) => {
    navigate(`/customers/${id}`);
    props.onCLose();
  };

  const { data: allAgentsData, isLoading } = useQuery<AllAgentsResponse>({
    queryKey: ['all-agents'],
    queryFn: () => getAllAgentss({ token }),
    enabled: !!token,
  });

  const onlineIds = new Set(onlineAgents.map((a) => Number(a.userId)));
  const agents = allAgentsData?.data ?? [];
  const onlineAgentsFiltered = agents.filter((agent) => onlineIds.has(agent.user.id));
  const listToShow = onlineAgentsFiltered.length > 0 ? onlineAgentsFiltered : agents;

  return (
    <div className="fixed inset-0 flex items-center justify-end bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white w-2/5 p-6 rounded-3xl shadow-xl absolute right-10 top-28 max-h-[70vh] overflow-y-auto">
        <button type="button" onClick={props.onCLose} className="absolute top-5 right-10 text-xl text-gray-600">
          <img src={Icons.cross} alt="Close Modal" />
        </button>
        <div className="text-2xl font-semibold text-gray-800 text-center mb-6">Online Agents</div>

        <div>
          {isLoading && <p className="text-center text-gray-500">Loading agents…</p>}
          {!isLoading && listToShow.length > 0 ? (
            listToShow.map((agent) => {
              const isOnline = onlineIds.has(agent.user.id);
              return (
                <div
                  key={agent.user.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleclick(agent.user.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleclick(agent.user.id)}
                  className="flex items-center justify-between py-3 border border-gray-200 mb-4 rounded-lg p-5 cursor-pointer hover:bg-gray-50"
                >
                  <img
                    src={getImageUrl(agent.user.profilePicture || '')}
                    alt={agent.user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      {agent.user.firstname} {agent.user.lastname}
                    </div>
                    <div className="text-sm text-gray-600">@{agent.user.username}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-600">No agents found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineAgentsModal;
