export interface AdminTransactionStatsResponse {
  status: string; // The status of the API response, e.g., "success"
  message: string; // A message describing the response, e.g., "Stats found successfully"
  data: {
    totalTransactions: number; // Total number of transactions
    totaltransactionAmountSum: {
      _sum: {
        amount: number; // Sum of all transaction amounts
        amountNaira: number; // Sum of transaction amounts in Naira
      };
    };
    cryptoTransactions: {
      _count: number; // Total number of crypto transactions
      _sum: {
        amount: number | null; // Sum of crypto transaction amounts
        amountNaira: number | null; // Sum of crypto transaction amounts in Naira
      };
    };
    giftCardTransactions: {
      _count: number; // Total number of gift card transactions
      _sum: {
        amount: number; // Sum of gift card transaction amounts
        amountNaira: number; // Sum of gift card transaction amounts in Naira
      };
    };
  };
}
export interface AdminDashboardStatsResponse {
  status: string; // The status of the API response, e.g., "success"
  message: string; // A message describing the response, e.g., "Dashboard stats fetched successfully"
  data: {
    users: number; // Total number of users
    agents: number; // Total number of agents
    transactions: number; // Total number of transactions
    categories: number; // Total number of categories
    departments: number; // Total number of departments
    transactionAmountSum: {
      _sum: {
        amount: number; // Sum of transaction amounts
      };
    };
  };
}
export interface CustomerStatsResponse {
  status: string; // "success" or other status strings
  message: string; // A message describing the response
  data: {
    users: number; // Total number of users
    verifiedUser: number; // Total number of verified users
  };
}
export interface TeamStatsResponse {
  status: string; // The status of the API response, e.g., "success"
  message: string; // A message describing the response, e.g., "Stats found successfully"
  data: {
    totalUsers: number; // Total number of users
    totalAgents: number; // Total number of agents
    totalOnlineAgents: number; // Total number of online agents
    totalOfflineAgents: number; // Total number of offline agents
  };
}
