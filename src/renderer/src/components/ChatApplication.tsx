import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import NotificationBanner from './NotificationBanner';
// import NotificationBanner from './NotificationBanner';
// import ChatHeader from './ChatHeader';

interface Message {
    id: number;
    text: string;
    type: 'sent' | 'received';
    imageUrl?: string;
}

interface ChatApplicationProps {
    onClose: () => void; // Callback to close the chat
    id: number;
    data?: any;
}

const ChatApplication: React.FC<ChatApplicationProps> = ({ onClose ,data}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'I want to trade $100.00 USA Amazon Credit receipt (25-49)',
            type: 'received',
        },
        {
            id: 2,
            text: 'Send details',
            type: 'sent',
        },
    ]);

    const [inputValue, setInputValue] = useState('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [showBanner, setShowBanner] = useState(true);
    const [notification, setNotification] = useState<{
        message: string;
        backgroundColor: string;
        textColor: string;
        borderColor: string;
    } | null>(null);

    const [isInputVisible, setIsInputVisible] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const image = event.target.files && event.target.files[0];
        if (!image) return;

        const reader = new FileReader();

        // Convert the image to Base64
        reader.onload = () => {
            const base64Image = reader.result as string;

            // Add the uploaded image as a new message
            const newMessage: Message = {
                id: messages.length + 1,
                text: '', // No text for image-only message
                type: 'sent',
                imageUrl: base64Image, // Use Base64 URL
            };

            setMessages((prev) => [...prev, newMessage]);

            // Simulate a dummy response
            setTimeout(() => {
                const dummyResponse: Message = {
                    id: messages.length + 2,
                    text: 'Nice image! Let me check.',
                    type: 'received',
                };
                setMessages((prev) => [...prev, dummyResponse]);
            }, 1000);
        };

        reader.readAsDataURL(image);
    };

    // Handle sending a message
    const sendMessage = () => {
        if (!inputValue.trim() && !uploadedImage) return;

        const newMessage: Message = {
            id: messages.length + 1,
            text: inputValue.trim(),
            type: 'sent',
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');

        // Simulate a dummy response
        setTimeout(() => {
            const dummyResponse: Message = {
                id: messages.length + 2,
                text: 'Got it! Let me check.',
                type: 'received',
            };
            setMessages((prev) => [...prev, dummyResponse]);
        }, 1000);
    };

    // Hide the initial banner after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowBanner(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Handle status change from ChatHeader
    const handleStatusChange = (status: string, reason?: string) => {
        setIsInputVisible(false);

        if (status === 'Successful') {
            setNotification({
                message: 'This trade was completed by you.',
                backgroundColor: 'bg-green-100',
                textColor: 'text-green-800',
                borderColor: 'border-green-300',
            });
        } else if (status === 'Failed' && reason) {
            setNotification({
                message: `This trade was declined by you with reason "${reason}"`,
                backgroundColor: 'bg-red-100',
                textColor: 'text-red-800',
                borderColor: 'border-red-300',
            });
        } else if (status === 'Unsuccessful') {
            setNotification({
                message: 'This trade was unsuccessful',
                backgroundColor: 'bg-pink-100',
                textColor: 'text-pink-800',
                borderColor: 'border-pink-300',
            });
        }
    };

    const onSendRate = (rate: string, amountDollar: string, amountNaira: string) => {
        const rateMessage = `Rate ${rate} Amount - Dollar: ${amountDollar} Amount - Naira: ${amountNaira}`;

        setMessages((prevMessages) => [
            ...prevMessages,
            { id: prevMessages.length + 1, text: rateMessage, type: 'sent' },
        ]);
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full m-4 md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col z-50">
            <ChatHeader
                avatar="https://via.placeholder.com/40"
                name="Qamardeen Malik"
                username="Alucard"
                onClose={onClose}
                onSendRate={onSendRate}
                onLogChat={() => console.log('Log Chat')}
                onStatusChange={handleStatusChange}
            />

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                        <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                                message.type === 'sent' ? 'bg-green-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {message.imageUrl && (
                                <img
                                    src={message.imageUrl}
                                    alt="Uploaded"
                                    className="mb-2 rounded-lg w-full max-w-[150px]"
                                />
                            )}
                            {message.text && <p className="text-sm">{message.text}</p>}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Notification Banner */}
            {notification && (
                <div className="px-4 py-2">
                    <NotificationBanner
                        message={notification.message}
                        backgroundColor={notification.backgroundColor}
                        textColor={notification.textColor}
                        borderColor={notification.borderColor}
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        }
                    />
                </div>
            )}

            {/* Input Section */}
            {isInputVisible && (
                <div className="flex items-center p-4 border-t border-gray-200">
                    <label htmlFor="file-upload" className="cursor-pointer mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6 text-gray-500 hover:text-gray-700"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5v-9m4.5 4.5h-9" />
                        </svg>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </label>

                    <div className="flex-1 relative">
                        <textarea
                            placeholder="Type a message"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full max-h-36 h-10 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring focus:ring-green-300 overflow-y-auto"
                        />
                    </div>

                    <button
                        onClick={sendMessage}
                        className="ml-3 px-4 py-2 text-white bg-green-700 rounded-lg hover:bg-green-800"
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatApplication;
