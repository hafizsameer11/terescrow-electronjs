import { useEffect, useState } from 'react'
import { DUMMY_USERS } from '../utils/dummyUsers.js'
import UserStat from '@renderer/components/UserStat.js'
import ChatTable from '@renderer/components/ChatTable.js'
import TeamFilterHeader from '@renderer/components/TeamFilterHeader.js'
import AgentEditProfileModal from '@renderer/components/modal/AgentEditProfileModal.js'
import { Images } from '@renderer/constant/Image.js'
import ActivityHistory from '@renderer/components/ActivityHistory.js'
import TeamTable from '@renderer/components/TeamsTable.js'
import { getDepartments, getTeam, getTeam2 } from '@renderer/api/queries/adminqueries.js'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@renderer/context/authContext.js'
import { getTeamStats } from '@renderer/api/queries/admin.chat.queries.js'
import { Department } from '@renderer/api/queries/datainterfaces.js'
import AddAgentProfileModal from '@renderer/components/modal/AddAgentProfileModal.js'
import AddTeamMemberModal from '@renderer/components/modal/AddTeamMember.js'
import { useSocket } from '@renderer/context/socketContext.js'

interface Agent {
  fullName: string
  username: string
  role: string
  departments: string[]
  password: string
  profilePhoto?: string
}

const Teams = () => {
  const sampleData = [
    {
      id: 1,
      name: 'Qamardeen Abdulmalik',
      username: 'Alucard',
      status: 'Active', // Status will determine green or red dot
      role: 'Manager', // Either 'Manager' or 'Agent'
      dateAdded: 'Nov 7, 2024',
      department: ['Sell crypto', 'Buy crypto'],
      password: '12345',
      avatar: Images.agent1
    },
    {
      id: 2,
      name: 'Adam Sandler',
      username: 'Adam',
      status: 'Active',
      role: 'Agent',
      dateAdded: 'Nov 7, 2024',
      department: ['Sell crypto', 'Buy crypto'],
      password: '12345',
      avatar: Images.agent1
    },
    {
      id: 3,
      name: 'Sasha Sloan',
      username: 'Sasha',
      status: 'Inactive',
      role: 'Agent',
      dateAdded: 'Nov 7, 2024',
      department: ['Sell crypto', 'Buy crypto'],
      password: '12345',
      avatar: Images.agent1
    }
  ]

  const [activeTab, setActiveTab] = useState<'online' | 'offline' | 'All'>('online')
  const [selectedRole, setSelectedRole] = useState<'agent' | 'customer' | 'All'>('All')
  const [searchValue, setSearchValue] = useState('')
  const [isEditClick, setIsEditClick] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent>()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUserViewed, setIsUserViewed] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department[] | null>([])
  const [selectAgentActivityId, setSelectAgentActivityId] = useState(1);
  const { token } = useAuth();
  console.log(selectAgentActivityId);
  const handleTabChange = (tab: 'Active' | 'Deleted') => {
    setActiveTab(tab)
  }
  const { data: teamData, isLoading, isError, error } = useQuery({
    queryKey: ['teamData'],
    queryFn: () => getTeam2({ token }),
    enabled: !!token,
  });
  const { data: teamStats, isLoading: teamStatsloading } = useQuery({
    queryKey: ['teamStats'],
    queryFn: () => getTeamStats({ token }),
    enabled: !!token,
  });
  const { onlineAgents } = useSocket();
  const {
    data: departmentsData,
    isLoading: isDepartmetnLoading,
    isError: isDepartmentError,
    error: departmenterror
  } = useQuery({
    queryKey: ['departmentsData'],
    queryFn: () => getDepartments({ token }),
    enabled: !!token
  })
  useEffect(() => {
    if (departmentsData) {
      setSelectedDepartment(departmentsData.data)
    }
  }, [departmentsData])
  const handleRoleChange = (role: 'Manager' | 'Agent' | 'Roles') => {
    setSelectedRole(role)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  const handleEditClick = (agentId: number) => {
    const agent = sampleData.find((item) => item.id === agentId)
    if (agent) {
      setSelectedAgent({
        fullName: agent.name,
        username: agent.username,
        role: agent.role,
        departments: agent.department || [],
        password: agent.password,
        profilePhoto: agent.avatar || ''
      })
      setIsEditClick(true)
    }
  }

  const changeView = (selectedUserUd: number) => {
    setIsUserViewed(true)
    console.log("Selected User ID:", selectedUserUd);
    setSelectAgentActivityId(selectedUserUd)
  }

  const filteredData = teamData?.data.filter((member) => {
    const isOnline = onlineAgents.some((onlineAgent) => onlineAgent.userId == member.id);

    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'online'
          ? isOnline
          : !isOnline;

    const matchesSearch =
      searchValue === '' ||
      member.firstname?.toLowerCase().includes(searchValue.toLowerCase()) ||
      member.username.toLowerCase().includes(searchValue.toLowerCase());

    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    console.log("Filtered Data:", filteredData);
  }, [filteredData]);

  useEffect(() => {
    console.log("here is team data", teamData?.data);
    console.log("here is filtered data", filteredData);
    console.log("team stats", teamStats?.data)
  }, [teamData?.data]);
  console.log(isUserViewed)
  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        {/* Header */}
        <h1 className="text-[40px] text-gray-800">Teams</h1>

        <button className="bg-green-800 text-white py-2 px-3 rounded-lg"
          onClick={() => setIsAddModalOpen(true)}
        >Add team member</button>
      </div>

      {/* Stats Cards */}
      {
        !teamStatsloading && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <UserStat
              title="Total Team Members"
              value={teamStats?.data.totalAgents}
              change="15%"
              showStats={true}
            />
            <UserStat title="Online" value={teamStats?.data.totalOnlineAgents} />
            <UserStat title="Offline" value={teamStats?.data.totalOfflineAgents} />
          </div>

        )
      }

      {/* Filters */}

      {isUserViewed ? (
        <ActivityHistory userId={selectAgentActivityId} />
      ) : (
        <div>
          <TeamFilterHeader
            activeTab={activeTab}
            selectedRole={selectedRole}
            searchValue={searchValue}
            onTabChange={handleTabChange}
            onRoleChange={handleRoleChange}
            onSearchChange={handleSearchChange}
          />
          <TeamTable
            data={filteredData || []}
            // isTeam={true}
            // isTeamCommunition={false}
            onUserViewed={changeView}
            onEditHanlder={(agentId) => handleEditClick(agentId)}
          />
        </div>
      )}
      {isEditClick && selectedAgent && (
        <AgentEditProfileModal
          isOpen={isEditClick}
          onClose={() => setIsEditClick(false)}
          agentData={selectedAgent}
          onUpdate={(updatedData) => {
            console.log('Updated Data:', updatedData)
            setIsEditClick(false)
          }}
        />
      )}
      {
        isAddModalOpen && (
          <AddTeamMemberModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          // departmentData={selectedDepartment}
          />
        )
      }
    </div>
  )
}

export default Teams
