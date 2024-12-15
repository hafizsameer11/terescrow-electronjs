import PermissionTable from '@renderer/components/PermissionTable'
import RoleManagement from '@renderer/components/RoleManagement'
import TeamFilterHeader from '@renderer/components/TeamFilterHeader'
import UserDetail from '@renderer/components/UserDetail'
import { Images } from '@renderer/constant/Image'
import { useState } from 'react'
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

interface Agent {
  fullName: string
  username: string
  role: string
  departments: string[]
  password: string
  profilePhoto?: string
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'role_management'>('profile')

  const [selectedRole, setSelectedRole] = useState<'Manager' | 'Agent' | 'Roles'>('Roles')
  const [searchValue, setSearchValue] = useState('')
  const [isEditClick, setIsEditClick] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent>()
  const [isUserViewed, setIsUserViewed] = useState(false)
  const [selectAgentActivityId, setSelectAgentActivityId] = useState(1)

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
    setSelectAgentActivityId(selectedUserUd)
  }

  // Filter the data dynamically based on filters
  const filteredData = sampleData.filter((member) => {
    // Match the `activeTab` to filter by status
    // Match the `selectedRole` to filter by role
    const matchesRole = selectedRole === 'Roles' || member.role === selectedRole

    // Match the `searchValue` to filter by name or username
    const matchesSearch =
      searchValue === '' ||
      member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      member.username.toLowerCase().includes(searchValue.toLowerCase())

    return matchesRole && matchesSearch
  })
  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex justify-between gap-9">
        <div>
          <h1 className="text-[40px] text-gray-800 font-normal">Settings</h1>

          {/* Toggle Buttons */}
          <div className="flex items-center mt-5">
            <div>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-tl-lg rounded-bl-lg font-medium ${
                  activeTab === 'profile'
                    ? 'text-white bg-green-700'
                    : 'text-gray-800 border border-gray-300'
                }`}
              >
                Profile
              </button>
            </div>
            <div>
              <button
                onClick={() => setActiveTab('role_management')}
                className={`px-4 py-2 rounded-tr-lg rounded-br-lg font-medium ${
                  activeTab === 'role_management'
                    ? 'text-white bg-green-700'
                    : 'text-gray-800 border border-gray-300'
                }`}
              >
                Role Management
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center flex-1">
          <button className="px-4 py-2 rounded-xl font-normal bg-red-600 text-white w-1/5">
            Logout
          </button>
        </div>
      </div>
      {activeTab === 'profile' ? (
        <UserDetail />
      ) : (
        <div>
          <PermissionTable />
          <TeamFilterHeader
            activeTab={undefined}
            selectedRole={selectedRole}
            searchValue={searchValue}
            onTabChange={() => undefined}
            onRoleChange={handleRoleChange}
            onSearchChange={handleSearchChange}
          />
          <RoleManagement
            data={filteredData}
            isTeam={true}
            isTeamCommunition={false}
            onUserViewed={changeView}
            onEditHanlder={(agentId) => handleEditClick(agentId)}
          />
        </div>
      )}
    </div>
  )
}

export default Settings
