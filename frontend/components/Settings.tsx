import React, { useState } from 'react';
import { AppTheme, AppLanguage, ScanMode } from '../types.ts';
import { 
  Palette, Globe, Info, ChevronRight, ArrowLeft, 
  Smartphone, Sun, Moon, Circle, CircleDot, Activity, User, Mail, Link
} from 'lucide-react';
import { TranslationKey } from '../utils/i18n.ts';
import { Logo } from './Logo.tsx';
import { getDefaultScanMode, setDefaultScanMode } from '../services/storageService.ts';
import { getModeIcon } from './Scanner.tsx';

type SettingsView = 'main' | 'theme' | 'language' | 'mode' | 'about';

interface SettingsProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  t: (key: TranslationKey) => string;
}

export const Settings: React.FC<SettingsProps> = ({ 
  theme, onThemeChange, language, onLanguageChange, t 
}) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [defaultMode, setDefaultModeState] = useState<ScanMode>(getDefaultScanMode());

  const handleModeChange = (mode: ScanMode) => {
    setDefaultModeState(mode);
    setDefaultScanMode(mode);
  };

  const renderMain = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full max-w-3xl mx-auto">
      <div className="p-4 bg-white dark:bg-gray-900 z-10 sticky top-0">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white pt-4 pb-2">{t('settings_title')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-6 space-y-3">
        <button 
          onClick={() => setCurrentView('mode')}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <Activity size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{t('default_mode')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t(`mode_${defaultMode}` as TranslationKey)}</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button 
          onClick={() => setCurrentView('theme')}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <Palette size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{t('theme')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('theme_desc')}</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button 
          onClick={() => setCurrentView('language')}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <Globe size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{t('language')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('language_desc')}</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button 
          onClick={() => setCurrentView('about')}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <Info size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{t('about')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('about_desc')}</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );

  const renderHeader = (title: string) => (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 z-10 sticky top-0 pt-8">
      <button 
        onClick={() => setCurrentView('main')}
        className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );

  const renderOptionItem = (
    isActive: boolean, 
    onClick: () => void, 
    icon: React.ReactNode, 
    title: string, 
    description: string
  ) => (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
        isActive
          ? 'bg-[#f0fdf4] border-[#16a34a] dark:bg-green-900/20 dark:border-green-500'
          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isActive ? 'bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {icon}
        </div>
        <div>
          <h3 className={`font-bold text-base ${isActive ? 'text-[#16a34a] dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-0.5 ${isActive ? 'text-green-700/80 dark:text-green-300/80' : 'text-gray-500 dark:text-gray-400'}`}>
            {description}
          </p>
        </div>
      </div>
      {isActive ? (
        <CircleDot className="text-[#16a34a] dark:text-green-400 shrink-0 ml-2" size={24} />
      ) : (
        <Circle className="text-gray-300 dark:text-gray-600 shrink-0 ml-2" size={24} />
      )}
    </div>
  );

  const renderMode = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full max-w-3xl mx-auto">
      {renderHeader(t('default_mode'))}
      <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-6 space-y-4">
        <p className="text-gray-600 dark:text-gray-400 mb-2">{t('default_mode_desc')}</p>
        
        {Object.values(ScanMode).map((mode) => (
          renderOptionItem(
            defaultMode === mode,
            () => handleModeChange(mode),
            getModeIcon(mode),
            t(`mode_${mode}` as TranslationKey),
            t(`mode_desc_${mode}` as TranslationKey)
          )
        ))}
      </div>
    </div>
  );

  const renderTheme = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full max-w-3xl mx-auto">
      {renderHeader(t('theme'))}
      <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-6 space-y-4">
        <p className="text-gray-600 dark:text-gray-400 mb-2">{t('theme_desc')}</p>
        
        {renderOptionItem(
          theme === AppTheme.System,
          () => onThemeChange(AppTheme.System),
          <Smartphone size={20} />,
          t('theme_system'),
          t('theme_system_desc')
        )}
        
        {renderOptionItem(
          theme === AppTheme.Light,
          () => onThemeChange(AppTheme.Light),
          <Sun size={20} />,
          t('theme_light'),
          t('theme_light_desc')
        )}
        
        {renderOptionItem(
          theme === AppTheme.Dark,
          () => onThemeChange(AppTheme.Dark),
          <Moon size={20} />,
          t('theme_dark'),
          t('theme_dark_desc')
        )}
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full max-w-3xl mx-auto">
      {renderHeader(t('language'))}
      <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-6 space-y-4">
        <p className="text-gray-600 dark:text-gray-400 mb-2">{t('language_desc')}</p>
        
        {renderOptionItem(
          language === AppLanguage.ID,
          () => onLanguageChange(AppLanguage.ID),
          <span className="text-lg">🇮🇩</span>,
          t('lang_id'),
          t('lang_id_desc')
        )}
        
        {renderOptionItem(
          language === AppLanguage.EN,
          () => onLanguageChange(AppLanguage.EN),
          <span className="text-lg">🇬🇧</span>,
          t('lang_en'),
          t('lang_en_desc')
        )}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full max-w-3xl mx-auto">
      {renderHeader(t('about'))}
      <div className="flex-1 overflow-y-auto p-6 pb-28 md:pb-6 flex flex-col items-center text-center">
        <Logo className="w-24 h-24 mb-6 shadow-sm rounded-3xl" />
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{t('about_app_name')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">{t('about_version')}</p>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 w-full">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
            {t('about_description')}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 w-full text-left">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-green-600 dark:text-green-400" />
            <h4 className="font-bold text-gray-900 dark:text-white">{t('dev_info')}</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dev_name')}</p>
              <p className="font-medium text-gray-900 dark:text-white">Gusti Ngurah Mertayasa</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dev_email')}</p>
              <a href="mailto:gusti.ngurah.mertayasa@gmail.com" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                <Mail size={16} />
                <span className="text-sm">gusti.ngurah.mertayasa@gmail.com</span>
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dev_linkedin')}</p>
              <a href="https://linkedin.com/in/gusti-ngurah-mertayasa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                <Link size={16} />
                <span className="text-sm">gusti-ngurah-mertayasa</span>
              </a>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto">
          {t('about_tech')}
        </p>
      </div>
    </div>
  );

  switch (currentView) {
    case 'mode': return renderMode();
    case 'theme': return renderTheme();
    case 'language': return renderLanguage();
    case 'about': return renderAbout();
    default: return renderMain();
  }
};
