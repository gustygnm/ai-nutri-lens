import React, { useState, useRef, useEffect } from 'react';
import { ScanResult, PosterTheme, NutriGrade, AppLanguage, BilingualText, ScanMode } from '../types.ts';
import { Share2, Download, Droplets, Flame, Activity, Wheat, Pencil, Check, X, ArrowLeft, Loader2, Image as ImageIcon, Type, Info, ThumbsUp, Trash2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { TranslationKey } from '../utils/i18n.ts';
import { toBlob } from 'html-to-image';
import { getModeIcon } from './Scanner.tsx';

interface PosterProps {
  result: ScanResult;
  theme: PosterTheme;
  onThemeChange: (theme: PosterTheme) => void;
  onClose: () => void;
  onUpdateResult: (result: ScanResult) => void;
  onDeleteResult: (id: string) => void;
  t: (key: TranslationKey) => string;
  language: AppLanguage;
}

const themeStyles: Record<PosterTheme, string> = {
  [PosterTheme.Midnight]: 'bg-[#111827] text-white border-slate-800',
  [PosterTheme.Cyber]: 'bg-black text-green-400 font-mono border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  [PosterTheme.Cream]: 'bg-[#fdfbf7] text-stone-800 border-stone-200',
  [PosterTheme.Lavender]: 'bg-purple-50 text-purple-900 border-purple-200',
};

const getLocalizedText = (text: BilingualText | string, lang: AppLanguage): string => {
  if (typeof text === 'string') return text;
  if (text && typeof text === 'object') return text[lang] || text.en || '';
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
    <div className="bg-white rounded-2xl p-4 shadow-sm w-full max-w-[280px] mx-auto my-4">
      <div className="font-black text-gray-900 text-xs tracking-widest mb-3">NUTRI-GRADE</div>
      <div className="flex items-center relative h-10">
        {/* The continuous colored bar */}
        <div className="flex h-full rounded-lg overflow-hidden w-full">
          {grades.map((g) => (
            <div key={`bg-${g}`} className={`flex-1 h-full ${bgColors[g]}`}></div>
          ))}
        </div>

        {/* The letters and active highlight */}
        <div className="absolute inset-0 flex">
          {grades.map((g) => {
            const isActive = grade === g;
            return (
              <div key={`fg-${g}`} className="flex-1 h-full flex items-center justify-center relative">
                {isActive ? (
                  <div className={`absolute w-14 h-14 rounded-full border-[4px] border-white flex items-center justify-center text-white font-black text-2xl z-10 shadow-md ${bgColors[g]}`} style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    {g}
                  </div>
                ) : (
                  <span className="text-white font-bold text-lg opacity-90 drop-shadow-sm">{g}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Poster: React.FC<PosterProps> = ({ result, theme, onThemeChange, onClose, onUpdateResult, onDeleteResult, t, language }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const localizedProductName = getLocalizedText(result.productName, language);
  const localizedReasoning = getLocalizedText(result.reasoning, language);
  const localizedRecommendation = getLocalizedText(result.recommendation || {en: '', id: ''}, language);
  const itemMode = result.mode || ScanMode.Normal;
  const shareTextContent = `${t('share_scanned')}${localizedProductName}${t('share_grade')}${result.grade} (${t(`mode_${itemMode}` as TranslationKey)})! ${localizedReasoning}`;

  const handleShareImage = async () => {
    const node = document.getElementById('poster-node');
    if (!node) return;

    setIsGeneratingImage(true);
    try {
      const blob = await toBlob(node, {
        quality: 0.95,
        pixelRatio: 2,
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

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('Failed to generate image. Try sharing text instead.');
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
      navigator.clipboard.writeText(`${shareTextContent}\n${window.location.href}`);
      alert(t('copied_to_clipboard'));
    }
    setIsShareModalOpen(false);
  };

  const handleEditClick = () => {
    setEditValue(localizedProductName);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() === '') {
      setIsEditModalOpen(false);
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
    setIsEditModalOpen(false);
  };

  // Image Viewer Handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoomLevel === 1) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || zoomLevel === 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Calculate new position
    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;

    // Basic boundary constraints (can be improved for exact image bounds)
    const maxPan = (zoomLevel - 1) * 200; 
    newX = Math.max(Math.min(newX, maxPan), -maxPan);
    newY = Math.max(Math.min(newY, maxPan), -maxPan);

    setPanPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isImageViewerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      handleResetZoom();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isImageViewerOpen]);


  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative w-full">
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
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
            title={t('delete')}
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={handleEditClick}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title={t('edit_name')}
          >
            <Pencil size={20} />
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)} 
            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors"
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
      <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-12 flex flex-col items-center bg-gray-50 dark:bg-gray-900">
        <div 
          id="poster-node"
          className={`w-full max-w-md rounded-2xl overflow-hidden border transition-all duration-300 my-auto shrink-0 ${themeStyles[theme]}`}
        >
          {/* Image Header */}
          <div className="relative h-56 w-full bg-gray-200 group cursor-pointer" onClick={() => setIsImageViewerOpen(true)}>
            <img 
              src={result.imageUrl} 
              alt={localizedProductName} 
              className="w-full h-full object-cover opacity-90 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* View Image Hint */}
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={18} />
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-2xl font-bold text-white drop-shadow-md truncate">
                  {localizedProductName}
                </h3>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm text-white text-[10px] font-medium w-fit">
                  {getModeIcon(itemMode, 12)}
                  {t(`mode_${itemMode}` as TranslationKey).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            <div className="flex justify-center">
              <NutriGradeGraphic grade={result.grade} />
            </div>

            <p className={`text-sm italic opacity-90 text-justify leading-relaxed ${theme === PosterTheme.Cyber ? 'text-green-300' : ''}`}>
              "{localizedReasoning}"
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 ${theme === PosterTheme.Midnight ? 'bg-slate-800/80' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Flame className="text-orange-500 mb-1" size={20} />
                <p className="text-[10px] opacity-70 uppercase tracking-wider">{t('calories')}</p>
                <p className="font-bold text-lg leading-none">{result.facts?.calories ?? (result as any).calories ?? 0} <span className="text-xs font-normal">kcal</span></p>
              </div>
              <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 ${theme === PosterTheme.Midnight ? 'bg-slate-800/80' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Droplets className="text-blue-500 mb-1" size={20} />
                <p className="text-[10px] opacity-70 uppercase tracking-wider">{t('sugar')}</p>
                <p className="font-bold text-lg leading-none">{result.facts?.sugar ?? (result as any).sugar ?? 0} <span className="text-xs font-normal">g</span></p>
              </div>
              <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 ${theme === PosterTheme.Midnight ? 'bg-slate-800/80' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Activity className="text-red-500 mb-1" size={20} />
                <p className="text-[10px] opacity-70 uppercase tracking-wider">{t('sat_fat')}</p>
                <p className="font-bold text-lg leading-none">{result.facts?.saturatedFat ?? (result as any).saturatedFat ?? 0} <span className="text-xs font-normal">g</span></p>
              </div>
              <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 ${theme === PosterTheme.Midnight ? 'bg-slate-800/80' : theme === PosterTheme.Cyber ? 'bg-green-900/30 border border-green-800' : 'bg-black/5'}`}>
                <Wheat className="text-amber-500 mb-1" size={20} />
                <p className="text-[10px] opacity-70 uppercase tracking-wider">{t('fiber')}</p>
                <p className="font-bold text-lg leading-none">{result.facts?.fiber ?? (result as any).fiber ?? 0} <span className="text-xs font-normal">g</span></p>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-4 pt-4 border-t border-current border-opacity-20">
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-70">
                  <Info size={16} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">{t('why_this_grade')}</h4>
                </div>
                <p className="text-sm opacity-90 leading-relaxed text-justify">
                  {localizedReasoning}
                </p>
              </div>
              
              {localizedRecommendation && (
                <div>
                  <div className="flex items-center gap-2 mb-2 opacity-70">
                    <ThumbsUp size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">{t('recommendation')}</h4>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed text-justify">
                    {localizedRecommendation}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-current border-opacity-20 flex justify-between items-center text-[10px] opacity-50">
              <span>{t('scanned_with')}</span>
              <span>{formatDate(result.timestamp, language)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Name Modal (Bottom Sheet) */}
      {isEditModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out] md:max-w-md md:mx-auto md:w-full md:mb-auto md:mt-24 md:rounded-3xl">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Pencil size={24} className="text-gray-800 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit_name')}</h2>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder={t('edit_name')}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  }
                }}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Bottom Sheet) */}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out] md:max-w-md md:mx-auto md:w-full md:mb-auto md:mt-24 md:rounded-3xl">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('delete_title')}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t('delete_desc')}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  onDeleteResult(result.id);
                  setIsDeleteModalOpen(false);
                }}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Options Modal (Bottom Sheet) */}
      {isShareModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsShareModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out] md:max-w-md md:mx-auto md:w-full md:mb-auto md:mt-24 md:rounded-3xl">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6 md:hidden"></div>
            
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

      {/* Fullscreen Image Viewer */}
      {isImageViewerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center p-4 text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
            <button 
              onClick={() => setIsImageViewerOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors disabled:opacity-50"
              >
                <ZoomOut size={24} />
              </button>
              <button 
                onClick={handleResetZoom}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors text-sm font-medium"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors disabled:opacity-50"
              >
                <ZoomIn size={24} />
              </button>
            </div>
          </div>
          
          <div 
            ref={containerRef}
            className="flex-1 overflow-hidden flex items-center justify-center touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <img 
              ref={imageRef}
              src={result.imageUrl} 
              alt={localizedProductName} 
              className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
              style={{ 
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              draggable={false}
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
};
