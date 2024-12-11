import { useState } from "react"
import AddDepartmentModal from '@renderer/components/modal/AddDepartment';
const DetailsDepartment: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const customer = {
    id: 1,
    name: 'Qamardeen Abdulmalik',
    username: 'Alucard',
    email: 'johndoe@gmail.com',
    country: 'Nigeria',
    kycStatus: 'Successful',
    count: '10',
    dateCreated: 'Nov 7, 2024',
    lastPasswordReset: 'Nov 7, 2024 - 04:30 PM',
    accountActivities: [
      { label: 'Date Created', date: 'Nov 7, 2024 - 04:30 PM' },
      { label: 'New admin added', date: 'Nov 7, 2024 - 04:30 PM' }
    ]
  }

  return (
    <div className="min-h-screen w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[30px] font-semibold text-gray-800">Departments Details</h1>
        <button
          onClick={handleOpenModal}
          className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800"
        >
          Add new Department
        </button>
      </div>
      {/* Profile Section */}
      <div className="bg-[#147341] text-white rounded-lg p-5 flex items-end justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-bold">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold mb-4">{customer.name}</h1>
            <p className="text-[16px] text-white my-1">
              {customer.count} Agents</p>
           <p className="text-md my-0 text-white">Date Created: {customer.dateCreated}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mt-11">
        <h2 className="px-6 py-4 font-bold text-gray-700">Department Activities</h2>
        <table className="min-w-full text-left text-sm text-gray-600">
          <tbody>
            {customer.accountActivities.map((activity, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-4 text-gray-800 font-semibold">{activity.label}</td>
                <td className="px-6 py-4 text-gray-800 font-semibold text-right">
                  {activity.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={() => {}}
      />
    </div>
  )
}

export default DetailsDepartment
