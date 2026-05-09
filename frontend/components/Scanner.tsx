import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Camera, Loader2, AlertCircle, Activity, Scale, Droplet, 
  Baby, HeartHandshake, Smile, HeartPulse, Dumbbell, ChevronDown,
  Target, Zap, Brain, ShieldCheck, MessageCircle, Plus, Minus, X
} from 'lucide-react';
import { analyzeNutritionLabel } from '../services/geminiService.ts';
import { getDefaultScanMode } from '../services/storageService.ts';
import { ScanResult, NutriGrade, AppLanguage, ScanMode } from '../types.ts';
import { TranslationKey } from '../utils/i18n.ts';
import { Logo } from './Logo.tsx';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
  t: (key: TranslationKey) => string;
  language: AppLanguage;
}

export const getModeIcon = (mode: ScanMode, size = 16) => {
  switch (mode) {
    case ScanMode.Normal: return <Activity size={size} />;
    case ScanMode.Diet: return <Scale size={size} />;
    case ScanMode.Diabetes: return <Droplet size={size} />;
    case ScanMode.Pregnancy: return <Baby size={size} />;
    case ScanMode.Breastfeeding: return <HeartHandshake size={size} />;
    case ScanMode.Kids: return <Smile size={size} />;
    case ScanMode.Hypertension: return <HeartPulse size={size} />;
    case ScanMode.Fitness: return <Dumbbell size={size} />;
    default: return <Activity size={size} />;
  }
};

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-[2rem] mb-4 overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-6 py-5 flex justify-between items-center text-left"
      >
        <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base pr-4 leading-relaxed">{question}</span>
        <div className={`w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-gray-100 dark:bg-gray-700' : 'bg-transparent'}`}>
          {isOpen ? (
            <Minus size={18} className="text-gray-600 dark:text-gray-300" />
          ) : (
            <Plus size={18} className="text-gray-600 dark:text-gray-300" />
          )}
        </div>
      </button>
      <div 
        className={`px-6 text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, t, language }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<ScanMode>(ScanMode.Normal);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentMode(getDefaultScanMode());
  }, []);

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
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImage(compressedBase64);
        } else {
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
      const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
      const analysis = await analyzeNutritionLabel(image, mimeType, currentMode);
      
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
        recommendation: analysis.recommendation,
        mode: currentMode,
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
    <div className="flex flex-col items-center w-full h-full bg-white dark:bg-gray-900 overflow-y-auto relative">
      
      {/* Top Section: Scanner Area */}
      <div className="w-full flex flex-col items-center justify-start pt-8 pb-8 px-6 bg-gradient-to-b from-green-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-b-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-10">
        
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Logo className="w-20 h-20 mb-4 shadow-sm rounded-3xl" />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{t('app_title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('app_subtitle')}</p>
          </div>

          {/* Mode Selector - Horizontal Scroll */}
          {!image && (
            <div className="w-full mb-6">
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{t('choose_scan_mode')}</h3>
                <span className="text-xs font-bold text-green-600 dark:text-green-400">{t(`mode_${currentMode}` as TranslationKey)}</span>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                {Object.values(ScanMode).map((mode) => {
                  const isActive = currentMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setCurrentMode(mode)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap shrink-0 ${
                        isActive 
                          ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20' 
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {getModeIcon(mode, 16)}
                      <span className="text-sm font-medium">{t(`mode_${mode}` as TranslationKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Camera / Image Area */}
          {!image ? (
            <label 
              htmlFor="camera-input"
              className="w-full aspect-[4/5] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[2.5rem] flex flex-col items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer shadow-sm"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                <Camera size={32} />
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('tap_to_scan')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('upload_gallery')}</p>
            </label>
          ) : (
            <div className="w-full flex flex-col items-center animate-[slideUp_0.3s_ease-out]">
              <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl mb-6 bg-gray-100 dark:bg-gray-800 shrink-0 border-4 border-white dark:border-gray-800">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                
                {/* Subtle gradient overlay at the bottom for a premium look */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                
                {!isAnalyzing && (
                  <button 
                    onClick={reset}
                    className="absolute top-4 right-4 bg-black/40 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-black/60 transition-all z-10 border border-white/20 shadow-lg"
                  >
                    <X size={20} />
                  </button>
                )}
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping"></div>
                      <Loader2 size={64} className="animate-spin text-green-400 relative z-10" />
                    </div>
                    <p className="text-2xl font-bold animate-pulse mb-2">{t('analyzing')}</p>
                    <p className="text-sm opacity-70 mb-8 font-medium tracking-wide uppercase">{t('ai_processing')}</p>
                    
                    <div className="absolute bottom-8 flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/20">
                      {getModeIcon(currentMode, 18)}
                      <span className="text-sm font-bold tracking-wide">{t(`mode_${currentMode}` as TranslationKey).toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>

              {!isAnalyzing && (
                <button
                  onClick={handleAnalyze}
                  className="w-full py-4.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_25px_rgba(34,197,94,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shrink-0 border border-green-400/20"
                  style={{ padding: '1.125rem' }}
                >
                  <Activity size={24} className="animate-pulse" />
                  <span>{t('analyze_btn')}</span>
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
      </div>

      {/* Hidden File Input */}
      <input 
        id="camera-input"
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Informational Sections (Only show when not scanning/analyzing) */}
      {!image && (
        <div className="w-full max-w-6xl mx-auto px-6 pt-10 pb-28 md:pb-10 space-y-14 bg-white dark:bg-gray-900">
          
          {/* How it works */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{t('how_it_works_title')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('how_it_works_subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Target size={32} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{t('step_1_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('step_1_desc')}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Camera size={32} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{t('step_2_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('step_2_desc')}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                  <Activity size={32} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{t('step_3_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('step_3_desc')}</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <div className="text-center mb-8">
              <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase mb-2 block">TENTANG NUTRI LENS</span>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{t('features_title')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('features_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Brain size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{t('feat_1_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('feat_1_desc')}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{t('feat_2_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('feat_2_desc')}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{t('feat_3_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('feat_3_desc')}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                  <MessageCircle size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{t('feat_4_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('feat_4_desc')}</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-3xl mx-auto w-full">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Plus size={24} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{t('faq_title')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('faq_subtitle')}</p>
            </div>

            <div className="flex flex-col gap-3">
              <FaqItem question={t('faq_1_q')} answer={t('faq_1_a')} />
              <FaqItem question={t('faq_2_q')} answer={t('faq_2_a')} />
              <FaqItem question={t('faq_3_q')} answer={t('faq_3_a')} />
              <FaqItem question={t('faq_4_q')} answer={t('faq_4_a')} />
            </div>
          </section>

        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};
