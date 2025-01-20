export interface AdminTransactionStatsResponse {
  status: string;
  message: string;
  data: {
    totalTransactions: {
      count: number;
      change: 'positive' | 'negative';
      percentage: number;
    };
    totalTransactionAmountSum: {
      _sum: {
        amount: number | null;
        amountNaira: number | null;
      };
      change: 'positive' | 'negative';
      percentage: number;
    };
    cryptoTransactions: {
      _count: number;
      _sum: {
        amount: number | null;
        amountNaira: number | null;
      };
      change: 'positive' | 'negative';
      percentage: number;
    };
    giftCardTransactions: {
      _count: number;
      _sum: {
        amount: number | null;
        amountNaira: number | null;
      };
      change: 'positive' | 'negative';
      percentage: number;
    };
  };
}

export interface AdminDashboardStatsResponse {
  status: string
  message: string
  data: {
    totalUsers: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    totalTransactions: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    totalDepartments: {
      count: number
    }
    totalAgents: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    totalVerifiedUsers: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    totalInflow: {
      current: number // Current total inflow amount
      change: 'positive' | 'negative'
      percentage: number
    }
    totalOutflow: {
      current: number // Current total outflow amount
      change: 'positive' | 'negative'
      percentage: number
    }
    totalRevenue: {
      current: number // Current total revenue amount
      change: 'positive' | 'negative'
      percentage: number
    }
  }
}

export interface CustomerStatsResponse {
  status: string // "success" or other status strings
  message: string // A message describing the response
  data: {
    totalCustomers: {
      count: number // Total number of customers
      change: 'positive' | 'negative' // Change indicator
      percentage: number // Percentage of change
    }
    verifiedCustomers: {
      count: number // Total number of verified users
      change: 'positive' | 'negative'
      percentage: number
    }
    offlineNow: {
      count: number // Number of offline users
      change: 'neutral' // Static value
      percentage: number
    }
    totalCustomerChats: {
      count: number // Total number of customer chats
      change: 'positive' | 'negative'
      percentage: number
    }
  }
}

export interface TeamStatsResponse {
  status: string // The status of the API response, e.g., "success"
  message: string // A message describing the response, e.g., "Stats found successfully"
  data: {
    totalUsers: number // Total number of users
    totalAgents: number // Total number of agents
    totalOnlineAgents: number // Total number of online agents
    totalOfflineAgents: number // Total number of offline agents
  }
}
