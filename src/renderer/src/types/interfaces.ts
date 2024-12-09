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
  status: string; // e.g., "Successful" or "Declined"
  serviceType: string;
  transactionType: string;
  date: string;
  amount: string;
}




// export { StatsCardProps };
