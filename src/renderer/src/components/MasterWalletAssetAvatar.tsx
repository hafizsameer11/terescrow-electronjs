import React, { useEffect, useMemo, useState } from 'react';
import { cryptoIconFallbackUrl, resolveWalletIconUrl } from '@renderer/utils/masterWalletAssets';

type Props = {
  symbol: string;
  iconUrl?: string;
  className?: string;
  /** Green hero card uses light-on-green styling instead of gray chip. */
  variant?: 'default' | 'onGreen';
};

export const MasterWalletAssetAvatar: React.FC<Props> = ({
  symbol,
  iconUrl,
  className = 'w-8 h-8 text-xs',
  variant = 'default',
}) => {
  const [failedPrimary, setFailedPrimary] = useState(false);
  const [failedFallback, setFailedFallback] = useState(false);
  const letter = (symbol?.charAt(0) || '?').toUpperCase();
  const shell =
    variant === 'onGreen'
      ? 'rounded-full bg-white/20 overflow-hidden flex items-center justify-center font-bold text-white shrink-0'
      : 'rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-600 shrink-0';

  const primarySrc = useMemo(() => (iconUrl ? resolveWalletIconUrl(iconUrl) : undefined), [iconUrl]);
  const fallbackSrc = useMemo(() => cryptoIconFallbackUrl(symbol), [symbol]);

  useEffect(() => {
    setFailedPrimary(false);
    setFailedFallback(false);
  }, [symbol, iconUrl]);

  const showPrimary = primarySrc && !failedPrimary;
  const showFallback = !showPrimary && fallbackSrc && !failedFallback;

  return (
    <div className={`${shell} ${className}`}>
      {showPrimary ? (
        <img
          src={primarySrc}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailedPrimary(true)}
        />
      ) : showFallback ? (
        <img
          src={fallbackSrc}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailedFallback(true)}
        />
      ) : (
        letter
      )}
    </div>
  );
};
