import React, { useState, useMemo } from 'react';
import { ScanResult, SortOption, NutriGrade, AppLanguage, BilingualText, ScanMode } from '../types.ts';
import { 
  Trash2, ChevronRight, ArrowUpDown, Search, SlidersHorizontal, 
  ArrowDown, ArrowUp, Star, Check, X, AlignLeft
} from 'lucide-react';
import { TranslationKey } from '../utils/i18n.ts';
import { modeIcons } from './Scanner.tsx';

interface HistoryProps {
  history: ScanResult[];
  onSelect: (result: ScanResult) => void;
  onDelete: (id: string) => void;
  t: (key: TranslationKey) => string;
  language: AppLanguage;
}

const gradeColors: Record<NutriGrade, string> = {
  [NutriGrade.A]: 'bg-nutri-A text-white border-nutri-A',
  [NutriGrade.B]: 'bg-nutri-B text-white border-nutri-B',
  [NutriGrade.C]: 'bg-nutri-C text-white border-nutri-C',
  [NutriGrade.D]: 'bg-nutri-D text-white border-nutri-D',
};

const gradeBorderColors: Record<NutriGrade, string> = {
  [NutriGrade.A]: 'border-l-nutri-A',
  [NutriGrade.B]: 'border-l-nutri-B',
  [NutriGrade.C]: 'border-l-nutri-C',
  [NutriGrade.D]: 'border-l-nutri-D',
};

const getLocalizedText = (text: BilingualText | string | undefined, lang: AppLanguage): string => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') return text[lang] || text.en || '';
  return '';
};

const formatDate = (timestamp: number, lang: AppLanguage) => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString(lang === AppLanguage.ID ? 'id-ID' : 'en-US', options);
};

export const History: React.FC<HistoryProps> = ({ history, onSelect, onDelete, t, language }) => {
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Newest);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => {
        const name = getLocalizedText(item.productName, language).toLowerCase();
        return name.includes(lowerQuery);
      });
    }

    return result.sort((a, b) => {
      switch (sortOption) {
        case SortOption.Newest:
          return b.timestamp - a.timestamp;
        case SortOption.Oldest:
          return a.timestamp - b.timestamp;
        case SortOption.BestGrade:
          return a.grade.localeCompare(b.grade);
        case SortOption.WorstGrade:
          return b.grade.localeCompare(a.grade);
        default:
          return 0;
      }
    });
  }, [history, sortOption, searchQuery, language]);

  const handleSortSelect = (option: SortOption) => {
    setSortOption(option);
    setIsSortModalOpen(false);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <ArrowUpDown size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('no_scans')}</h2>
        <p>{t('no_scans_desc')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('history_title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('history_subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsSortModalOpen(true)}
          className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {filteredAndSortedHistory.map((item) => {
          const itemMode = item.mode || ScanMode.NORMAL;
          return (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-l-[6px] ${gradeBorderColors[item.grade]} flex gap-4 cursor-pointer hover:shadow-md transition-shadow relative group`}
              onClick={() => onSelect(item)}
            >
              {/* Image with Delete Overlay */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 relative">
                <img src={item.imageUrl} alt={getLocalizedText(item.productName, language)} className="w-full h-full object-cover" />
                
                {/* Delete Overlay Effect */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item.id);
                    }}
                    className="p-2.5 bg-red-500 text-white rounded-full shadow-lg transform hover:scale-110 active:scale-95 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-2">
                      {getLocalizedText(item.productName, language)}
                    </h3>
                    <div className="flex items-center gap-1 mt-1.5 mb-1">
                      <span className="flex items-center gap-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded w-fit">
                        {React.cloneElement(modeIcons[itemMode] as React.ReactElement, { size: 10 })}
                        {t(`mode_${itemMode}` as TranslationKey)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {formatDate(item.timestamp, language)}
                    </p>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${gradeColors[item.grade]}`}>
                    {item.grade}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-md">
                      {t('sugar_label')}: {item.facts?.sugar ?? (item as any).sugar ?? 0}g
                    </span>
                    <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-md">
                      {t('fat_label')}: {item.facts?.saturatedFat ?? (item as any).saturatedFat ?? 0}g
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredAndSortedHistory.length === 0 && searchQuery && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Sort Modal (Bottom Sheet) */}
      {isSortModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSortModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <AlignLeft size={24} className="text-gray-800 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('sort_title')}</h2>
            </div>

            <div className="space-y-2">
              {[
                { id: SortOption.Newest, label: t('sort_newest'), icon: <ArrowDown size={18} /> },
                { id: SortOption.Oldest, label: t('sort_oldest'), icon: <ArrowUp size={18} /> },
                { id: SortOption.BestGrade, label: t('sort_best'), icon: <Star size={18} className="fill-current" /> },
                { id: SortOption.WorstGrade, label: t('sort_worst'), icon: <Star size={18} /> },
              ].map((option) => {
                const isActive = sortOption === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSortSelect(option.id)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {option.icon}
                      </div>
                      <span className={`font-medium text-base ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        {option.label}
                      </span>
                    </div>
                    {isActive && <Check size={20} className="text-green-600 dark:text-green-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Bottom Sheet) */}
      {itemToDelete && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setItemToDelete(null)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('delete_title')}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t('delete_desc')}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  onDelete(itemToDelete);
                  setItemToDelete(null);
                }}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
};
