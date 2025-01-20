import { createQuickReply, updateQuickReply } from '@renderer/api/queries/agent.mutations'
import { deleteQuickReply, getAllQuickReplies, QuickReply } from '@renderer/api/queries/agent.queries'
import { useAuth } from '@renderer/context/authContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { useQueries } from 'react-query'

// Dummy data for Quick Replies
const dummyData = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  message: `Quick reply message ${index + 1}`,
  userId: 40,
  createdAt: new Date().toISOString(),
}))

const QuickReplies = () => {
  const [data, setData] = useState(dummyData)
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedReply, setSelectedReply] = useState(null)
  const [quickReplyData, setQuickReplyData] = useState<QuickReply[]>([]);
  const queryClient = useQueryClient();
  const { data: quickReplies } = useQuery({
    queryKey: ['quickReplies'],
    queryFn: () => getAllQuickReplies(token),
    enabled: !!token
  });

  const { mutate: createRep } = useMutation({
    mutationKey: ['create-reply'],
    mutationFn: (data: { message: string }) => createQuickReply(data, token),
    onSuccess: (data) => {
      alert(data.message)
      queryClient.invalidateQueries(['quickReplies'])
    },
    onError: (error) => {
      alert(error)
    }
  })
  useEffect(() => {
    if (quickReplies) {
      setQuickReplyData(quickReplies.data);
    }
  })
  const { mutate: updateReply } = useMutation({
    mutationKey: ['update-reply'],
    mutationFn: ({ data, token, id }: { data: { message: string }; token: string; id: number }) =>
      updateQuickReply(data, token, id),
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries(['quickReplies']);
    },
    onError: (error) => {
      alert(error);
    },
  });
  const { mutate: deleteQuickRep } = useMutation({
    mutationKey: ['delete-reply'],
    mutationFn: (id: number) => deleteQuickReply(id, token),
    onSuccess: (data) => {
      alert(data.message)
      queryClient.invalidateQueries(['quickReplies'])
    },
    onError: (error) => {
      alert(error)
    }
  })
  useEffect(() => {
    if (quickReplies) {
      setQuickReplyData(quickReplies.data);
    }
  })
  const itemsPerPage = 10
  const totalPages = Math.ceil(quickReplyData?.length / itemsPerPage)

  // Pagination logic
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCreate = (newMessage: string) => {
    createRep({ message: newMessage });
    // setData([newReply, ...data])
    setShowCreateModal(false)
  }

  const handleUpdate = (updatedMessage: string) => {
    updateReply({
      data: { message: updatedMessage },
      token: token,
      id: selectedReply?.id,
    });

    setShowUpdateModal(false);
  };
  const handleDeleteQuickReply = (id: number) => {
    confirm('Are you sure you want to delete this quick reply?') && deleteQuickRep(id)
  }


  return (
    <div className='p-6 space-y-8 w-full'>
      <h1 className='text-xl font-bold'>Quick Replies Page</h1>
      <button
        onClick={() => setShowCreateModal(true)}
        className='bg-[#147341] text-white px-4 py-2 rounded'
      >
        Create Quick Reply
      </button>

      {/* Table */}
      <table className='w-full border-collapse border border-gray-300 mt-4'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='border border-gray-300 px-4 py-2'>ID</th>
            <th className='border border-gray-300 px-4 py-2'>Message</th>
            <th className='border border-gray-300 px-4 py-2'>Created At</th>
            <th className='border border-gray-300 px-4 py-2'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quickReplyData.map((reply) => (
            <tr key={reply.id}>
              <td className='border border-gray-300 px-4 py-2'>{reply.id}</td>
              <td className='border border-gray-300 px-4 py-2'>{reply.message}</td>
              <td className='border border-gray-300 px-4 py-2'>
                {new Date(reply.createdAt).toLocaleString()}
              </td>
              <td className='border border-gray-300 px-4 py-2'>
                <button
                  onClick={() => {
                    setSelectedReply(reply)
                    setShowUpdateModal(true)
                  }}
                  className='bg-yellow-500 text-white px-2 py-1 rounded'
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    handleDeleteQuickReply(reply.id)
                  }}
                  className='bg-red-500 ml-2 text-white px-2 py-1 rounded'
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className='mt-4 flex justify-center items-center space-x-2'>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className='bg-gray-300 px-2 py-1 rounded disabled:opacity-50'
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'
              }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className='bg-gray-300 px-2 py-1 rounded disabled:opacity-50'
        >
          Next
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded">
            <h2 className="text-lg font-bold mb-4">Create Quick Reply</h2>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="Enter message"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-300 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector(".create-modal-input");
                  if (input) {
                    handleCreate(input.value);
                    input.value = "";
                  }
                }}
                className="bg-[#147341] text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedReply && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded">
            <h2 className="text-lg font-bold mb-4">Update Quick Reply</h2>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full update-modal-input"
              defaultValue={selectedReply.message}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdate(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="bg-gray-300 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector(".update-modal-input");
                  if (input) {
                    handleUpdate(input.value);
                    input.value = "";
                  }
                }}
                className="bg-[#147341] text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default QuickReplies
