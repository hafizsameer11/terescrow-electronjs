import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

// Components
import { Content, MainContent, RootLayout } from './components'
import { Sidebar } from './components/SidebarComponent/Sidebar'
import TopBar from './components/TopBar/TopBar'

// Pages
import LoginPage from './pages/Login'
import Dashboard from './pages/Dashboard'
import CustomersPage from './pages/CustomersPage'
import Chat from './pages/Chat'
import RatesHistory from './pages/RatesHistory'
import LogPage from './pages/LogPage'
import Departments from './pages/Departments'
import Notifications from './pages/Notifications'
import TeamCommunication from './pages/TeamCommunication'
import AgentsPage from './pages/AgentsPage'
import CustomerDetails from './pages/CustomerDetail'
import TransactionDetails from './pages/TransactionDetails'
import DetailsDepartment from './components/DetailsDepartment'
import UsersPage from './pages/UsersPage'
import Teams from './pages/Teams'
import Settings from './pages/Settings'
import Transaction from './pages/Transaction'

function App(): JSX.Element {
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(false)
  
  return (
    <>
      <RootLayout>
        {!isLogin && location.pathname !== '/' && <Sidebar />}

        <Content className="">
          {!isLogin && location.pathname !== '/' && <TopBar />}
          <MainContent className="bg-[#f6f7ff]">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/chats" element={<Chat />} />
              <Route path="/rates" element={<RatesHistory />} />
              <Route path="/log" element={<LogPage />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/team-communication" element={<TeamCommunication />} />
              <Route path="/team" element={<LogPage />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/department-agent" element={<AgentsPage />} />
              <Route path="/department-details/:id" element={<AgentsPage />} />
              <Route path="/transaction-details/:customerId" element={<TransactionDetails />} />
              <Route path="/details-department/:id" element={<DetailsDepartment />} />
              <Route path="/usersall" element={<UsersPage />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/transactions" element={<Transaction />} />
            </Routes>
          </MainContent>
        </Content>
      </RootLayout>
    </>
  )
}

export default App
