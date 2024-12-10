interface StatsCardProps {
  title: string;
  value: string;
  change: string; // e.g., +1% or -1%
  isPositive?: boolean; // Determines if the change is positive or negative
  action?: string; // Optional action label (e.g., "Edit" or "View")
}

export interface TransactionBase {
  id: number;
  name: string;
  username: string;
  status: string; // Successful, Failed, etc.
  serviceType: string; // Gift Card, Crypto, etc.
  transactionType: string; // Buy, Sell, etc.
  date: string;
  amount: string; // "$100 / NGN75,000" (can be split if needed)
}

export interface DetailedTransaction extends TransactionBase {
  dollarAmount: string;
  nairaAmount: string;
  giftCardType?: string;
  giftCardSubType?: string;
  quantity: number;
  code: string;
  transactionId: string;
  assignedAgent: string;
}


// interface TransactionsTableProps {
//   data: Transaction[];
// }

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
interface KYCDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  kycData: {
    surname: string;
    firstName: string;
    bvn: string;
    dateOfBirth: string;
    updateStatus: string;
  };
}
interface Note {
  id: number;
  content: string;
  date: string;
  savedBy: string;
  isHighlighted?: boolean;
}

interface NotesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onNewNote: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}
// export { StatsCardProps };
// export {Customer}
