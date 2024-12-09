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
              <Route path="/customers" element={<CustomerDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />

            </Routes>

          </MainContent>
        </Content>
      </RootLayout>
    </>
  )
}

export default App
