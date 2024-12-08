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

// Sidebar Component
// export const Sidebar = ({ className, children, ...props }: ComponentProps<'aside'>) => {
//   const menuItems = [
//     { label: 'Dashboard', icon: <FaChartPie />, href: '#dashboard', id: 'dashboard' },
//     { label: 'Customers', icon: <FaUser />, href: '#customers', id: 'customers' },
//     { label: 'Chats', icon: <FaComments />, href: '#chats', id: 'chats' },
//     { label: 'Transactions', icon: <FaMoneyCheckAlt />, href: '#transactions', id: 'transactions' },
//     { label: 'Rates', icon: <FaPercent />, href: '#rates', id: 'rates' },
//     { label: 'Log', icon: <FaBook />, href: '#log', id: 'log' },
//     { label: 'Department', icon: <FaUserTie />, href: '#department', id: 'department' },
//     { label: 'Teams', icon: <FaUsers />, href: '#teams', id: 'teams' },
//     { label: 'Users', icon: <FaUser />, href: '#users', id: 'users' },
//     { label: 'Notifications', icon: <FaBell />, href: '#notifications', id: 'notifications' },
//     { label: 'Settings', icon: <FaCog />, href: '#settings', id: 'settings' },
//   ];

//   return (
//     <aside className="w-[250px] h-screen bg-gray-800 text-white">

//       <nav className="flex-1 px-2">
//         <ul className="space-y-2">
//           {menuItems.map((item) => (
//             <NavItem
//               key={item.id}
//               label={item.label}
//               icon={item.icon}
//               href={item.href}
//               // isActive={activeItem === item.id}
//               // onClick={() => setActiveItem(item.id)} // Update the active item on click
//             />
//           ))}
//         </ul>
//       </nav>
//     </aside>
//   );
// }
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


