import { useState } from 'react';

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="More information"
      >
        ?
      </button>
      {visible && (
        <span className="absolute left-6 bottom-0 z-10 w-64 p-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg">
          {content}
        </span>
      )}
    </span>
  );
}
