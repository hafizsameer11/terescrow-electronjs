const API_DOMAIN = 'http://46.202.154.203:8000/api'
const API_ENDPOINT = {
  CUSTOMER: {
    AllCustomers: API_DOMAIN + '/admin/operations/get-all-customers',
    CustomerDetails: API_DOMAIN + '/admin/operations/get-customer-details',
    CustomerTransactions: API_DOMAIN + '/admin/operations/get-customer-transactions'
  },
  OPERATIONS: {
    Traansactions: API_DOMAIN + '/get-admin-transaction',
    Departments: API_DOMAIN + '/admin/operations/get-all-department',

    AgentByDepartment: API_DOMAIN + '/admin/operations/get-agent-by-department',
    GetAllAgents: API_DOMAIN + '/admin/operations/get-all-agent',
    GetRate: API_DOMAIN + '/admin/operations/get-rate',
    GetTeam: API_DOMAIN + '/admin/operations/get-team-members',
    GetAllUsers: API_DOMAIN + '/admin/operations/get-all-users',
    GetCategories: API_DOMAIN + '/admin/operations/get-all-categories',


    GetSubCategories: API_DOMAIN + '/admin/operations/get-all-subcategories',
    GetBanner: API_DOMAIN + '/admin/operations/get-all-banners',
    CreateBanner: API_DOMAIN + '/admin/operations/create-banner',
    UpdateBanner: API_DOMAIN + '/admin/operations/update-banner',
    DeleteBanner: API_DOMAIN + '/admin/operations/delete-banner',


    CreateDepartment: API_DOMAIN + '/admin/operations/create-department',
    UpdateDepartment: API_DOMAIN + '/admin/operations/update-department',
    DeleteDepartment: API_DOMAIN + '/admin/operations/delete-department',

    UpdateCustomer: API_DOMAIN + '/admin/operations/update-customer',
    CreateAgent: API_DOMAIN + '/admin/create-agent',
    UpdateAgent: API_DOMAIN + '/admin/operations/update-agent',

    CreateCategory: API_DOMAIN + '/admin/operations/create-category',
    UpdateCategory: API_DOMAIN + '/admin/operations/update-category',
    DeleteCategory: API_DOMAIN + '/admin/operations/delete-category',
    GetSingleCategory: API_DOMAIN + '/admin/operations/get-single-category',
    CreateSubCategory: API_DOMAIN + '/admin/operations/create-subcategory',
    UpdateSubCategory: API_DOMAIN + '/admin/operations/update-subcategory',

    CreateNotification: API_DOMAIN + '/admin/operations/create-notification',
    UpdateNotification: API_DOMAIN + '/admin/operations/update-notification',
    DeleteNotification: API_DOMAIN + '/admin/operations/delete-notification',
    GetNotification: API_DOMAIN + '/admin/operations/get-all-notifications',


  }
}
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJBZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDUyNzk2OCwiZXhwIjoxNzM0NjE0MzY4fQ.lDblM7-Mn45bd6nA-S7WHXD3BRjWr-RynDwQhtQ5IP4'
export { API_DOMAIN, API_ENDPOINT, token }
