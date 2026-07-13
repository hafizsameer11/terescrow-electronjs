import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

// Components
import { Content, MainContent, RootLayout } from './components';
import { Sidebar } from './components/SidebarComponent/Sidebar';
import TopBar from './components/TopBar/TopBar';

// Pages
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import Chat from './pages/Chat';
import RatesHistory from './pages/RatesHistory';
import LogPage from './pages/LogPage';
import Departments from './pages/Departments';
import Notifications from './pages/Notifications';
import TeamCommunication from './pages/TeamCommunication';
import AgentsPage from './pages/AgentsPage';
import CustomerDetails from './pages/CustomerDetail';
import TransactionDetails from './pages/TransactionDetails';
import DetailsDepartment from './components/DetailsDepartment';
import UsersPage from './pages/UsersPage';
import Teams from './pages/Teams';
import Settings from './pages/Settings';
import Transaction from './pages/Transaction';
import Services from './pages/Services';
import { AuthProvider } from './context/authContext';
import { DailyReportSessionProvider } from './context/dailyReportSessionContext';
import AgentClockInGate from './components/AgentClockInGate';
import TeamChat from './components/TeamChat';
import PendingChats from './pages/PendingChats';
import { SocketProvider } from './context/socketContext';
import SmtpPage from './pages/SmtpPage';
import Kyc from './pages/Kyc';
import QuickReplies from './pages/QuickReplies';
import WaysOfHearing from './pages/WaysOfHearing';
import PlaceholderPage from './pages/PlaceholderPage';
import UserBalancesPage from './pages/UserBalancesPage';
import MasterWalletPage from './pages/MasterWalletPage';
import DailyReportPage from './pages/DailyReportPage';
import TransactionTrackingPage from './pages/TransactionTrackingPage';
import ReferralsPage from './pages/ReferralsPage';
import SupportPage from './pages/SupportPage';
import ChangeNowSwapsPage from './pages/ChangeNowSwapsPage';
import ProfitTrackerPage from './pages/ProfitTrackerPage';
import CryptoJobsPage from './pages/CryptoJobsPage';
import DepositVerifyLogsPage from './pages/DepositVerifyLogsPage';

function App(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  const renderProtectedRoutes = () => (
    <>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/smtp" element={<SmtpPage />} />
      <Route path="/chats" element={<Chat />} />
      <Route path="/pending-chats" element={<PendingChats />} />
      <Route path="/quick-replies" element={<QuickReplies />} />
      <Route path="/rates" element={<RatesHistory />} />
      <Route path="/WaysOfHearing" element={<WaysOfHearing />} />
      <Route path="/log" element={<LogPage />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route
        path="/notifications/in-app/banners"
        element={
          <Navigate to="/notifications?tab=In-App Notification&state=Banner" replace />
        }
      />
      <Route path="/team" element={<LogPage />} />
      <Route path="/customers/:id" element={<CustomerDetails />} />
      <Route path="/department-agent" element={<AgentsPage />} />
      <Route path="/department-details/:id" element={<AgentsPage />} />
      <Route path="/transaction-details/:customerId" element={<TransactionDetails />} />
      <Route path="/details-department/:id" element={<DetailsDepartment />} />
      <Route path="/usersall" element={<UsersPage />} />
      <Route path="/services" element={<Services />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/vendors" element={<Settings />} />
      <Route path="/transactions" element={<Transaction />} />
      <Route path="/transactions/gift-card-buy" element={<Transaction defaultTransactionType="giftCards" />} />
      <Route path="/transactions/crypto" element={<Transaction defaultTransactionType="crypto" />} />
      <Route path="/transactions/bill-payments" element={<Transaction defaultTransactionType="billPayments" />} />
      <Route path="/transactions/naira" element={<Transaction defaultTransactionType="naira" />} />
      <Route path="/user-balances" element={<UserBalancesPage />} />
      <Route path="/transaction-tracking" element={<TransactionTrackingPage />} />
      <Route path="/profit-tracker" element={<ProfitTrackerPage />} />
      <Route path="/master-wallet" element={<MasterWalletPage />} />
      <Route path="/changenow-swaps" element={<ChangeNowSwapsPage />} />
      <Route path="/daily-report" element={<DailyReportPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/referrals" element={<ReferralsPage />} />
      <Route path="/crypto-jobs" element={<CryptoJobsPage />} />
      <Route path="/deposit-verify-logs" element={<DepositVerifyLogsPage />} />
      <Route path="/kyc" element={<Kyc />} />
    </>
  );

  return (
    <AuthProvider>
      <DailyReportSessionProvider>
      <SocketProvider>
        <RootLayout>
          {!isLogin && location.pathname !== '/' && <Sidebar />}
          <Content className="bg-[#f6f7ff]">
            {!isLogin && location.pathname !== '/' && <TopBar />}
            <MainContent className="bg-[#f6f7ff]">
              <Routes location={location}>
                {/* Public Route */}
                <Route path="/" element={<LoginPage />} />
                {/* Protected Routes */}
                {renderProtectedRoutes()}
              </Routes>
            </MainContent>
            {/* Modal */}
            {location.pathname === '/team-communication-modal' && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative">
                  <TeamChat onClose={() => navigate(-1)} />
                </div>
              </div>
            )}
          </Content>
          <AgentClockInGate />
        </RootLayout>
      </SocketProvider>
      </DailyReportSessionProvider>
    </AuthProvider>
  );
}

export default App;
