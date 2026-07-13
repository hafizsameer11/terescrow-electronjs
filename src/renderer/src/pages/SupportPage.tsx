import React, { useState, useEffect, useRef } from 'react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import { FiSearch } from 'react-icons/fi';
import { FaPaperPlane } from 'react-icons/fa';
import { IoImageOutline } from 'react-icons/io5';
import { useAuth } from '@renderer/context/authContext';
import {
  getSupportChats,
  getSupportChatMessages,
  sendSupportChatMessage,
  type SupportChatFilter,
} from '@renderer/api/admin/support';

function formatIsoToTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

interface SupportChat {
  id: string | number;
  participantName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  [key: string]: any;
}

interface SupportMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

const SupportPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [chatFilter, setChatFilter] = useState<SupportChatFilter>('All');
  const [searchChat, setSearchChat] = useState('');
  const debouncedSearchChat = useDebouncedValue(searchChat.trim(), 400);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const { data: chatsData } = useQuery({
    queryKey: ['admin-support-chats', token, chatFilter, debouncedSearchChat],
    queryFn: () =>
      getSupportChats(token!, { filter: chatFilter, search: debouncedSearchChat || undefined }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
  const chats: SupportChat[] = (chatsData?.chats ?? []).map((c: any) => ({
    id: c.id,
    participantName: c.participantName ?? c.participant_name ?? c.userName ?? 'User',
    lastMessage: c.lastMessage ?? c.last_message ?? '',
    lastMessageTime: formatIsoToTime(c.lastMessageTime ?? c.last_message_time),
    unreadCount: c.unreadCount ?? c.unread_count ?? 0,
  }));

  const { data: messagesRaw = [] } = useQuery({
    queryKey: ['admin-support-messages', token, selectedChat?.id],
    queryFn: () => getSupportChatMessages(token!, selectedChat!.id),
    enabled: !!token && !!selectedChat,
  });
  const messages: SupportMessage[] = messagesRaw.map((m: any) => ({
    id: String(m.id ?? m._id ?? Math.random()),
    sender: m.sender === 'user' ? 'user' : 'agent',
    text: m.text ?? m.content ?? '',
    time: formatIsoToTime(m.time ?? m.createdAt ?? m.created_at),
  }));

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      sendSupportChatMessage(token!, selectedChat!.id, { text }, imageFile || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-messages', token, selectedChat?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-chats'] });
    },
  });

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedChat) return;
    sendMutation.mutate(inputText.trim(), {
      onSuccess: () => {
        setInputText('');
        setImageFile(null);
      },
    });
  };

  const handleCloseChat = () => setSelectedChat(null);

  return (
    <div className="p-6 w-full">
      <div className="h-[calc(100vh-10rem)] flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Left panel */}
      <div className="w-80 flex flex-col border-r border-gray-200">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800 mb-3">Support</h1>
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchChat}
              onChange={(e) => setSearchChat(e.target.value)}
              placeholder="Search Chat"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex border-b border-gray-200">
          {(['All', 'Active', 'Unread', 'Closed'] as SupportChatFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setChatFilter(filter)}
              className={`flex-1 py-2 text-sm font-medium ${chatFilter === filter ? 'bg-[#147341] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => setSelectedChat(chat)}
              className={`w-full flex items-start gap-3 p-3 text-left border-b border-gray-100 hover:bg-gray-50 ${
                selectedChat?.id === chat.id ? 'bg-green-50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium shrink-0">
                {chat.participantName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{chat.participantName}</p>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                {chat.unreadCount > 0 && (
                  <span className="mt-1 w-5 h-5 rounded-full bg-[#147341] text-white text-xs flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {selectedChat.participantName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedChat.participantName}</p>
                  <p className="text-sm text-green-600">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseChat}
                  className="px-3 py-1.5 bg-[#147341] text-white text-sm font-medium rounded-lg hover:bg-[#0d5a2e]"
                >
                  Close Chat
                </button>
                <button
                  type="button"
                  onClick={handleCloseChat}
                  className="p-1 text-gray-500 hover:text-gray-800 text-xl"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              <p className="text-center text-sm text-gray-500">Today</p>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[75%] ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm shrink-0">
                      {msg.sender === 'user' ? selectedChat.participantName.charAt(0) : 'A'}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        msg.sender === 'agent'
                          ? 'bg-[#147341] text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-80">{msg.time}</span>
                        {msg.sender === 'agent' && (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex items-center gap-2 bg-white shrink-0">
              <label className="cursor-pointer text-gray-500 hover:text-gray-700 p-1">
                <IoImageOutline className="text-2xl" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <input
                type="text"
                placeholder="Type Anything"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="p-2 bg-[#147341] text-white rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
                aria-label="Send"
              >
                <FaPaperPlane className="text-lg" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            <p>Select a chat to start</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default SupportPage;
