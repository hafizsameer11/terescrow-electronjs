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
    GetAllAgents: API_DOMAIN + '/admin/get-all-agent',
    GetRate: API_DOMAIN + '/admin/get-rate',
    GetTeam: API_DOMAIN + '/admin/get-team-members',
    GetAllUsers: API_DOMAIN + '/admin/get-all-users',
    GetCategories: API_DOMAIN + '/admin/get-all-categories',


    GetSubCategories: API_DOMAIN + '/admin/get-all-subcategories',
    GetBanner: API_DOMAIN + '/admin/get-all-banners',
    CreateBanner: API_DOMAIN + '/admin/create-banner',
    UpdateBanner: API_DOMAIN + '/admin/update-banner',
    DeleteBanner: API_DOMAIN + '/admin/delete-banner',


    CreateDepartment: API_DOMAIN + '/admin/create-department',
    UpdateDepartment: API_DOMAIN + '/admin/update-department',
    DeleteDepartment: API_DOMAIN + '/admin/delete-department',

    UpdateCustomer: API_DOMAIN + '/admin/update-customer',
    CreateAgent: API_DOMAIN + '/admin/create-agent',
    UpdateAgent: API_DOMAIN + '/admin/update-agent',

    CreateCategory: API_DOMAIN + '/admin/create-category',
    UpdateCategory: API_DOMAIN + '/admin/update-category',
    DeleteCategory: API_DOMAIN + '/admin/delete-category',
    GetSingleCategory: API_DOMAIN + '/admin/get-single-category',
    CreateSubCategory: API_DOMAIN + '/admin/create-subcategory',
    UpdateSubCategory: API_DOMAIN + '/admin/update-subcategory',

    CreateNotification: API_DOMAIN + '/admin/create-notification',
    UpdateNotification: API_DOMAIN + '/admin/update-notification',
    DeleteNotification: API_DOMAIN + '/admin/delete-notification',
    GetNotification: API_DOMAIN + '/admin/get-all-notifications',


  }
}
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInVzZXJuYW1lIjoiamFuZWRvZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDI2OTYyMywiZXhwIjoxNzM0MzU2MDIzfQ.kjF2qGx0vDzmqbIEJ5EZMgYMk-XJCT7iQ8Ib0a1imUw'
export { API_DOMAIN, API_ENDPOINT, token }
