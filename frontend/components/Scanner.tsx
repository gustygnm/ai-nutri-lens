import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, AlertCircle, Activity, Target, Droplet, Baby, HeartHandshake, Smile, HeartPulse, Dumbbell } from 'lucide-react';
import { analyzeNutritionLabel } from '../services/geminiService.ts';
import { ScanResult, NutriGrade, AppLanguage, ScanMode } from '../types.ts';
import { TranslationKey } from '../utils/i18n.ts';
import { Logo } from './Logo.tsx';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
  t: (key: TranslationKey) => string;
  language: AppLanguage;
  defaultMode: ScanMode;
}

export const modeIcons: Record<ScanMode, React.ReactNode> = {
  [ScanMode.NORMAL]: <Activity size={18} />,
  [ScanMode.DIET]: <Target size={18} />,
  [ScanMode.DIABETES]: <Droplet size={18} />,
  [ScanMode.PREGNANCY]: <Baby size={18} />,
  [ScanMode.BREASTFEEDING]: <HeartHandshake size={18} />,
  [ScanMode.KIDS]: <Smile size={18} />,
  [ScanMode.HYPERTENSION]: <HeartPulse size={18} />,
  [ScanMode.FITNESS]: <Dumbbell size={18} />,
};

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, t, language, defaultMode }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ScanMode>(defaultMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('invalid_image'));
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      // Kompresi gambar untuk mencegah LocalStorage penuh (QuotaExceededError)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Resolusi maksimal yang cukup untuk OCR Gemini
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Kompres ke JPEG dengan kualitas 70% untuk menghemat size Base64
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImage(compressedBase64);
        } else {
          // Fallback jika canvas gagal
          setImage(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      // Extract mime type from data URL
      const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
      
      const analysis = await analyzeNutritionLabel(image, mimeType, selectedMode);
      
      // Fallback ID generator jika crypto.randomUUID tidak tersedia di browser tertentu
      const generateId = () => {
        if (typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function') {
          return window.crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
      };

      const result: ScanResult = {
        id: generateId(),
        timestamp: Date.now(),
        imageUrl: image,
        productName: analysis.productName,
        grade: analysis.grade,
        reasoning: analysis.reasoning,
        whyThisGrade: analysis.whyThisGrade,
        recommendation: analysis.recommendation,
        mode: selectedMode,
        facts: {
          calories: analysis.calories,
          sugar: analysis.sugar,
          saturatedFat: analysis.saturatedFat,
          sodium: analysis.sodium,
          protein: analysis.protein,
          fiber: analysis.fiber,
        }
      };

      onScanComplete(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('analyze_error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto w-full h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="w-full flex flex-col items-center justify-center my-auto py-4 min-h-[min-content]">
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo className="w-16 h-16 mb-4 shadow-sm rounded-2xl" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('app_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('app_subtitle')}</p>
        </div>

        {/* Mode Selector */}
        {!isAnalyzing && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('choose_scan_mode')}</span>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
                {t(`mode_${selectedMode}` as TranslationKey)}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x">
              {Object.values(ScanMode).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all snap-start shrink-0 border ${
                    selectedMode === mode 
                      ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                >
                  {modeIcons[mode]}
                  {t(`mode_${mode}` as TranslationKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {!image ? (
          <label 
            htmlFor="camera-input"
            className="w-full aspect-[4/5] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl flex flex-col items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer shadow-sm"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
              <Camera size={32} />
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('tap_to_scan')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('upload_gallery')}</p>
          </label>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-lg mb-6 bg-black shrink-0">
              <img src={image} alt="Preview" className="w-full h-full object-contain" />
              {!isAnalyzing && (
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70"
                >
                  ✕
                </button>
              )}
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 size={48} className="animate-spin mb-4 text-green-400" />
                  <p className="text-lg font-medium animate-pulse">{t('analyzing')}</p>
                  <p className="text-sm opacity-70 mt-2">{t('ai_processing')}</p>
                  <div className="mt-6 bg-black/40 px-4 py-2 rounded-full flex items-center gap-2">
                    {modeIcons[selectedMode]}
                    <span className="text-sm font-medium">{t(`mode_${selectedMode}` as TranslationKey)}</span>
                  </div>
                </div>
              )}
            </div>

            {!isAnalyzing && (
              <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <Activity size={24} />
                {t('analyze_btn')}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 w-full border border-red-100 dark:border-red-800/30 shrink-0">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <input 
        id="camera-input"
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
