const API_DOMAIN = 'https://46.202.154.203/api'
const API_BASE_URL = 'https://46.202.154.203'
const API_ENDPOINT = {
  CUSTOMER: {
    AllCustomers: API_DOMAIN + '/admin/operations/get-all-customers',
    CustomerDetails: API_DOMAIN + '/admin/operations/get-customer-details',
    CustomerTransactions: API_DOMAIN + '/admin/operations/get-customer-transactions'
  },
  OPERATIONS: {
    //kyc states
    UpdateKycStatus: API_DOMAIN + '/admin/operations/update-kycstatus',
    Traansactions: API_DOMAIN + '/admin/operations/get-all-transactions',

    ChangePassword: API_DOMAIN + '/auth/change-password',
    Departments: API_DOMAIN + '/admin/operations/get-all-department',

    AgentByDepartment: API_DOMAIN + '/admin/operations/get-agent-by-department',
    GetAllAgents: API_DOMAIN + '/admin/operations/get-all-agents',
    GetRate: API_DOMAIN + '/admin/operations/get-rate',
    GetTeam: API_DOMAIN + '/admin/operations/get-team-members',
    GetTeam2: API_DOMAIN + '/admin/operations/get-team-members-2',
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
    GetSingleDepartment: API_DOMAIN + '/admin/operations/get-department',

    UpdateCustomer: API_DOMAIN + '/admin/operations/update-customer',
    CreateAgent: API_DOMAIN + '/admin/create-agent',
    CreatTeamMemer: API_DOMAIN + '/admin/create-team-member',
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

    UserAccountActivity: API_DOMAIN + '/admin/operations/get-user-activity',
    //chat routes
    GetAllAgentToCusomterChats: API_DOMAIN + '/admin/operations/get-all-agent-to-customer-chats',
    GetSingleAgentToCusomterChat: API_DOMAIN + '/admin/operations/get-agent-customer-chats',
    GetAgentToTeamChats: API_DOMAIN + '/admin/operations/get-agent-team-chats',

    GetAgentCustomerChatDetails: API_DOMAIN + '/admin/operations/get-agent-customer-chatdetails',
    GetAgentTeamChatDetails: API_DOMAIN + '/admin/operations/get-agent-agent-chatdetails',
    GetAllTeamChats: API_DOMAIN + '/get-all-teams-chats',
    //Stats Routes
    GetChatStats: API_DOMAIN + '/admin/operations/get-chat-stats',
    GetTeamStats: API_DOMAIN + '/admin/operations/get-team-stats',
    GetDashboardStats: API_DOMAIN + '/admin/operations/get-dashboard-stats',
    GetCustomerStats: API_DOMAIN + '/admin/operations/get-customer-stats',
    GetTransactionStats: API_DOMAIN + '/admin/operations/get-transaction-stats',

    CreateChatGroup: API_DOMAIN + '/admin/create-chat-group',
    CreateNoteForCustomer: API_DOMAIN + '/agent/utilities/create-note',
    GetNotesForCustomer: API_DOMAIN + '/agent/utilities/get-notes',
    DeleteNote: API_DOMAIN + '/agent/utilities/delete-note',
    GetTeamNotifications: API_DOMAIN + '/agent/utilities/get-team-notifications',
    GetCustomerNotifications: API_DOMAIN + '/agent/utilities/get-customer-notifications',
    SendMessageToCustomer: API_DOMAIN + '/agent/send-to-customer',
    //get single user notification
    GetNotificationForUser: API_DOMAIN + '/agent/operations/get-notification-for-users',

    //role management
    CreateRole: API_DOMAIN + '/admin/operations/create-role',
    GetRoles: API_DOMAIN + '/admin/operations/get-roles',
    CreatePermissions: API_DOMAIN + '/admin/operations/create-permissions',
    GetRolesList: API_DOMAIN + '/admin/operations/get-roles-list',
    ChangeStatus: API_DOMAIN + '/admin/operations/change-status',
    UpdateSmtp: API_DOMAIN + '/admin/operations/create-smtp',
    GetSMTP: API_DOMAIN + '/admin/operations/get-smtp'
  },
  COMMON: {
    login: API_DOMAIN + '/agent/auth/login',
    GetTeamChatDetails: API_DOMAIN + '/get-team-chat-details',
    SendMessageToTeam: API_DOMAIN + '/send-message-to-team',
    MarkAllAsRead: API_DOMAIN + '/public/read-all-messages',
    GetActionSubacategories: API_DOMAIN + '/public/subcategories',
    GetUnreadMessageCount: API_DOMAIN + '/public/get-unread-count',
    MarkAllMessageRead: API_DOMAIN + '/public/mark-all-messages-read',
    // GetTeamChatDetails: API_DOMAIN + 'get-team-chat-details',
  },
  AGENT: {
    CreateCryptoTransaction: API_DOMAIN + '/agent/create-crypto-transaction',
    CreateCardTransaction: API_DOMAIN + '/agent/create-card-transaction',
    ChangeChatStatus: API_DOMAIN + '/agent/change-chat-status',
    GetPendingChats: API_DOMAIN + '/agent/utilities/get-all-default-chats',
    TakeOverDefaultChat: API_DOMAIN + '/agent/utilities/take-over-chat',
    CreateQuickReplies: API_DOMAIN + '/agent/utilities/create-quick-reply',
    GetQuickReplies: API_DOMAIN + '/agent/utilities/get-all-quick-replies',
    DeleteQuickReply: API_DOMAIN + '/agent/utilities/delete-quick-reply',
    UpdateQuickReploy: API_DOMAIN + '/agent/utilities/update-quick-reply',

  }
}
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJBZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNTMzNTAyNiwiZXhwIjoxNzM1NDIxNDI2fQ.uu1cSUMbThUKwTemMjHDtnbe4C9YyFZ4HK5vItWOyp0'
export { API_DOMAIN, API_ENDPOINT, token, API_BASE_URL }
