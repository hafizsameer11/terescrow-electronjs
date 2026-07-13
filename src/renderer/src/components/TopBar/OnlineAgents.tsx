import { getImageUrl } from '@renderer/api/helper';
import { getAllAgentss } from '@renderer/api/queries/adminqueries';
import { getTeamStats } from '@renderer/api/queries/admin.chat.queries';
import { AllAgentsResponse } from '@renderer/api/queries/datainterfaces';
import { useAuth } from '@renderer/context/authContext';
import { useSocket } from '@renderer/context/socketContext';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

const MAX_AVATARS = 4;

const OnlineAgents: React.FC = () => {
  const { token } = useAuth();
  const { onlineAgents } = useSocket();

  const { data: allAgentsData, isLoading } = useQuery<AllAgentsResponse>({
    queryKey: ['all-agents'],
    queryFn: () => getAllAgentss({ token }),
    enabled: !!token,
  });

  const { data: teamStats } = useQuery({
    queryKey: ['team-stats-topbar'],
    queryFn: () => getTeamStats({ token }),
    enabled: !!token,
  });

  const onlineIds = useMemo(
    () => new Set(onlineAgents.map((a) => Number(a.userId))),
    [onlineAgents]
  );

  const agents = allAgentsData?.data ?? [];
  const onlineList = agents.filter((a) => onlineIds.has(a.user.id));
  const displayList = (onlineList.length > 0 ? onlineList : agents).slice(0, MAX_AVATARS);
  const onlineTotal =
    teamStats?.data?.totalOnlineAgents ?? (onlineList.length > 0 ? onlineList.length : agents.length);
  const plusMore = Math.max(0, onlineTotal - displayList.length);

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-[#00000080] mb-2 font-[400]">Online Agents</span>
      <div className="flex -space-x-2">
        {!isLoading &&
          displayList.map((agent) => (
            <img
              key={agent.id}
              src={getImageUrl(agent.user.profilePicture)}
              alt={agent.user.username}
              title={agent.user.username}
              className={`w-10 h-10 rounded-full border-2 border-white shadow-md ${
                onlineIds.has(agent.user.id) ? '' : 'opacity-60'
              }`}
            />
          ))}
        {plusMore > 0 && (
          <span className="w-10 h-10 flex items-center justify-center bg-gray-300 text-gray-600 text-sm font-semibold rounded-full border-2 border-white shadow-md">
            +{plusMore}
          </span>
        )}
      </div>
    </div>
  );
};

export default OnlineAgents;
