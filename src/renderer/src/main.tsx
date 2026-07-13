import './assets/main.css'
import './assets/base.css'
import 'react-toastify/dist/ReactToastify.css'
// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <App />
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop />
    </HashRouter>
  </QueryClientProvider>
)
