import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Images } from '@renderer/constant/Image'
export const cn = (...args: ClassValue[]) => {
  return twMerge(clsx(...args))
}

export const chatData = [
  {
    id: '1',
    name: 'Alex Saltzman',
    username: '@alex_saltzman',
    pfp: Images.agent1,
    date: '10:00 AM',
    recentMessage: 'Dave: I have attended to the user',
    seen: false,
    online: true,
    group: false
  },
  {
    id: '2',
    name: 'Emily Johnson',
    username: '@emily_johnson',
    pfp: Images.agent2,
    date: '9:45 AM',
    recentMessage: 'Emily: Can you share the document?',
    seen: true,
    online: false,
    group: false
  },
  {
    id: '3',
    name: 'Project Team',
    username: '@project_team',
    pfp: Images.agent3,
    date: 'Yesterday',
    recentMessage: "Team: Let's finalize the report by EOD",
    seen: false,
    online: true,
    group: true
  },
  {
    id: '4',
    name: 'Michael Smith',
    username: '@michael_smith',
    pfp: Images.agent1,
    date: '11:15 AM',
    recentMessage: 'Michael: The meeting has been rescheduled',
    seen: true,
    online: true,
    group: false
  },
  {
    id: '5',
    name: 'Anna Lee',
    username: '@anna_lee',
    pfp: Images.agent2,
    date: '8:30 AM',
    recentMessage: "Anna: I'll send the file shortly",
    seen: false,
    online: false,
    group: false
  },
  {
    id: '6',
    name: 'Developers Group',
    username: '@dev_group',
    pfp: Images.agent3,
    date: 'Yesterday',
    recentMessage: 'Dev Group: Code review session at 3 PM',
    seen: true,
    online: true,
    group: true
  }
]

export default chatData
