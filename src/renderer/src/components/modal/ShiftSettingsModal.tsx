import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import { getDailyReportShiftSettings, updateDailyReportShiftSettings, type ShiftSettingsData } from '@renderer/api/admin/dailyReport';

interface ShiftSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const timePlaceholder = 'hh : mm : ss';

const toInputValue = (s: string): string => {
  if (!s || s.length <= 5) return s;
  return s.length >= 8 ? s : `${s}:00`;
};

const fromInputValue = (s: string): string => {
  const parts = s.replace(/\s/g, '').split(':');
  const h = parts[0]?.padStart(2, '0') ?? '00';
  const m = parts[1]?.padStart(2, '0') ?? '00';
  const sec = parts[2]?.padStart(2, '0') ?? '00';
  return `${h}:${m}:${sec}`.slice(0, 8);
};

const ShiftSettingsModal: React.FC<ShiftSettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [day, setDay] = useState({ checkIn: '', checkOut: '', gracePeriod: '' });
  const [night, setNight] = useState({ checkIn: '', checkOut: '', gracePeriod: '' });

  const { data: settings } = useQuery({
    queryKey: ['admin-daily-report-shift-settings', token],
    queryFn: () => getDailyReportShiftSettings(token!),
    enabled: !!token && isOpen,
  });

  useEffect(() => {
    if (isOpen && settings) {
      setDay({
        checkIn: toInputValue(String(settings.day?.checkIn ?? '09:00')),
        checkOut: toInputValue(String(settings.day?.checkOut ?? '17:00')),
        gracePeriod: toInputValue(String(settings.day?.gracePeriod ?? '00:15')),
      });
      setNight({
        checkIn: toInputValue(String(settings.night?.checkIn ?? '22:00')),
        checkOut: toInputValue(String(settings.night?.checkOut ?? '06:00')),
        gracePeriod: toInputValue(String(settings.night?.gracePeriod ?? '00:15')),
      });
    }
  }, [isOpen, settings]);

  const updateMutation = useMutation({
    mutationFn: (payload: ShiftSettingsData) => updateDailyReportShiftSettings(token!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-shift-settings'] });
      onSaved?.();
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const next: ShiftSettingsData = {
      day: {
        checkIn: fromInputValue(day.checkIn) || '09:00',
        checkOut: fromInputValue(day.checkOut) || '17:00',
        gracePeriod: fromInputValue(day.gracePeriod) || '00:15',
      },
      night: {
        checkIn: fromInputValue(night.checkIn) || '22:00',
        checkOut: fromInputValue(night.checkOut) || '06:00',
        gracePeriod: fromInputValue(night.gracePeriod) || '00:15',
      },
    };
    updateMutation.mutate(next);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Shift Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Day Shift</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Check in time</label>
                <input
                  type="text"
                  value={day.checkIn}
                  onChange={(e) => setDay((d) => ({ ...d, checkIn: e.target.value }))}
                  placeholder={timePlaceholder}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Check out time</label>
                <input
                  type="text"
                  value={day.checkOut}
                  onChange={(e) => setDay((d) => ({ ...d, checkOut: e.target.value }))}
                  placeholder={timePlaceholder}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Grace Period</label>
                <input
                  type="text"
                  value={day.gracePeriod}
                  onChange={(e) => setDay((d) => ({ ...d, gracePeriod: e.target.value }))}
                  placeholder={timePlaceholder}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Night Shift</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Check in time</label>
                <input
                  type="text"
                  value={night.checkIn}
                  onChange={(e) => setNight((n) => ({ ...n, checkIn: e.target.value }))}
                  placeholder={timePlaceholder}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Check out time</label>
                <input
                  type="text"
                  value={night.checkOut}
                  onChange={(e) => setNight((n) => ({ ...n, checkOut: e.target.value }))}
                  placeholder={timePlaceholder}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Grace Period</label>
                <input
                  type="text"
                  value={night.gracePeriod}
                  onChange={(e) => setNight((n) => ({ ...n, gracePeriod: e.target.value }))}
                  placeholder={timePlaceholder}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftSettingsModal;
