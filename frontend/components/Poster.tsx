import React, { useState, useEffect, useRef } from 'react';
import { ScanResult, PosterTheme, NutriGrade, AppLanguage, BilingualText, ScanMode } from '../types.ts';
import { Share2, Download, Droplets, Flame, Activity, Wheat, Pencil, Check, X, ArrowLeft, Loader2, Image as ImageIcon, Type, Info, ThumbsUp } from 'lucide-react';
import { TranslationKey } from '../utils/i18n.ts';
import { toBlob } from 'html-to-image';
import { modeIcons } from './Scanner.tsx';

interface PosterProps {
  result: ScanResult;
  theme: PosterTheme;
  onThemeChange: (theme: PosterTheme) => void;
  onClose: () => void;
  onUpdateResult: (result: ScanResult) => void;
  t: (key: TranslationKey) => string;
  language: AppLanguage;
}

const themeStyles: Record<PosterTheme, string> = {
  [PosterTheme.Midnight]: 'bg-slate-900 text-white border-slate-700',
  [PosterTheme.Cyber]: 'bg-black text-green-400 font-mono border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  [PosterTheme.Cream]: 'bg-[#fdfbf7] text-stone-800 border-stone-200',
  [PosterTheme.Lavender]: 'bg-purple-50 text-purple-900 border-purple-200',
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

const NutriGradeGraphic: React.FC<{ grade: NutriGrade }> = ({ grade }) => {
  const grades: NutriGrade[] = [NutriGrade.A, NutriGrade.B, NutriGrade.C, NutriGrade.D];
  const bgColors = {
    [NutriGrade.A]: 'bg-nutri-A',
    [NutriGrade.B]: 'bg-nutri-B',
    [NutriGrade.C]: 'bg-nutri-C',
    [NutriGrade.D]: 'bg-nutri-D',
  };

  return (
    <div className="inline-flex flex-col bg-white rounded-2xl border-[3px] border-gray-900 p-3 shadow-lg my-4">
      <div className="font-black text-gray-900 text-sm tracking-widest mb-2 ml-1 leading-none">NUTRI-GRADE</div>
      <div className="flex items-center relative h-12 mt-1">
        {/* The continuous colored bar */}
        <div className="flex h-full rounded-lg overflow-hidden border border-gray-900/10 w-full">
          {grades.map((g) => (
            <div key={`bg-${g}`} className={`w-14 h-full ${bgColors[g]}`}></div>
          ))}
        </div>

        {/* The letters and active highlight */}
        <div className="absolute inset-0 flex">
          {grades.map((g) => {
            const isActive = grade === g;
            return (
              <div key={`fg-${g}`} className="w-14 h-full flex items-center justify-center relative">
                {isActive ? (
                  <div className={`absolute w-16 h-16 rounded-full border-[4px] border-white flex items-center justify-center text-white font-black text-3xl z-10 shadow-md ${bgColors[g]}`} style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    {g}
                  </div>
                ) : (
                  <span className="text-white font-bold text-xl opacity-90 drop-shadow-sm">{g}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Poster: React.FC<PosterProps> = ({ result, theme, onThemeChange, onClose, onUpdateResult, t, language }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  const localizedProductName = getLocalizedText(result.productName, language);
  const localizedReasoning = getLocalizedText(result.reasoning, language);
  const localizedWhy = getLocalizedText(result.whyThisGrade, language);
  const localizedRec = getLocalizedText(result.recommendation, language);
  const itemMode = result.mode || ScanMode.NORMAL;
  
  const shareTextContent = `${t('app_title')}: ${localizedProductName}\n${t('share_grade')}${result.grade} (${t(`mode_${itemMode}` as TranslationKey)})\n\n${localizedReasoning}\n\n${t('recommendation_for_you')}: ${localizedRec}`;

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleShareImage = async () => {
    const node = document.getElementById('poster-node');
    if (!node) return;

    setIsGeneratingImage(true);
    try {
      // Generate image blob from the DOM node
      const blob = await toBlob(node, {
        quality: 0.95,
        pixelRatio: 2, // Higher resolution
        cacheBust: true,
      });

      if (!blob) throw new Error('Failed to generate image blob');

      const fileName = `nutrilens-${result.id}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareData = {
        title: `${t('app_title')}: ${localizedProductName}`,
        text: shareTextContent,
        files: [file]
      };

      // Check if the browser supports sharing files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        // Fallback: Download the image if sharing files is not supported
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert(t('share_error_image'));
    } finally {
      setIsGeneratingImage(false);
      setIsShareModalOpen(false);
    }
  };

  const handleShareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('app_title')}: ${localizedProductName}`,
          text: shareTextContent,
          url: window.location.href,
        });
      } catch (e) {
        console.error('Text share failed', e);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareTextContent}\n${window.location.href}`);
      alert(t('copied_to_clipboard'));
    }
    setIsShareModalOpen(false);
  };

  const handleEditClick = () => {
    setEditValue(localizedProductName);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() === '') {
      setIsEditing(false);
      return;
    }

    const updatedResult = { ...result };
    
    if (typeof updatedResult.productName === 'string') {
      updatedResult.productName = editValue;
    } else {
      updatedResult.productName = {
        ...updatedResult.productName,
        [language]: editValue
      };
    }

    onUpdateResult(updatedResult);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('share_title')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleEditClick}
            className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title={t('edit_name')}
          >
            <Pencil size={20} />
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)} 
            className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hide-scrollbar z-20 relative">
        {Object.values(PosterTheme).map((t_theme) => (
          <button
            key={t_theme}
            onClick={() => onThemeChange(t_theme)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              theme === t_theme 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t_theme}
          </button>
        ))}
      </div>

      {/* Poster Canvas Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-12 flex flex-col items-center">
        <div 
          id="poster-node"
          className={`w-full max-w-md rounded-2xl overflow-hidden border-2 transition-all duration-300 my-auto shrink-0 ${themeStyles[theme]}`}
        >
          {/* Image Header */}
          <div className="relative h-48 w-full bg-gray-200">
            <img 
              src={result.imageUrl} 
              alt={localizedProductName} 
              className="w-full h-full object-cover opacity-80 mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white drop-shadow-md truncate">
                {localizedProductName}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-current/10 mb-2">
                {React.cloneElement(modeIcons[itemMode] as React.ReactElement, { size: 14 })}
                <span className="text-xs font-bold uppercase tracking-wider">{t(`mode_${itemMode}` as TranslationKey)}</span>
              </div>
              <NutriGradeGraphic grade={result.grade} />
            </div>

            <p className={`text-lg italic opacity-90 text-center font-medium ${theme === PosterTheme.Cyber ? 'text-green-300' : ''}`}>
              "{localizedReasoning}"
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-xl flex items-center gap-3 ${theme === PosterTheme.Midnight ? 'bg-slate-800' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Flame className="text-orange-500" size={24} />
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">{t('calories')}</p>
                  <p className="font-bold text-lg">{result.facts?.calories ?? (result as any).calories ?? 0} <span className="text-sm font-normal">kcal</span></p>
                </div>
              </div>
              <div className={`p-3 rounded-xl flex items-center gap-3 ${theme === PosterTheme.Midnight ? 'bg-slate-800' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Droplets className="text-blue-500" size={24} />
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">{t('sugar')}</p>
                  <p className="font-bold text-lg">{result.facts?.sugar ?? (result as any).sugar ?? 0} <span className="text-sm font-normal">g</span></p>
                </div>
              </div>
              <div className={`p-3 rounded-xl flex items-center gap-3 ${theme === PosterTheme.Midnight ? 'bg-slate-800' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Activity className="text-red-500" size={24} />
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">{t('sat_fat')}</p>
                  <p className="font-bold text-lg">{result.facts?.saturatedFat ?? (result as any).saturatedFat ?? 0} <span className="text-sm font-normal">g</span></p>
                </div>
              </div>
              <div className={`p-3 rounded-xl flex items-center gap-3 ${theme === PosterTheme.Midnight ? 'bg-slate-800' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Wheat className="text-amber-500" size={24} />
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">{t('fiber')}</p>
                  <p className="font-bold text-lg">{result.facts?.fiber ?? (result as any).fiber ?? 0} <span className="text-sm font-normal">g</span></p>
                </div>
              </div>
            </div>

            {/* Detailed Insights (Only show if available) */}
            {(localizedWhy || localizedRec) && (
              <div className="space-y-4 pt-4 border-t border-current/10">
                {localizedWhy && (
                  <div className="flex gap-3">
                    <Info className="shrink-0 mt-0.5 opacity-70" size={18} />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{t('why_this_grade')}</h4>
                      <p className="text-sm leading-relaxed">{localizedWhy}</p>
                    </div>
                  </div>
                )}
                {localizedRec && (
                  <div className="flex gap-3">
                    <ThumbsUp className="shrink-0 mt-0.5 opacity-70" size={18} />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{t('recommendation_for_you')}</h4>
                      <p className="text-sm leading-relaxed">{localizedRec}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-current/10 flex justify-between items-center text-xs opacity-50">
              <span>{t('scanned_with')}</span>
              <span>{formatDate(result.timestamp, language)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 pb-8 bg-white dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 z-20 relative shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        {t('share_text')}
      </div>

      {/* Share Options Modal (Bottom Sheet) */}
      {isShareModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsShareModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Share2 size={24} className="text-gray-800 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('share_options_title')}</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleShareImage}
                disabled={isGeneratingImage}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 border border-gray-100 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-800 transition-all disabled:opacity-70"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  {isGeneratingImage ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('share_image')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('share_image_desc')}</p>
                </div>
              </button>

              <button
                onClick={handleShareText}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Type size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('share_text_only')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('share_text_desc')}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal (Bottom Sheet) */}
      {isEditing && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditing(false)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Pencil size={24} className="text-gray-800 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit_name')}</h2>
            </div>

            <div className="space-y-4">
              <input
                ref={editInputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl py-4 px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder={t('edit_name')}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                >
                  Save
                </button>
              </div>
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
