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
