import { Icons } from '@renderer/constant/Icons'
import React, { useState } from 'react'

const PermissionTable = () => {
  const [expandedRows, setExpandedRows] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  const toggleRow = (row) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [row]: !prevState[row]
    }))
  }

  const permissions = [
    { name: 'Customer', children: ['Create', 'Update', 'View', 'Delete'] },
    { name: 'Chat', children: ['Create', 'Update', 'View', 'Delete'] },
    { name: 'Transactions', children: ['Create', 'Update', 'View', 'Delete'] },
    { name: 'Rates', children: ['Create', 'Update', 'View', 'Delete'] },
    { name: 'Log', children: ['Create', 'Update', 'View', 'Delete'] },
    { name: 'Department', children: ['Create', 'Update', 'View', 'Delete'] },
    { name: 'Agents', children: ['Create', 'Update', 'View', 'Delete'] }
  ]

  const roles = ['Owner', 'Agent', 'Manager', 'Accountant']

  // Filter permissions based on search input
  const filteredPermissions = permissions.filter((permission) =>
    permission.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full mb-5">
      <table className="w-full border-collapse bg-white rounded-lg">
        <thead>
          <tr className="">
            <th className="p-2 text-left flex items-center relative">
              <div className="absolute w-5 left-4">
                <img src={Icons.search} alt="" />
              </div>
              <input
                type="text"
                placeholder="Permission Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-8 pe-2 py-1 bg-gray-200 rounded-full"
              />
            </th>
            {roles.map((role) => (
              <th key={role} className="p-2 text-center font-medium">
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredPermissions.map((permission, index) => (
            <React.Fragment key={index}>
              {/* Parent Row */}
              <tr className="bg-green-100 border-b">
                <td
                  className="p-2 flex flex-row-reverse justify-between items-center cursor-pointer"
                  onClick={() => toggleRow(permission.name)}
                >
                  <span
                    className={`mr-2 transition-transform w-5 ${
                      expandedRows[permission.name] ? 'rotate-90' : ''
                    }`}
                  >
                    <img src={Icons.arrowDown} alt="" />
                  </span>
                  {permission.name}
                </td>
                {roles.map((role) => (
                  <td key={role} className="p-2 text-center">
                    <input type="checkbox" defaultChecked />
                  </td>
                ))}
              </tr>

              {/* Expanded Rows */}
              {expandedRows[permission.name] &&
                permission.children.length > 0 &&
                permission.children.map((child, childIndex) => (
                  <tr key={childIndex} className="bg-white border-b">
                    <td className="p-2 pl-2 ">{child}</td>
                    {roles.map((role) => (
                      <td key={role} className="p-2 text-center">
                        <input type="checkbox" defaultChecked />
                      </td>
                    ))}
                  </tr>
                ))}
            </React.Fragment>
          ))}
          {/* No Results Found */}
          {filteredPermissions.length === 0 && (
            <tr>
              <td colSpan={roles.length + 1} className="p-2 text-center">
                No permissions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default PermissionTable
