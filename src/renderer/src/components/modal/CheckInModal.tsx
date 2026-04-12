import React, { useState, useEffect } from 'react';
import { getShiftSettings } from '@renderer/data/dailyReportData';
import type { ShiftType, ShiftSettings } from '@renderer/data/dailyReportData';
import type { ShiftSettingsData } from '@renderer/api/admin/dailyReport';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (shift: ShiftType) => void;
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

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onCheckIn, shiftSettings: apiSettings }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Check In</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
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
            className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
