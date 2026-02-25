import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <header className="no-print flex items-center justify-between px-4 py-3 bg-gray-900 dark:bg-gray-950 border-b border-gray-700 dark:border-gray-800">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-green-600 dark:bg-green-500">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">
            {t('app.title')}
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight hidden sm:block">
            {t('app.subtitle')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <select
          value={i18n.language}
          onChange={(e) => void i18n.changeLanguage(e.target.value)}
          className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 rounded border border-gray-600 dark:border-gray-700 transition-colors cursor-pointer"
          aria-label="Select language"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>

        {/* Print button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 rounded transition-colors"
        >
          🖨 {t('print.button')}
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-600 rounded transition-colors"
        >
          {shareCopied ? (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t('share.copied')}
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {t('share.button')}
            </>
          )}
        </button>
      </div>
    </header>
  );
}
