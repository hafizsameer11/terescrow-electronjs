import { chnagePassword } from "@renderer/api/queries/commonqueries";
import React, { useState } from "react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  // chnagePassword: (payload: { oldPassword: string; newPassword: string }, token: string) => Promise<any>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  token,
  // chnagePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setError(""); // Clear errors
    setIsSubmitting(true);

    const payload = {
      oldPassword: currentPassword,
      newPassword: newPassword,
    };

    try {
      const response = await chnagePassword(payload, token);

      if (response.status === "success") {
        alert("Password changed successfully.");
        onClose(); // Close modal on success
      } else {
        alert(response.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Password change failed", err);
      alert(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center w-full">
            Change Password
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Error Display */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Input Fields */}
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6">
          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className={`w-full rounded-lg px-4 py-2 font-semibold ${
              isSubmitting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#147341] text-white hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
