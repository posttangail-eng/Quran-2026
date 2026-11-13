import { AppView } from '../types/quran';

interface HeaderProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onContinueReading: () => void;
  lastReadLabel: string;
}

const NAV_ITEMS: Array<{ id: AppView; label: string }> = [
  { id: 'directory', label: 'সূরা তালিকা' },
  { id: 'reader', label: 'কুরআন পাঠ' },
  { id: 'bookmarks', label: 'সংরক্ষিত' },
  { id: 'about', label: 'নির্দেশিকা' },
];

export function Header({
  currentView,
  onSelectView,
  onContinueReading,
  lastReadLabel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E2DBD0] bg-[#FBF9F5]/95 backdrop-blur-sm dark:border-[#282D28] dark:bg-[#111311]/95">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('directory')}
          className="font-bn-serif text-xl font-bold tracking-tight text-[#1C1917] transition-colors hover:text-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] dark:text-[#F2EFE9] dark:hover:text-emerald-400 whitespace-nowrap shrink-0 cursor-pointer"
        >
          আল-কুরআন
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav
          aria-label="প্রধান নেভিগেশন"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] ${
                  isActive
                    ? 'text-[#14532D] dark:text-emerald-400 font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F2EFE9]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[15px] h-[2px] bg-[#14532D] dark:bg-emerald-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onContinueReading}
            title={lastReadLabel}
            className="rounded-lg bg-[#14532D] px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] focus-visible:ring-offset-2 dark:bg-emerald-700 dark:hover:bg-emerald-600 whitespace-nowrap shrink-0 cursor-pointer"
          >
            সর্বশেষ পাঠ
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row (only on < md) */}
      <nav
        aria-label="মোবাইল নেভিগেশন"
        className="flex md:hidden items-center justify-around border-t border-[#E2DBD0]/80 px-2 py-1.5 text-xs font-medium dark:border-[#282D28]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#14532D]/10 text-[#14532D] dark:bg-emerald-500/15 dark:text-emerald-400 font-semibold'
                  : 'text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
