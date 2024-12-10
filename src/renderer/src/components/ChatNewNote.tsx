import React, { useState } from 'react';

interface ChatNewNoteProps {
  onClose: () => void; // Callback to close the modal
  onAddNote: (note: string) => void; // Callback to save the new note
}

const ChatNewNote: React.FC<ChatNewNoteProps> = ({ onClose, onAddNote }) => {
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (note.trim() !== '') {
      onAddNote(note); // Pass the note to the parent component
      setNote(''); // Clear the input field
      onClose(); // Close the modal
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add new note</h2>
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

        {/* Input Field */}
        <div className="mb-6">
          <textarea
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Add new note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 text-white bg-green-700 rounded-lg hover:bg-green-800"
        >
          Complete
        </button>
      </div>
    </div>
  );
};

export default ChatNewNote;
