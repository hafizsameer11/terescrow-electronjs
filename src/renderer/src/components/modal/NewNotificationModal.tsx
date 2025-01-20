import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createNotification } from '@renderer/api/queries/adminqueries';
import { useAuth } from '@renderer/context/authContext';
import CustomerListModal from './CustomerListModal';

interface NewNotificationModalProps {
  isOpen: boolean;
  actionType: 'add' | 'edit';
  onClose: () => void;
  initialData?: {
    title: string;
    message: string;
    imagePreview?: string;
    type: 'customer' | 'agent' | 'all';
  };
}

const NewNotificationModal: React.FC<NewNotificationModalProps> = ({
  isOpen,
  actionType,
  onClose,
  initialData = {
    title: '',
    message: '',
    imagePreview: null,
    type: 'all',
  },
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [type, setType] = useState<'customer' | 'agent' | 'all'>('all');
  const [isSpecific, setIsSpecific] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; message?: string }>({});
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const { token } = useAuth();

  const { mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
      return await createNotification({ token, data: formData });
    },
    onSuccess: () => {
      alert('Notification sent successfully!');
      onClose();
    },
  });

  useEffect(() => {
    if (actionType === 'edit' && initialData) {
      setTitle(initialData.title);
      setMessage(initialData.message);
      setImagePreview(initialData.imagePreview || null);
      setType(initialData.type);
    }
  }, [actionType, initialData]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) {
      setErrors({ title: !title.trim() ? 'Title is required.' : undefined, message: !message.trim() ? 'Message is required.' : undefined });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    formData.append('type', type);
    formData.append('isSingle', isSpecific.toString());
    if (selectedUserIds.length) {
      formData.append('userIds', JSON.stringify(selectedUserIds));
    }
    if (image) formData.append('image', image);

    mutate(formData);
  };

  if (!isOpen) return null;
  const handleUserSelected = (selectedUserIds: number[]) => {
    setSelectedUserIds(selectedUserIds);
    console.log(selectedUserIds);
    // setIsCustomerModalOpen(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[500px]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl">
          &times;
        </button>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {actionType === 'add' ? 'New Notification' : 'Edit Notification'}
        </h2>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
          </div>
          <label htmlFor="imageInput" className="cursor-pointer">
            <img
              src={imagePreview || ''}
              alt="Preview"
              className="w-20 h-16 border object-cover rounded-lg"
            />
          </label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div>
            <label>
              <input type="radio" value="customer" checked={type === 'customer'} onChange={() => setType('customer')} />
              Customer
            </label>
            <label>
              <input type="radio" value="agent" checked={type === 'agent'} onChange={() => setType('agent')} />
              Agent
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              checked={isSpecific}
              onChange={(e) => {
                setIsSpecific(e.target.checked);
                setIsCustomerModalOpen(e.target.checked);
              }}
            />
            <span>Is Specific</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button onClick={handleSubmit} className="w-full bg-green-700 text-white rounded-lg px-4 py-3">
            {actionType === 'add' ? 'Send Notification' : 'Update Notification'}
          </button>
        </div>
      </div>

      {/* Customer List Modal */}
      {isCustomerModalOpen && (
        <CustomerListModal
          role={type === 'customer' ? 'customer' : 'agent'}
          onClose={() => setIsCustomerModalOpen(false)}
          onUsersSelected={(selectedUserIds) => handleUserSelected(selectedUserIds)}
        />
      )}
    </div>
  );
};

export default NewNotificationModal;
