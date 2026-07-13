import React from 'react';

/** Shown while a list refetches; avoids replacing the whole page on filter/search changes. */
const ListFetchingIndicator: React.FC<{ show?: boolean; className?: string }> = ({
  show,
  className = '',
}) => {
  if (!show) return null;
  return (
    <p className={`text-sm text-gray-500 py-1 ${className}`.trim()} aria-live="polite">
      Updating…
    </p>
  );
};

export default ListFetchingIndicator;
