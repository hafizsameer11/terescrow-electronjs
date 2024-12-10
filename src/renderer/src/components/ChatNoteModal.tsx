import React from 'react';
import { useState } from 'react';
// import ChatNewNote from './ChatNewNote';
import ChatNewNote from './ChatNewNote';
interface Note {
    id: number;
    title: string;
    description: string;
    date: string;
    author: string;
    pinned: boolean;
}

interface ChatNoteModalProps {
    notes: Note[];
    onClose: () => void;
}

const ChatNoteModal: React.FC<ChatNoteModalProps> = ({ notes, onClose }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [addNotes, setAddNotes] = useState<string[]>([]);

    const handleAddNote = (newNote: string) => {
        setAddNotes((prevNotes) => [...prevNotes, newNote]);
      };
    return (
        <div className="fixed inset-0 flex items-center justify-end bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 mr-[40%]">
                <div className='flex justify-end mb-4'>
                    <button
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={onClose}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Notes History</h2>
                    <div>
                        {/* New Note Button */}
                        <button
                            className="px-4 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 w-44"
                            onClick={() => setIsModalOpen(true)}
                        >
                            New Note
                        </button>

                        {/* ChatNewNote Modal */}
                        {isModalOpen && (
                            <ChatNewNote
                                onClose={() => setIsModalOpen(false)}
                                onAddNote={handleAddNote}
                            />
                        )}

                        {/* Displaying Notes
                        <div className="mt-6 space-y-2">
                            {addNotes.map((note, index) => (
                                <div key={index} className="p-4 bg-gray-100 rounded-lg">
                                    {note}
                                </div>
                            ))}
                        </div> */}
                    </div>
                </div>



                {/* Notes List */}
                <div className="space-y-4">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className={`p-4 rounded-lg ${note.pinned
                                ? 'bg-green-100 border-l-4 border-green-400'
                                : 'bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {/* Note Header */}
                            <div className="flex items-center justify-between">
                                {note.title && <h3 className="font-bold text-sm">{note.title}</h3>}
                                {note.pinned && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-gray-700"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.862 4.487c.341-.176.741-.072.975.228l1.528 2.039a.75.75 0 01-.116.987l-5.22 4.58v5.085a.75.75 0 01-.44.685l-2.25 1a.75.75 0 01-1.06-.685v-6.07a.75.75 0 01.26-.57l6.55-5.022z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 3.75L16.862 4.487M8.625 18.75h-4.5a.75.75 0 01-.75-.75v-15a.75.75 0 01.75-.75h12.75a.75.75 0 01.75.75v2.25"
                                        />
                                    </svg>
                                )}
                            </div>
                            {/* Note Body */}
                            {note.description && <p className="text-sm">{note.description}</p>}
                            {/* Note Footer */}
                            <div className="text-xs text-gray-500 mt-2">
                                {note.date} <span className="ml-1">Saved by {note.author}</span>
                            </div>
                            {/* Actions */}
                            <div className="flex justify-end space-x-2 mt-2">
                                <button className="text-sm text-green-700 hover:underline">Edit</button>
                                <button className="text-sm text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatNoteModal;
