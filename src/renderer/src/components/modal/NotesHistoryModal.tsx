import React from "react";
import { MdPushPin } from "react-icons/md"; // Pin icon
// import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai"; // Edit and Delete icons
import { Icons } from "@renderer/constant/Icons";

interface NotesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Array<{
    id: number;
    note: string;
    createdAt: string;
    agent: any
  }>;
  onNewNote: (newNote:string) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotesHistoryModal: React.FC<NotesHistoryModalProps> = ({
  isOpen,
  onClose,
  notes,
  onNewNote,
  onEdit,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-end z-50 px-10">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[600px]">
        {/* Modal Header */}
        <div className="flex flex-col relative">
          <button
            onClick={onClose}
            className=" text-gray-500 hover:text-gray-800 text-2xl  flex justify-end mb-4 "
          >
            <img src={Icons.cross} alt="" />
          </button>
          <div className="flex justify-between items-center pb-4 mb-4 border-b">

            <h2 className="text-lg font-semibold text-gray-700">Notes History</h2>
            <button
              onClick={onNewNote}
              className="bg-[#147341] text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              New Note
            </button>
          </div>

        </div>

        {/* Close Icon */}


        {/* Notes List */}
        <div className="overflow-y-auto max-h-[300px]">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 flex items-center gap-1 rounded-lg mb-4 `} >


              <div className="w-full">

                <div className="flex justify-between items-center">

                  <div className="flex items-center gap-2">

                    <span className="font-semibold text-gray-700">{note.note}</span>
                  </div>

                </div>

                {/* Metadata */}
                <div className="mt-2 text-sm text-gray-500  flex justify-between">
                  <div>

                    {note.createdAt} <span className="font-semibold">Saved by {note.agent.username}</span>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesHistoryModal;
