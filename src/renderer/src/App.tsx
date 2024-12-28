import { useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

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
import TeamChat from './components/TeamChat';

function App(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  const renderProtectedRoutes = () => (
    <>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/chats" element={<Chat />} />
      <Route path="/rates" element={<RatesHistory />} />
      <Route path="/log" element={<LogPage />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/notifications" element={<Notifications />} />
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
      <Route path="/transactions" element={<Transaction />} />
    </>
  );

  return (
    <AuthProvider>
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
      </RootLayout>
    </AuthProvider>
  );
}

export default App;
