import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShiftSettings } from '@renderer/data/dailyReportData';
import type { ShiftType, ShiftSettings } from '@renderer/data/dailyReportData';
import type { ShiftSettingsData } from '@renderer/api/admin/dailyReport';
import { useAuth } from '@renderer/context/authContext';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (shift: ShiftType) => void;
  isPending?: boolean;
  /** When true, agent must clock in — no dismiss without checking in. */
  required?: boolean;
  /** When provided (e.g. from API), used instead of getShiftSettings() */
  shiftSettings?: ShiftSettingsData | null;
}

const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')} ${m.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
};

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onCheckIn,
  isPending = false,
  required = false,
  shiftSettings: apiSettings,
}) => {
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [shift, setShift] = useState<ShiftType>('Day');
  const fallback = getShiftSettings();
  const settings: ShiftSettings = apiSettings
    ? {
        day: {
          checkIn: String(apiSettings.day?.checkIn ?? '09:00'),
          checkOut: String(apiSettings.day?.checkOut ?? '17:00'),
          gracePeriod: String(apiSettings.day?.gracePeriod ?? '00:15'),
        },
        night: {
          checkIn: String(apiSettings.night?.checkIn ?? '22:00'),
          checkOut: String(apiSettings.night?.checkOut ?? '06:00'),
          gracePeriod: String(apiSettings.night?.gracePeriod ?? '00:15'),
        },
      }
    : fallback;

  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setCurrentTime(formatTime(new Date())), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  if (!isOpen) return null;

  const checkInTimeStr = shift === 'Day' ? settings.day.checkIn : settings.night.checkIn;
  const [h = 9, m = 0] = checkInTimeStr.split(':').map(Number);
  const checkInDisplay = `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  const checkInDate = new Date();
  checkInDate.setHours(h, m, 0, 0);
  const now = new Date();
  const diffMs = now.getTime() - checkInDate.getTime();
  const graceMins = 15;
  const isOnTime = diffMs <= graceMins * 60 * 1000;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center overflow-y-auto p-6 ${required ? 'z-[202]' : 'z-50'} ${required ? 'bg-transparent' : 'bg-black bg-opacity-30'}`}
      onClick={required ? undefined : onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{required ? 'Clock in to start' : 'Check In'}</h2>
            {required ? (
              <p className="text-xs text-gray-500 mt-0.5">Required before you can use the admin panel today</p>
            ) : null}
          </div>
          {!required ? (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
              &times;
            </button>
          ) : null}
        </div>
        <div className="p-6 space-y-4">
          {required ? (
            <p className="text-sm text-gray-600 leading-relaxed rounded-lg bg-[#147341]/5 border border-[#147341]/20 px-3 py-2">
              Select your shift and clock in to handle chats, transactions, and other agent tasks.
            </p>
          ) : null}
          <div className="text-center">
            <p className="text-3xl font-bold text-[#147341] tracking-widest">{currentTime}</p>
            <p className="text-sm text-gray-500 mt-1">Current time</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Check in time: <strong>{checkInDisplay}</strong></span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOnTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isOnTime ? 'On time' : 'Late'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as ShiftType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
            >
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => onCheckIn(shift)}
            disabled={isPending}
            className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
          >
            {isPending ? 'Checking in…' : required ? 'Clock In & Continue' : 'Check In'}
          </button>
          {required ? (
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOGOUT' });
                navigate('/', { replace: true });
              }}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-800"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
