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
  const [currentStatus, setCurrentStatus] = useState(() =>
    String(data?.chatStatus || '').toLowerCase() === 'successful' ? 'Successful' : 'Pending'
  )
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedImageUrls, setSelectedImageUrls] = useState<Set<string>>(new Set())
  const [showLogTransaction, setShowLogTransaction] = useState(() => {
    const status = String(data?.chatStatus || '').toLowerCase()
    const count = Number((data as { transactionsCount?: number } | undefined)?.transactionsCount ?? 0)
    return status === 'successful' && count === 0
  })
  const [logFormOpen, setLogFormOpen] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    backgroundColor: string
    textColor: string
    borderColor: string
  } | null>(() => {
    if (String(data?.chatStatus || '').toLowerCase() === 'successful') {
      return {
        message: 'This trade was completed ',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
      }
    }
    return null
  })


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
  }, [chatsData, data]);
  const setNotsification = () => {
    const status = String(
      chatsData?.data?.chatDetails?.status ||
        data?.chatStatus ||
        data?.chatDetails?.status ||
        ''
    ).toLowerCase()

    // Prefer real DB count — list `transactions` can be fake amount rows from rates/messages
    const detailsCount = (chatsData?.data as { transactionsCount?: number } | undefined)
      ?.transactionsCount
    const listCount = (data as { transactionsCount?: number } | undefined)?.transactionsCount
    const realTxFromDetails = (
      (chatsData?.data as { transactions?: Array<{ id?: number }> } | undefined)?.transactions || []
    ).filter((t) => Number(t.id) > 0).length
    const txCount =
      typeof detailsCount === 'number'
        ? detailsCount
        : typeof listCount === 'number'
          ? listCount
          : realTxFromDetails

    if (status === 'successful') {
      setNotification({
        message: 'This trade was completed ',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      })
      setCurrentStatus('Successful')
      // Older successful chats with no logged sale — allow admin backfill
      setShowLogTransaction(txCount === 0)
      if (txCount > 0) setLogFormOpen(false)
    } else if (status === 'declined') {
      setNotification({
        message: `This trade was declined `,
        backgroundColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
      })
      setCurrentStatus('declined')
      setShowLogTransaction(false)
      setLogFormOpen(false)
    } else if (status === 'unsucessful' || status === 'unsuccessful') {
      setNotification({
        message: 'Abandoned Trade.',
        backgroundColor: 'bg-gray-100',
        textColor: 'text-gray-500',
        borderColor: 'border-gray-500'
      })
      setCurrentStatus('Failed')
      setShowLogTransaction(false)
      setLogFormOpen(false)
    } else if (status === 'pending' || status === 'processing') {
      setNotification(null)
      setCurrentStatus('Pending')
      setShowLogTransaction(false)
      setLogFormOpen(false)
    }
  }

  const handleTransactionLogged = () => {
    setShowLogTransaction(false)
    setLogFormOpen(false)
    setCurrentStatus('Successful')
    setNotification({
      message: 'Transaction logged. This trade is now Successful.',
      backgroundColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
    })
  }

  const logDepartment =
    chatsData?.data?.chatDetails?.department || data?.department || null
  const logCategory =
    chatsData?.data?.chatDetails?.category || (data as { category?: any })?.category || null
  const canOpenLogForm = !!(logDepartment?.id && logCategory?.id)

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
    onClose()
    if (customerId != null) {
      onUserViewed?.(Number(customerId))
      navigate(`/transaction-details/${customerId}`)
    }
  }

  if (!data?.customer) {
    return (
      <div className="fixed top-4 right-4 bottom-4 w-full md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col z-[210] p-6">
        <p className="text-sm text-gray-600">Unable to open chat — customer data missing.</p>
        <button type="button" className="mt-4 text-green-700 underline" onClick={onClose}>
          Close
        </button>
      </div>
    )
  }

  const agentId = data?.agent?.id

  return (
    <div className="fixed top-4 right-4 bottom-4 w-full md:w-[35%] max-w-xl bg-white shadow-lg rounded-lg flex flex-col z-[210] overflow-hidden">
      <AdminChatHeader
        avatar={getImageUrl(data.customer?.profilePicture)}
        name={data.customer?.firstname || 'Customer'}
        username={data.customer?.username || ''}
        onClose={onClose}
        onUserViewed={handleCustomerHeaderClick}
      />

      <div className="px-4 py-2 border-b flex items-center justify-between gap-2 shrink-0">
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
        {showLogTransaction ? (
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800"
            onClick={() => {
              if (!canOpenLogForm) {
                alert('Loading chat details… try again in a second.')
                return
              }
              setLogFormOpen(true)
            }}
          >
            Log Transaction
          </button>
        ) : null}
        {selectMode && (
          <span className="text-xs text-gray-500">Click images to select, or Ctrl/Cmd+click anytime</span>
        )}
      </div>

      {showLogTransaction && (
        <div className="shrink-0 px-4 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-950">
          Successful chat with no logged sale (amount —). Click <strong>Log Transaction</strong> to backfill.
        </div>
      )}

      {/* Chat Messages */}
      {chatsData?.data ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {chatsData.data.messages.map((message) => {
            const text = typeof message.message === 'string' ? message.message.trim() : ''
            const imageUrl = message.image ? getImageUrl(message.image) : ''
            const isSelected = imageUrl ? selectedImageUrls.has(imageUrl) : false
            const isAgentMsg = agentId != null && message.senderId === agentId
            return (
            <div
              key={message.id}
              className={`flex ${isAgentMsg ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${isAgentMsg ? 'bg-green-100 text-gray-800' : 'bg-gray-100 text-gray-800'
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
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Loading chat…</div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div className="px-4 py-2 shrink-0">
          <NotificationBanner
            message={notification.message}
            backgroundColor={notification.backgroundColor}
            textColor={notification.textColor}
            borderColor={notification.borderColor}
          />
        </div>
      )}

      {logFormOpen && canOpenLogForm && (
        <NewTransaction
          type={logDepartment?.niche || 'giftCard'}
          department={logDepartment}
          category={logCategory}
          subcategories={['BTC']}
          chatId={id.toString()}
          onCompleted={handleTransactionLogged}
          onClose={() => setLogFormOpen(false)}
        />
      )}

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
