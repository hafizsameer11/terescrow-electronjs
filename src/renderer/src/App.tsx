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

function App(): JSX.Element {

  const customer: Customer = {
    id: 1,
    name: "Qamardeen Abdulmalik",
    username: "Alucard",
    email: "johndoe@gmail.com",
    mobileNumber: "+23481235848",
    password: "********",
    gender: "Male",
    referralCode: null,
    country: "Nigeria",
    kycStatus: "Successful",
    tier: "Tier 2",
    dateJoined: "Nov 7, 2024 - 04:30 PM",
    lastPasswordReset: "Nov 7, 2024 - 04:30 PM",
    accountActivities: [
      { label: "Date Joined", date: "Nov 7, 2024 - 04:30 PM" },
      { label: "Password Reset", date: "Nov 7, 2024 - 04:30 PM" },
    ],
  };
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
              <Route path="/customers" element={<CustomerDetails customer={customer} />} />
              <Route path="/login" element={<Login />} />
            </Routes>

          </MainContent>
        </Content>
      </RootLayout>
    </>
  )
}

export default App
