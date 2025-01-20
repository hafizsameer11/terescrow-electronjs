import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_DOMAIN } from '@renderer/api/config';

interface PrivacyPageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPageModal: React.FC<PrivacyPageModalProps> = ({ isOpen, onClose }) => {
  const [privacyPageLink, setPrivacyPageLink] = useState('');
  const [termsPageLink, setTermsPageLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPrivacyPageLinks();
    }
  }, [isOpen]);

  const fetchPrivacyPageLinks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_DOMAIN}/admin/operations/privacy-page-links`);
      if (response.status === 200) {
        setPrivacyPageLink(response.data.data?.privacyPageLink || '');
        setTermsPageLink(response.data.data?.termsPageLink || '');
      }
    } catch (error) {
      console.error('Error fetching privacy page links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.post(`${API_DOMAIN}/admin/operations/create-privacy-page`, {
        privacyPageLink,
        termsPageLink,
      });
      alert('Privacy page links updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving privacy page links:', error);
      alert('An error occurred while saving the links.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg shadow-xl relative">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Privacy Policy & Terms Links</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loader border-4 border-t-4 border-gray-200 h-10 w-10 rounded-full animate-spin"></div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="mb-6">
              <label
                htmlFor="privacyPageLink"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Privacy Page Link
              </label>
              <input
                type="url"
                id="privacyPageLink"
                value={privacyPageLink}
                onChange={(e) => setPrivacyPageLink(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Enter Privacy Policy Link"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="termsPageLink"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Terms & Conditions Link
              </label>
              <input
                type="url"
                id="termsPageLink"
                value={termsPageLink}
                onChange={(e) => setTermsPageLink(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Enter Terms and Conditions Link"
                required
              />
            </div>
            <div className="flex justify-end items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition ${
                  isSaving ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PrivacyPageModal;
