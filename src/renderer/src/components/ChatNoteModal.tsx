import React from 'react';
import { useState } from 'react';
// import ChatNewNote from './ChatNewNote';
import ChatNewNote from './ChatNewNote';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNoteForCustomer, deleteNoteForCustomer } from '@renderer/api/queries/adminqueries';
import { useAuth } from '@renderer/context/authContext';
import { ApiError } from '@renderer/api/customApiCall';
interface Note {
  id: number;
  title: string;
  note: string;
  createdAt: string;
  agent: any;

}

interface ChatNoteModalProps {
  notes: Note[];
  onClose: () => void;
  userId?: number | string
}

const ChatNoteModal: React.FC<ChatNoteModalProps> = ({ notes, onClose, userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth()
  const queryClient = useQueryClient();
  const [addNotes, setAddNotes] = useState<string[]>([]);
  const { mutate: addNote } = useMutation({
    mutationKey: ['add-note'],
    mutationFn: (data: {
      note: string,
      userId: number | string
    }) => createNoteForCustomer(data, token),
    onSuccess: () => {
      alert('Note added successfully')
      queryClient.invalidateQueries(['notes-for-customer'])
      // queryClient.invalidateQueries(['notes-for-customer', userId])
      // onclose()
      onClose()
    },
    onError: (error) => {
      console.log(error)
    }

  })
  const handleAddNote = (newNote: string) => {
    addNote({
      note: newNote,
      userId: userId!
    })
    // setAddNotes((prevNotes) => [...prevNotes, newNote]);

  };
  const { mutate: deleteNot, isPending: deleteNotPending } = useMutation({

    mutationFn: (noteid: number) =>
      deleteNoteForCustomer(noteid, token),
    mutationKey: ['delete-note'],
    onSuccess: (data) => {
      alert('Note deleted successfully')
      queryClient.invalidateQueries(['notes-for-customer'])
      // setNewNoteText(""); // Clear input field
      // toggleNewNoteModal();
      // setNewNoteModalVisible(false);
      console.log("created siccessfully", data)
    },
    onError: (error: ApiError) => {
      console.log(error);
      alert('Failed to delete note. Please try again.');

    },
  });
  const deleteNote = (id: string) => {
    deleteNot(parseInt(id));
    queryClient.invalidateQueries(['notes-for-customer'])
    // setNotes(notes.filter((note) => note.id !== id));
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
            {isModalOpen && (
              <ChatNewNote
                onClose={() => setIsModalOpen(false)}
                onAddNote={handleAddNote}
              />
            )}
          </div>
        </div>



        {/* Notes List */}
        <div className="space-y-4">
          {notes?.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg `}
            >
              {/* Note Header */}
              <div className="flex items-center justify-between">
                {note.title && <h3 className="font-bold text-sm">{note.title}</h3>}

              </div>
              {/* Note Body */}
              {note.note && <p className="text-sm">{note.note}</p>}
              {/* Note Footer */}
              <div className="text-xs text-gray-500 mt-2">
                {note.createdAt} <span className="ml-1">Saved by {note.agent.username}</span>
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button className="text-sm text-red-600 hover:underline" onClick={() => deleteNote(note?.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatNoteModal;
