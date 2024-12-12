import { useState } from 'react'

const TeamGroupList: React.FC<{
  pfp: string
  name: string
  username: string
  userId: string
  getCheckedId: Function
}> = ({ pfp, name, username, userId, getCheckedId }) => {
  const [isChecked, setIsChecked] = useState(false)

  const checkDataHandler = () => {
    setIsChecked(!isChecked)
    getCheckedId(userId, !isChecked)
  }

  return (
    <div className="flex items-center mb-6 p-3 border border-gray-400 rounded-lg">
      <img src={pfp} alt="Profile" className="w-14 h-14 rounded-full mr-5" />
      <div className="flex-1 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span>{name}</span>
            <span></span>
          </div>

          <span className="text-xs text-gray-400">{username}</span>
        </div>

        <input
          type="checkbox"
          checked={isChecked}
          onChange={checkDataHandler}
          className="w-5 h-5 text-green-500"
        />
      </div>
    </div>
  )
}

export default TeamGroupList
