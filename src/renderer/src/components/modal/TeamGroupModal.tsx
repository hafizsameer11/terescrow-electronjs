import { useState } from 'react'
import TeamGroupList from '../TeamGroupList'
import chatData from '@renderer/utils'
import { Icons } from '@renderer/constant/Icons'

const TeamGroupModal = ({ modalVisible, setModalVisible, onUserSelection }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [userIds, setUserIds] = useState<any>([])

  const getGroupUsers = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setUserIds((prevIds) => [...prevIds, { id: userId }])
    } else {
      setUserIds((prevIds) => prevIds.filter((user) => user.id !== userId))
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const filterDataHandler = () => {
    let filteredData = chatData
    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filteredData
  }

  if (!modalVisible) return null

  return (
    <div
      className="flex items-center justify-center"
      onClick={() => setModalVisible(modalVisible)}
    >
      <div
        className={`absolute right-20 max-w-4xl w-[30%] p-6 rounded-lg bg-white shadow-lg transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center relative">
          <h2 className="text-2xl font-semibold">New Group</h2>
          <button
            className="absolute right-0 text-lg"
            onClick={() => {
              setModalVisible(false)
              setUserIds([])
            }}
          >
            <button
              onClick={() => setModalVisible(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
            >
              &times;
            </button>
          </button>
        </div>

        <div className="flex items-center mt-5">
          <img alt="search" src={Icons.search} className="absolute w-5 h-5 ml-4" />
          <input
            type="text"
            className="w-full p-3 pl-12 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search team member"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Contact List */}
        <ul className="mt-5 overflow-y-auto max-h-96">
          {filterDataHandler().map((item) => (
            <TeamGroupList
              key={item.id}
              name={item.name}
              pfp={item.pfp}
              username={item.username}
              userId={item.id.toString()}
              getCheckedId={getGroupUsers}
            />
          ))}
        </ul>

        <button
          className="w-full p-3 mt-5 text-center text-white bg-green-700 rounded-lg hover:bg-green-800"
          onClick={() => onUserSelection(userIds)}
        >
          Create Group
        </button>
      </div>
    </div>
  )
}
export default TeamGroupModal
