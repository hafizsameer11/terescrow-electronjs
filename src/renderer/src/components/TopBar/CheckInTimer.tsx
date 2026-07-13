import React, { useEffect, useState } from 'react';
import { useDailyReportSession } from '@renderer/context/dailyReportSessionContext';
import { formatElapsedMs } from '@renderer/utils/formatWorkTimer';

const CheckInTimer: React.FC = () => {
  const { session, isClockedIn } = useDailyReportSession();
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!isClockedIn || !session?.checkInTime) {
      setElapsed('00:00:00');
      return;
    }
    const start = new Date(session.checkInTime).getTime();
    const tick = () => setElapsed(formatElapsedMs(Date.now() - start));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isClockedIn, session?.checkInTime]);

  if (!isClockedIn || !session) return null;

  return (
    <div className="flex items-center gap-2 mr-auto px-4 py-1.5 rounded-lg bg-[#147341]/10 border border-[#147341]/20">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#147341] opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#147341]" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-[#147341] font-semibold">
          {session.shift} shift
        </span>
        <span className="text-lg font-mono font-bold text-[#147341] tabular-nums">{elapsed}</span>
      </div>
    </div>
  );
};

export default CheckInTimer;
