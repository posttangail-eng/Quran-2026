import { ArrowRight } from 'lucide-react';
import { RECITERS, TRANSLATIONS } from '../data/surahs';

interface AboutQuranViewProps {
  onStartReading: () => void;
}

const PRONUNCIATION_RULES = [
  {
    symbol: 'আ- / া-',
    meaning: 'টান (মাদ্দ) — এই চিহ্ন থাকলে স্বরধ্বনি ১ থেকে ৩ আলিফ পরিমাণ টেনে পড়তে হবে (যেমন: রাহমা-ন, ‘আ-লামীন)।',
  },
  {
    symbol: 'ক্ব',
    meaning: 'আরবি ক্বাফ (ق) — জিহ্বার গোড়া ওপরের তালুতে লাগিয়ে মোটা ও গভীরভাবে উচ্চারিত হয়।',
  },
  {
    symbol: 'স্ব / দ্ব / ত্ব / য্ব',
    meaning: 'পুর বা মোটা হরফ (ص, ض, ط, ظ) — মুখ ভরে মোটা আওয়াজে উচ্চারণ করতে হয়।',
  },
  {
    symbol: '‘ (আইন)',
    meaning: 'আরবি আইন (ع) — কণ্ঠনালীর মাঝখান থেকে স্পষ্টভাবে উচ্চারণ করা হয় (যেমন: না‘বুদু, ‘আলাইহিম)।',
  },
  {
    symbol: 'তাজবিদ পরামর্শ',
    meaning: 'বাংলা উচ্চারণ কেবল পড়ার সুবিধার্থে সহায়ক হিসেবে দেওয়া হয়েছে। বিশুদ্ধ উচ্চারণ আয়ত্ত করতে অডিও তিলাওয়াত শুনে অনুশীলন করুন।',
  },
];

export function AboutQuranView({ onStartReading }: AboutQuranViewProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-28">
      <div className="border-b border-[#E2DBD0] pb-6 dark:border-[#282D28]">
        <p className="text-xs font-medium text-[#6E655B] dark:text-[#A8A29E]">
          পাঠ ও তিলাওয়াত নির্দেশিকা
        </p>
        <h1 className="font-bn-serif mt-2 text-3xl font-bold text-[#1C1917] dark:text-[#F2EFE9]">
          বাংলা উচ্চারণ ও তিলাওয়াত নির্দেশিকা
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
          আরবি বর্ণমালার কিছু ধ্বনি বাংলা হরফে হুবহু প্রকাশ করা কঠিন। তাই তিলাওয়াতকে সহজ ও বিশুদ্ধ রাখতে এই অ্যাপে বিশেষ ধ্বনি-নির্দেশক চিহ্ন ও ক্বারীদের অডিও সংযুক্ত করা হয়েছে।
        </p>
      </div>

      {/* Pronunciation Guide */}
      <section className="mt-8">
        <h2 className="font-bn-serif text-xl font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
          উচ্চারণ সংকেত পরিচিতি
        </h2>
        <div className="mt-4 divide-y divide-[#E2DBD0] rounded-xl border border-[#E2DBD0] bg-white dark:divide-[#282D28] dark:border-[#282D28] dark:bg-[#161916]">
          {PRONUNCIATION_RULES.map((rule) => (
            <div
              key={rule.symbol}
              className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-12 sm:items-baseline"
            >
              <div className="sm:col-span-3 font-semibold text-[#14532D] dark:text-emerald-400">
                {rule.symbol}
              </div>
              <div className="sm:col-span-9 text-sm leading-relaxed text-[#44403C] dark:text-[#D6D3D1]">
                {rule.meaning}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Translations & Reciters */}
      <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-bn-serif text-xl font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
            উপলব্ধ বাংলা অনুবাদ
          </h2>
          <div className="mt-4 space-y-4">
            {TRANSLATIONS.map((tr) => (
              <div
                key={tr.id}
                className="rounded-xl border border-[#E2DBD0] bg-white p-5 dark:border-[#282D28] dark:bg-[#161916]"
              >
                <h3 className="font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
                  {tr.banglaName}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                  {tr.translatorBio}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bn-serif text-xl font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
            অডিও তিলাওয়াতকারী ক্বারীগণ
          </h2>
          <div className="mt-4 divide-y divide-[#E2DBD0] rounded-xl border border-[#E2DBD0] bg-white dark:divide-[#282D28] dark:border-[#282D28] dark:bg-[#161916]">
            {RECITERS.map((reciter) => (
              <div key={reciter.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-[#1C1917] dark:text-[#F2EFE9]">
                    {reciter.banglaName}
                  </p>
                  <p className="text-xs text-[#6E655B] dark:text-[#A8A29E]">
                    {reciter.style}
                  </p>
                </div>
                <span dir="rtl" lang="ar" className="font-arabic text-base text-[#14532D] dark:text-emerald-400">
                  {reciter.arabicName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-10 border-t border-[#E2DBD0] pt-6 dark:border-[#282D28]">
        <button
          type="button"
          onClick={onStartReading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#166534] dark:bg-emerald-700 cursor-pointer"
        >
          কুরআন পাঠে ফিরে যান
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
