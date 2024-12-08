// import Versions from './components/Versions'

import { Content, RootLayout } from './components'
import Login from './components/Login'
import { Sidebar } from './components/SidebarComponent/Sidebar'

function App(): JSX.Element {
  return (
    <>
      <RootLayout>
        <Sidebar />
          {/* Sidebar content (e.g., navigation links) */}
        {/* </Sidebar> */}
        <Content className="p-4">Main content (e.g., dashboard, forms, etc.)</Content>
      </RootLayout>
    </>
  )
}

export default App
