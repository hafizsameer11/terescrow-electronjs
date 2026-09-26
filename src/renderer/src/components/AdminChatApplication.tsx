import React, { useState, useEffect, useRef } from 'react'
import ChatHeader from './ChatHeader'
import NotificationBanner from './NotificationBanner'
import NewTransaction from './NewTransaction'
import { AiOutlineSend, AiOutlinePicture } from 'react-icons/ai'; // Importing icons from react-icons
import { useQuery } from '@tanstack/react-query';
import { getAgentToCustomerChatDetails } from '@renderer/api/queries/admin.chat.queries';
import AdminChatHeader from './AdminChatHeader';
import { getImageUrl } from '@renderer/api/helper';
import { useAuth } from '@renderer/context/authContext';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { toastSuccess, toastError } from '@renderer/utils/toast';
interface Message {
  id: number
  text: string
  type: 'sent' | 'received'
  imageUrl?: string
}

interface ChatApplicationProps {
  onClose: () => void // Callback to close the chat
  id: number
  data?: any,
  isAdmin?: boolean
  onUserViewed?: (customerId: number) => void
}

const AdminChatApplication: React.FC<ChatApplicationProps> = ({ onClose, data, id, isAdmin, onUserViewed }) => {
  console.log("The Id")
  console.log(id);
  console.log(data);
  // const { , username, serviceType } = data;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'I want to trade $100.00 USA Amazon Credit receipt (25-49)',
      type: 'received'
    },
    {
      id: 2,
      text: 'Send details',
      type: 'sent'
    }
  ])
  const { token } = useAuth();
  const navigate = useNavigate();
  const [dataa, setData] = useState<any>(data)
  const [currentStatus, setCurrentStatus] = useState('Pending')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedImageUrls, setSelectedImageUrls] = useState<Set<string>>(new Set())
  const [notification, setNotification] = useState<{
    message: string
    backgroundColor: string
    textColor: string
    borderColor: string
  } | null>(null)


  const chatEndRef = useRef<HTMLDivElement>(null)
  //get chat details
  const { data: chatsData, isLoading: chatLoading, isError: chatIsError, error: chatError } = useQuery({
    queryKey: ['chatDetails', id],
    queryFn: () => getAgentToCustomerChatDetails({ token, chatId: id.toString() }),
    enabled: !!token,
  });
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  useEffect(() => {
    console.log('Chat details:', chatsData?.data);
    setNotsification();
  }, [chatsData]);
  const setNotsification = () => {
    if (data.chatStatus === 'successful') {
      setNotification({
        message: 'This trade was completed ',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      })
      setCurrentStatus('Successful')
    } else if (data.chatStatus === 'declined') {
      setNotification({
        message: `This trade was declined `,
        backgroundColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
      })
      setCurrentStatus('declined')
    } else if (data.chatStatus === 'pending') {
      setNotification({
        message: 'This trade was unsuccessful',
        backgroundColor: 'bg-pink-100',
        textColor: 'text-pink-800',
        borderColor: 'border-pink-300'
      })
      setCurrentStatus('pending')
    }
  }

  const openLightbox = (url: string) => {
    setLightboxUrl(url)
    setLightboxZoom(1)
  }

  const closeLightbox = () => {
    setLightboxUrl(null)
    setLightboxZoom(1)
  }

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImageUrls((prev) => {
      const next = new Set(prev)
      if (next.has(imageUrl)) next.delete(imageUrl)
      else next.add(imageUrl)
      return next
    })
  }

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    const multiSelect = selectMode || e.ctrlKey || e.metaKey
    if (multiSelect) {
      e.preventDefault()
      toggleImageSelection(imageUrl)
      return
    }
    openLightbox(imageUrl)
  }

  const clearImageSelection = () => {
    setSelectedImageUrls(new Set())
  }

  const copySelectedImages = async () => {
    const urls = Array.from(selectedImageUrls)
    if (urls.length === 0) return
    try {
      const payloads = await Promise.all(
        urls.map(async (url) => {
          const res = await fetch(url)
          const arrayBuffer = await res.arrayBuffer()
          return { bytes: new Uint8Array(arrayBuffer) }
        })
      )
      const result = await window.electron.ipcRenderer.invoke(
        'copy-images-from-buffers',
        payloads
      )
      if (!result?.ok) {
        toastError('Failed to copy selected images')
        return
      }
      toastSuccess(
        result.mode === 'files'
          ? `Copied ${result.count} images — paste with ⌘V / Ctrl+V (all files together)`
          : 'Image copied to clipboard'
      )
    } catch (err) {
      console.error('Failed to copy selected images:', err)
      toastError('Failed to copy selected images')
    }
  }

  const handleCustomerHeaderClick = () => {
    const customerId = data?.customer?.id
    const q =
      data?.customer?.username ||
      [data?.customer?.firstname, data?.customer?.lastname].filter(Boolean).join(' ') ||
      ''
    onClose()
    if (customerId != null) onUserViewed?.(Number(customerId))
    if (q) navigate(`/chats?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full m-4 md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col z-50">
      <AdminChatHeader
        avatar={getImageUrl(data.customer ?. profilePicture)}
        name={data.customer.firstname}
        username={data.customer.username}
        onClose={onClose}
        onUserViewed={handleCustomerHeaderClick}
      />

      <div className="px-4 py-2 border-b flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectMode((m) => {
              if (m) clearImageSelection()
              return !m
            })
          }}
          className={`text-sm px-3 py-1 rounded-md border ${
            selectMode
              ? 'bg-green-700 text-white border-green-800'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {selectMode ? 'Done selecting' : 'Select'}
        </button>
        {selectMode && (
          <span className="text-xs text-gray-500">Click images to select, or Ctrl/Cmd+click anytime</span>
        )}
      </div>

      {/* Chat Messages */}
      {chatsData?.data &&

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatsData.data.messages.map((message) => {
            const text = typeof message.message === 'string' ? message.message.trim() : ''
            const imageUrl = message.image ? getImageUrl(message.image) : ''
            const isSelected = imageUrl ? selectedImageUrls.has(imageUrl) : false
            return (
            <div
              key={message.id}
              className={`flex ${message.senderId === data.agent.id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${message.senderId === data.agent.id ? 'bg-green-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {message.image && (
                  <div className="relative mb-2">
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className={`rounded-lg w-full max-w-[150px] cursor-pointer ${
                        isSelected ? 'ring-2 ring-green-600 ring-offset-1' : ''
                      }`}
                      onClick={(e) => handleImageClick(e, imageUrl)}
                    />
                    {(selectMode || isSelected) && (
                      <button
                        type="button"
                        aria-label={isSelected ? 'Deselect image' : 'Select image'}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleImageSelection(imageUrl)
                        }}
                        className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-green-600 border-green-700 text-white'
                            : 'bg-white/90 border-gray-400'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </button>
                    )}
                  </div>
                )}
                {text
                  ? text
                  : message.image
                    ? <span className="text-sm text-gray-500 italic">Gift card image</span>
                    : <span className="text-sm text-gray-400 italic">(No message text)</span>}
              </div>
            </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

      }

      {/* Notification Banner */}
   





      {/* NewTrans Modal */}
      {/* {currentStatus === 'Successful' && <NewTransaction />} */}

      {selectedImageUrls.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[180] flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg bg-gray-900 text-white">
          <span className="text-sm">{selectedImageUrls.size} selected</span>
          <button
            type="button"
            onClick={copySelectedImages}
            className="text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700"
          >
            Copy {selectedImageUrls.size} image{selectedImageUrls.size === 1 ? '' : 's'}
          </button>
          <button
            type="button"
            onClick={clearImageSelection}
            className="text-sm px-3 py-1 rounded border border-gray-500 hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <IoClose className="w-8 h-8" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain select-none transition-transform duration-150"
            style={{ transform: `scale(${lightboxZoom})` }}
            onClick={(e) => {
              e.stopPropagation()
              setLightboxZoom((z) => (z === 1 ? 1.75 : 1))
            }}
          />
        </div>
      )}
    </div>
  )
}

export default AdminChatApplication
