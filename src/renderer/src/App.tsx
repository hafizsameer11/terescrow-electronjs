// import Versions from './components/Versions'

import { Content, MainContent, RootLayout } from './components'
import Login from './components/Login'
// import MainContent from './components/RootLayout'
import { Sidebar } from './components/SidebarComponent/Sidebar'
import TopBar from './components/TopBar/TopBar'

function App(): JSX.Element {
  return (
    <>
      <RootLayout>
        <Sidebar />

        <Content className="">
          <TopBar />
          <MainContent className='bg-[#f6f7ff]'>

          </MainContent>
        </Content>
      </RootLayout>
    </>
  )
}

export default App
