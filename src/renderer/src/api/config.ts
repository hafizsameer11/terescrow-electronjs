const API_DOMAIN = 'https://backend.tercescrow.site/api'
const API_BASE_URL = 'https://backend.tercescrow.site'
/**
 * Base URL for relative wallet/coin icon paths from the API (e.g. wallet_symbols/btc.png).
 * Change this if static assets are served from a CDN or another host.
 */
const WALLET_ICON_BASE_URL = API_BASE_URL
/** Base URL for backend (without /api) — used by image helpers etc. */
/** Base for new admin API (backend doc: /api/admin). Same host as API_DOMAIN. */
const API_ADMIN_BASE = API_DOMAIN + '/admin'

const API_ENDPOINT = {
  /** New admin API endpoints (response envelope: { status, message, data }) */
  ADMIN: {
    transactions: API_ADMIN_BASE + '/transactions',
    transactionsByCustomer: (customerId: string | number) => API_ADMIN_BASE + '/transactions/by-customer/' + encodeURIComponent(String(customerId)),
    transactionStats: API_ADMIN_BASE + '/transactions/stats',
    userBalances: API_ADMIN_BASE + '/user-balances',
    masterWalletBalances: API_ADMIN_BASE + '/master-wallet/balances',
    masterWalletBalancesSummary: API_ADMIN_BASE + '/master-wallet/balances/summary',
    masterWalletAssets: API_ADMIN_BASE + '/master-wallet/assets',
    masterWalletTransactions: API_ADMIN_BASE + '/master-wallet/transactions',
    masterWalletSend: API_ADMIN_BASE + '/master-wallet/send',
    masterWalletSwap: API_ADMIN_BASE + '/master-wallet/swap',
    changenowCurrencies: API_ADMIN_BASE + '/changenow/currencies',
    changenowAvailablePairs: API_ADMIN_BASE + '/changenow/available-pairs',
    changenowMapInternal: API_ADMIN_BASE + '/changenow/map-internal',
    changenowTickerMapping: (walletCurrencyId: string | number) =>
      API_ADMIN_BASE + '/changenow/ticker-mappings/' + encodeURIComponent(String(walletCurrencyId)),
    changenowQuote: API_ADMIN_BASE + '/changenow/quote',
    changenowNetworkFee: API_ADMIN_BASE + '/changenow/network-fee',
    changenowPayoutAddresses: API_ADMIN_BASE + '/changenow/payout-addresses',
    changenowPayoutAddress: (id: string | number) =>
      API_ADMIN_BASE + '/changenow/payout-addresses/' + encodeURIComponent(String(id)),
    changenowSwaps: API_ADMIN_BASE + '/changenow/swaps',
    changenowSwap: (id: string | number) => API_ADMIN_BASE + '/changenow/swaps/' + encodeURIComponent(String(id)),
    changenowSwapRefresh: (id: string | number) =>
      API_ADMIN_BASE + '/changenow/swaps/' + encodeURIComponent(String(id)) + '/refresh',
    changenowPartnerExchanges: API_ADMIN_BASE + '/changenow/partner-exchanges',
    vendors: API_ADMIN_BASE + '/vendors',
    dailyReportShiftSettings: API_ADMIN_BASE + '/daily-report/shift-settings',
    dailyReportLogs: API_ADMIN_BASE + '/daily-report/logs',
    dailyReportReport: (reportId: string) => API_ADMIN_BASE + '/daily-report/reports/' + reportId,
    dailyReportSummary: API_ADMIN_BASE + '/daily-report/summary',
    dailyReportChartsAvgWorkHours: API_ADMIN_BASE + '/daily-report/charts/avg-work-hours',
    dailyReportChartsWorkHoursPerMonth: API_ADMIN_BASE + '/daily-report/charts/work-hours-per-month',
    dailyReportCheckIn: API_ADMIN_BASE + '/daily-report/check-in',
    dailyReportCheckOut: API_ADMIN_BASE + '/daily-report/check-out',
    transactionTracking: API_ADMIN_BASE + '/transaction-tracking',
    transactionTrackingSteps: (txId: string) => API_ADMIN_BASE + '/transaction-tracking/' + encodeURIComponent(txId) + '/steps',
    transactionTrackingDetails: (txId: string) => API_ADMIN_BASE + '/transaction-tracking/' + encodeURIComponent(txId) + '/details',
    /** Deposit → vendor: signs from user deposit key; persists ReceivedAssetDisbursement (not master-wallet send). */
    transactionTrackingSendToVendor: (txId: string) =>
      API_ADMIN_BASE + '/transaction-tracking/' + encodeURIComponent(txId) + '/send-to-vendor',
    /** Deposit → master: same signing path as vendor; destination = MasterWallet.address for normalized chain; disbursementType master_wallet. */
    transactionTrackingSendToMasterWallet: (txId: string) =>
      API_ADMIN_BASE + '/transaction-tracking/' + encodeURIComponent(txId) + '/send-to-master-wallet',
    transactionTrackingBulkSendToVendor: API_ADMIN_BASE + '/transaction-tracking/bulk-send-to-vendor',
    referralsSummary: API_ADMIN_BASE + '/referrals/summary',
    referrals: API_ADMIN_BASE + '/referrals',
    referralsByUser: (userId: string | number) => API_ADMIN_BASE + '/referrals/by-user/' + encodeURIComponent(String(userId)),
    referralsEarnSettings: API_ADMIN_BASE + '/referrals/earn-settings',
    referralsCommissionSettings: API_ADMIN_BASE + '/referrals/commission-settings',
    referralsUserOverride: (userId: string | number) =>
      API_ADMIN_BASE + '/referrals/user-override/' + encodeURIComponent(String(userId)),
    referralsUserOverrideByService: (userId: string | number, service: string) =>
      API_ADMIN_BASE +
      '/referrals/user-override/' +
      encodeURIComponent(String(userId)) +
      '/' +
      encodeURIComponent(service),
    cryptoRates: API_ADMIN_BASE + '/crypto/rates',
    cryptoRatesHistory: API_ADMIN_BASE + '/crypto/rates/history',
    cryptoRateById: (id: string | number) => API_ADMIN_BASE + '/crypto/rates/' + encodeURIComponent(String(id)),
    cryptoRatesByType: (type: string) => API_ADMIN_BASE + '/crypto/rates/' + encodeURIComponent(type),
    supportChats: API_ADMIN_BASE + '/support/chats',
    supportChatMessages: (chatId: string | number) => API_ADMIN_BASE + '/support/chats/' + encodeURIComponent(String(chatId)) + '/messages',
    supportChatUpdate: (chatId: string | number) => API_ADMIN_BASE + '/support/chats/' + encodeURIComponent(String(chatId)),
    customerFreeze: (customerId: string | number) => API_ADMIN_BASE + '/customers/' + encodeURIComponent(String(customerId)) + '/freeze',
    customerUnfreeze: (customerId: string | number) => API_ADMIN_BASE + '/customers/' + encodeURIComponent(String(customerId)) + '/unfreeze',
    customerBan: (customerId: string | number) => API_ADMIN_BASE + '/customers/' + encodeURIComponent(String(customerId)) + '/ban',
  },
  CUSTOMER: {
    AllCustomers: API_DOMAIN + '/admin/operations/get-all-customers',
    CustomerDetails: API_DOMAIN + '/admin/operations/get-customer-details',
    CustomerTransactions: API_DOMAIN + '/admin/operations/get-customer-transactions',
    GetKycRequests: API_DOMAIN + '/admin/operations/kyc-users',
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
    GetSMTP: API_DOMAIN + '/admin/operations/get-smtp',
    GetAllWaysOfHearing: API_DOMAIN + '/admin/operations/get-all-ways-of-hearing',
    CreateWaysOfHearing: API_DOMAIN + '/admin/operations/create-ways-of-hearing',
    UpdateWaysOfHearing: API_DOMAIN + '/admin/operations/update-ways-of-hearing',

  },
  COMMON: {
    login: API_DOMAIN + '/agent/auth/login',
    GetTeamChatDetails: API_DOMAIN + '/get-team-chat-details',
    SendMessageToTeam: API_DOMAIN + '/send-message-to-team',
    MarkAllAsRead: API_DOMAIN + '/public/read-all-messages',
    GetActionSubacategories: API_DOMAIN + '/public/subcategories',
    GetUnreadMessageCount: API_DOMAIN + '/public/get-unread-count',
    MarkAllMessageRead: API_DOMAIN + '/public/mark-all-messages-read'
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
    UpdateQuickReploy: API_DOMAIN + '/agent/utilities/update-quick-reply'
  }
}
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJBZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNTMzNTAyNiwiZXhwIjoxNzM1NDIxNDI2fQ.uu1cSUMbThUKwTemMjHDtnbe4C9YyFZ4HK5vItWOyp0'
export { API_DOMAIN, API_ADMIN_BASE, API_ENDPOINT, token, API_BASE_URL, WALLET_ICON_BASE_URL }
