/**
 * Frontend dataset for Support chat. Replace with API later.
 */

export type SupportChatFilter = 'All' | 'Active' | 'Unread' | 'Closed';

export interface SupportChat {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageSender: string;
  lastMessageTime: string;
  unreadCount: number;
  status: SupportChatFilter;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

const MOCK_CHATS: SupportChat[] = [
  { id: '1', participantName: 'Adewale', lastMessage: 'Dave: I have attended to the user', lastMessageSender: 'Dave', lastMessageTime: '10:00 am', unreadCount: 3, status: 'All' },
  { id: '2', participantName: 'Alex Saltzman', lastMessage: 'Dave: I have attended to the user', lastMessageSender: 'Dave', lastMessageTime: '10:00 am', unreadCount: 3, status: 'All' },
  { id: '3', participantName: 'Qamardeen Malik', lastMessage: 'Dave: I have attended to the user', lastMessageSender: 'Dave', lastMessageTime: '10:00 am', unreadCount: 3, status: 'All' },
  { id: '4', participantName: 'Buy Crypto Group 2', lastMessage: 'Dave: I have attended to the user', lastMessageSender: 'Dave', lastMessageTime: '10:00 am', unreadCount: 3, status: 'All' },
  { id: '5', participantName: 'Adam Sandler', lastMessage: 'Dave: I have attended to the user', lastMessageSender: 'Dave', lastMessageTime: '10:00 am', unreadCount: 0, status: 'Active' },
];

const MOCK_MESSAGES: Record<string, SupportMessage[]> = {
  '5': [
    { id: 'm1', sender: 'user', text: 'I will like assistance on an issue regarding bill payments', time: '10:00 am' },
    { id: 'm2', sender: 'agent', text: 'Hello, how can we help you', time: '10:00 am' },
    { id: 'm3', sender: 'user', text: 'That is great', time: '10:00 am' },
  ],
};

export function getSupportChats(filter: SupportChatFilter, search?: string): SupportChat[] {
  let list = [...MOCK_CHATS];
  if (filter !== 'All') {
    list = list.filter((c) => c.status === filter || (filter === 'Active' && c.unreadCount === 0) || (filter === 'Unread' && c.unreadCount > 0));
  }
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((c) => c.participantName.toLowerCase().includes(q));
  }
  return list;
}

export function getSupportMessages(chatId: string): SupportMessage[] {
  return MOCK_MESSAGES[chatId] ? [...MOCK_MESSAGES[chatId]] : [];
}
