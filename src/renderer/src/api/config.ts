const API_DOMAIN = 'http://localhost:8000/api'
const API_ENDPOINT = {
  CUSTOMER: {
    AllCustomers: API_DOMAIN + '/admin/get-all-customers',
    CustomerDetails: API_DOMAIN + '/admin/get-customer-details',
    CustomerTransactions: API_DOMAIN + '/admin/get-customer-transactions'
  },
  OPERATIONS: {
    Traansactions: API_DOMAIN + '/get-admin-transaction',
    Departments: API_DOMAIN + '/admin/get-all-department',
    AgentByDepartment: API_DOMAIN + '/admin/get-agent-by-department',
    GetRate: API_DOMAIN + '/admin/get-rate',
    GetTeam: API_DOMAIN + '/admin/get-team-members',
    GetCategories: API_DOMAIN + '/admin/get-all-categories',
    GetSubCategories: API_DOMAIN + '/admin/get-all-subcategories',
    GetAllUsers: API_DOMAIN + '/admin/get-all-users',
    GetBanner: API_DOMAIN + '/admin/get-all-banners',
    CreateBanner: API_DOMAIN + '/admin/create-banner',
    UpdateBanner: API_DOMAIN + '/admin/update-banner',
    DeleteBanner: API_DOMAIN + '/admin/delete-banner',
    CreateDepartment: API_DOMAIN + '/admin/create-department',
    UpdateDepartment: API_DOMAIN + '/admin/update-department',
    DeleteDepartment: API_DOMAIN + '/admin/delete-department',

    CreateAgent: API_DOMAIN + '/admin/create-agent',
    UpdateAgent: API_DOMAIN + '/admin/update-agent',

    CreateCategory: API_DOMAIN + '/admin/create-category',
    UpdateCategory: API_DOMAIN + '/admin/update-category',
    DeleteCategory: API_DOMAIN + '/admin/delete-category',
    CreateSubCategory: API_DOMAIN + '/admin/create-subcategory',
    UpdateSubCategory: API_DOMAIN + '/admin/update-subcategory'
  }
}
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInVzZXJuYW1lIjoiamFuZWRvZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDIwNzM5OCwiZXhwIjoxNzM0MjkzNzk4fQ.gaZjl_wUwLUSeyqlmi4rB0KOrgogWieoTACLjF_rLDo'
export { API_DOMAIN, API_ENDPOINT, token }
