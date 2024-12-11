// import Versions from './components/Versions'

import { Route, Routes } from 'react-router-dom'
import { Content, MainContent, RootLayout } from './components'
// import Dashboard from './components/Dashboard/Dashboard'
import Login from './components/Login'
// import MainContent from './components/RootLayout'
import { Sidebar } from './components/SidebarComponent/Sidebar'
import TopBar from './components/TopBar/TopBar'
import CustomerDetails from './pages/CustomerDetail'
import Dashboard from './pages/Dashboard'
import TransactionDetails from './pages/TransactionDetails'
import CustomersPage from './pages/CustomersPage'
import ChatPage from './pages/ChatsPage'
import RatesHistory from './pages/RatesHistory'
import LogPage from './pages/LogPage'
import Departments from './pages/Departments'
import Notifications from './pages/Notifications'
import Chat from './pages/Chat'
import TeamCommunication from './pages/TeamCommunication'
import AgentsPage from './pages/AgentsPage'
import DetailsDepartment from './components/DetailsDepartment'

function App(): JSX.Element {


  return (
    <>
      <RootLayout>
        <Sidebar />

        <Content className="">
          <TopBar />
          <MainContent className='bg-[#f6f7ff]'>
            {/* <Dashboard /> */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/chats" element={<Chat />} />
              <Route path="/rates" element={<RatesHistory />} />
              <Route path="/log" element={<LogPage />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/team-communication" element={<TeamCommunication />} />
              <Route path="/team" element={<LogPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/department-agent" element={<AgentsPage />} />
              <Route path="/department-details/:id" element={<AgentsPage />} />
              <Route path="/transaction-details/:customerId" element={<TransactionDetails />} />
              <Route path='/details-department/:id' element={<DetailsDepartment />} />
            </Routes>

          </MainContent>
        </Content>
      </RootLayout>
    </>
  )
}

export default App
