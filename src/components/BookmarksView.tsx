import { ArrowRight, Bookmark, Trash2, Volume2 } from 'lucide-react';
import { BookmarkItem } from '../types/quran';
import { toBengaliDigits } from '../utils/bengaliTransliteration';

interface BookmarksViewProps {
  bookmarks: BookmarkItem[];
  onOpenBookmark: (surahNumber: number, ayahNumberInSurah: number) => void;
  onPlayBookmarkMeaning: (item: BookmarkItem) => void;
  onRemoveBookmark: (surahNumber: number, ayahNumberInSurah: number) => void;
  onExploreSurahs: () => void;
}

export function BookmarksView({
  bookmarks,
  onOpenBookmark,
  onPlayBookmarkMeaning,
  onRemoveBookmark,
  onExploreSurahs,
}: BookmarksViewProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-28">
      <div className="border-b border-[#E2DBD0] pb-6 dark:border-[#282D28]">
        <p className="text-xs font-medium text-[#6E655B] dark:text-[#A8A29E]">
          ব্যক্তিগত সংগ্রহ · <span className="tabular-nums">{toBengaliDigits(bookmarks.length)}</span>টি সংরক্ষিত আয়াত
        </p>
        <h1 className="font-bn-serif mt-2 text-3xl font-bold text-[#1C1917] dark:text-[#F2EFE9]">
          সংরক্ষিত আয়াতসমূহ
        </h1>
        <p className="mt-2 text-sm text-[#57534E] dark:text-[#A8A29E]">
          আপনার প্রিয় আয়াতগুলো পরবর্তীতে দ্রুত পড়ার ও বাংলা অর্থ শোনার জন্য এখানে সংরক্ষিত থাকে।
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E2DBD0] bg-white p-10 text-center dark:border-[#282D28] dark:bg-[#161916]">
          <Bookmark className="mx-auto h-8 w-8 text-[#8C8378]" />
          <h2 className="font-bn-serif mt-4 text-xl font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
            এখনো কোনো আয়াত সংরক্ষণ করা হয়নি
          </h2>
          <p className="mt-2 text-sm text-[#6E655B] dark:text-[#A8A29E]">
            সূরা পড়ার সময় যেকোনো আয়াতের পাশে থাকা বুকমার্ক আইকনে ক্লিক করলে সেটি এখানে যুক্ত হবে।
          </p>
          <button
            type="button"
            onClick={onExploreSurahs}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#166534] dark:bg-emerald-700 cursor-pointer"
          >
            সূরা তালিকা দেখুন
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-[#E2DBD0] dark:divide-[#282D28]">
          {bookmarks.map((item) => (
            <article
              key={`${item.surahNumber}:${item.ayahNumberInSurah}`}
              className="py-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onOpenBookmark(item.surahNumber, item.ayahNumberInSurah)}
                  className="text-sm font-semibold text-[#14532D] hover:underline dark:text-emerald-400 cursor-pointer"
                >
                  সূরা {item.surahBanglaName} · আয়াত {toBengaliDigits(item.surahNumber)}:
                  {toBengaliDigits(item.ayahNumberInSurah)}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPlayBookmarkMeaning(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6CEBE] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-[#854D0E] dark:text-amber-400" />
                    অর্থ শুনুন
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenBookmark(item.surahNumber, item.ayahNumberInSurah)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D6CEBE] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] cursor-pointer"
                  >
                    সূরায় যান
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(item.surahNumber, item.ayahNumberInSurah)}
                    aria-label="বুকমার্ক মুছুন"
                    className="rounded-lg p-2 text-[#6E655B] hover:bg-red-50 hover:text-red-700 dark:text-[#A8A29E] dark:hover:bg-red-950/30 dark:hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p
                dir="rtl"
                lang="ar"
                className="font-arabic mt-4 text-right text-2xl leading-[2.2] text-[#1C1917] sm:text-3xl dark:text-[#F2EFE9]"
              >
                {item.arabicText}
              </p>

              {item.banglaPronunciation && (
                <p className="mt-3 text-sm font-medium text-[#292524] dark:text-[#E7E5E4]">
                  <span className="text-[#14532D] dark:text-emerald-400">উচ্চারণ: </span>
                  {item.banglaPronunciation}
                </p>
              )}

              <p className="font-bn-serif mt-2 text-sm leading-relaxed text-[#57534E] dark:text-[#D6D3D1]">
                {item.banglaTranslation}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
