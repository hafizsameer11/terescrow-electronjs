interface StatsCardProps {
  title: string;
  value: string;
  change: string; // e.g., +1% or -1%
  isPositive?: boolean; // Determines if the change is positive or negative
  action?: string; // Optional action label (e.g., "Edit" or "View")
}

interface Transaction {
  id: number;
  name: string;
  username: string;
  status: string;
  serviceType: string;
  transactionType: string;
  date: string;
  amount: string;
}

interface TransactionsTableProps {
  data: Transaction[];
}

interface AccountActivity {
  label: string;
  date: string;
}

interface Customer {
  id: number;
  name: string;
  username: string;
  email: string;
  mobileNumber: string;
  password: string;
  gender: string;
  referralCode: string | null;
  country: string;
  kycStatus: "Successful" | "Pending" | "Failed";
  tier: string;
  dateJoined: string;
  lastPasswordReset: string;
  accountActivities: AccountActivity[];
}


// export { StatsCardProps };
