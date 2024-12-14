const API_DOMAIN = 'http://localhost:8000/api';
const API_ENDPOINT = {
  CUSTOMER: {
    AllCustomers: API_DOMAIN + '/admin/get-all-customers',
    CustomerDetails: API_DOMAIN + '/admin/get-customer-details',
    CustomerTransactions: API_DOMAIN + '/admin/get-customer-transactions',
  },
 OPERATIONS:{
  Traansactions: API_DOMAIN + '/get-admin-transaction',
  Departments:API_DOMAIN + '/admin/get-all-department',
  AgentByDepartment:API_DOMAIN + '/admin/get-agent-by-department',
  GetRate:API_DOMAIN+'/admin/get-rate',
 }

}
const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInVzZXJuYW1lIjoiamFuZWRvZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDE3ODc4OSwiZXhwIjoxNzM0MjY1MTg5fQ.DAgBYdULelWf9gdAViKHGeW--o2vZkwsP4cDy0phXFw'
export { API_DOMAIN, API_ENDPOINT,token };
