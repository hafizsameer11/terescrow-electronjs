import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPermission, getRoles } from '@renderer/api/queries/rolemanagement';
import { CreatePermissionsRequest, Permission, Role } from '@renderer/api/queries/datainterfaces';
import { useAuth } from '@renderer/context/authContext';

const PermissionTable = () => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [permissionsState, setPermissionsState] = useState<Record<string, Record<string, Permission>>>({});
  const { token } = useAuth();
  const querCLient = useQueryClient();
  // Fetch roles from the backend
  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles(token),
    staleTime: Infinity,
  });

  // Prepopulate permissionsState from the API response
  useEffect(() => {
    if (rolesData?.data?.length) {
      const initialState: Record<string, Record<string, Permission>> = {};
      rolesData.data.forEach((role: Role) => {
        initialState[role.name] = {};
        role.permissions.forEach((perm: Permission) => {
          initialState[role.name][perm.moduleName] = { ...perm };
        });
      });
      setPermissionsState(initialState);
    }
  }, [rolesData]);

  const { mutate: updatePermissions } = useMutation({
    mutationFn: (data: CreatePermissionsRequest) => createPermission(token, data),
    onSuccess: () => {
      alert('Permissions updated successfully');
      querCLient.invalidateQueries({ queryKey: ['roles'] });

    },
    onError: () => alert('Failed to update permissions.'),
  });

  const initialPermissions: string[] = ['Customer', 'Chats', 'Transactions', 'Rates', 'Log', 'Department', 'banners', 'kyc', 'WaysOfHearing'];

  const roles = rolesData?.data.map((role: Role) => role.name) || [];

  const toggleRow = (row: string) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [row]: !prevState[row],
    }));
  };

  const handleCheckboxChange = (
    roleName: string,
    moduleName: string,
    permissionType: keyof Permission
  ) => {
    setPermissionsState((prevState) => {
      const updatedRolePermissions = {
        ...prevState[roleName],
        [moduleName]: {
          ...prevState[roleName][moduleName],
          [permissionType]: !prevState[roleName][moduleName][permissionType],
        },
      };

      return {
        ...prevState,
        [roleName]: updatedRolePermissions,
      };
    });
  };

  const handleRowUpdate = (roleName: string, moduleName: string) => {
    const updatedPermission = permissionsState[roleName][moduleName];
    updatePermissions({
      roleName,
      permissions: [updatedPermission],
    });
  };

  if (isRolesLoading) return <p>Loading...</p>;

  return (
    <div className="w-full mb-5">
      <table className="w-full border-collapse bg-white rounded-lg">
        <thead>
          <tr>
            <th className="p-2 text-left flex items-center relative">
              <input
                type="text"
                placeholder="Permission Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 bg-gray-200 rounded-full"
              />
            </th>
            {roles.map((role) => (
              <th key={role} className="p-2 text-center font-medium">
                {role}
              </th>
            ))}
            <th className="p-2 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialPermissions.map((moduleName) => (
            <React.Fragment key={moduleName}>
              <tr className={`bg-green-100 border-b`}>
                <td
                  className="p-2 font-bold cursor-pointer"
                  onClick={() => toggleRow(moduleName)}
                >
                  {moduleName}
                </td>
                {roles.map((role) => (
                  <td key={`${role}-${moduleName}-see`} className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={permissionsState?.[role]?.[moduleName]?.canSee ?? false}

                      onChange={() =>
                        handleCheckboxChange(role, moduleName, 'canSee')
                      }
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      roles.forEach((role) => handleRowUpdate(role, moduleName))
                    }
                  >
                    Update
                  </button>
                </td>
              </tr>
              {expandedRows[moduleName] && (
                <>
                  <tr>
                    <td className="p-2">Create</td>
                    {roles.map((role) => (
                      <td key={`${role}-${moduleName}-create`} className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={permissionsState?.[role]?.[moduleName]?.canCreate ?? false}

                          onChange={() =>
                            handleCheckboxChange(role, moduleName, 'canCreate')
                          }
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2">Update</td>
                    {roles.map((role) => (
                      <td key={`${role}-${moduleName}-update`} className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={permissionsState?.[role]?.[moduleName]?.canUpdate ?? false}

                          onChange={() =>
                            handleCheckboxChange(role, moduleName, 'canUpdate')
                          }
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2">Delete</td>
                    {roles.map((role) => (
                      <td key={`${role}-${moduleName}-delete`} className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={permissionsState?.[role]?.[moduleName]?.canDelete ?? false}

                          onChange={() =>
                            handleCheckboxChange(role, moduleName, 'canDelete')
                          }
                        />
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionTable;
