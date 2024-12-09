import { ComponentProps, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import NavItem from './SidebarComponent/NavItem';
import { FaUser, FaComments, FaChartPie, FaMoneyCheckAlt, FaPercent, FaBook, FaUserTie, FaUsers, FaBell, FaCog } from 'react-icons/fa';

// RootLayout Component
export const RootLayout = ({ children, className, ...props }: ComponentProps<'main'>) => {
  return (
    <main className={twMerge('flex flex-row h-screen', className)} {...props}>
      {children}
    </main>
  )
}

// Content Component
export const Content = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={twMerge('flex-1 overflow-auto', className)} {...props}>
        {children}
      </div>
    )
  }
)
Content.displayName = 'Content';






export const MainContent = ({ children, className, ...props }: ComponentProps<'div'>) => {
  return (
    <div className={twMerge('flex flex-row h-[100vh] px-[40px] py-[48px]', className)} {...props}>
      {children}
    </div>
  )
}
