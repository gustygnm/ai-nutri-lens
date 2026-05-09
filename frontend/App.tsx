import React, { useState, useEffect, useCallback } from 'react';
import { Scanner } from './components/Scanner.tsx';
import { History } from './components/History.tsx';
import { Poster } from './components/Poster.tsx';
import { Settings } from './components/Settings.tsx';
import { 
  getHistory, saveScan, deleteScan, updateScan,
  getAppTheme, setAppTheme, getAppLanguage, setAppLanguage 
} from './services/storageService.ts';
import { ScanResult, PosterTheme, AppTheme, AppLanguage } from './types.ts';
import { Camera, Clock, Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from './utils/i18n.ts';
import { Logo } from './components/Logo.tsx';

type Tab = 'scan' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [posterTheme, setPosterTheme] = useState<PosterTheme>(PosterTheme.Midnight);
  
  // Settings State
  const [theme, setThemeState] = useState<AppTheme>(getAppTheme());
  const [language, setLanguageState] = useState<AppLanguage>(getAppLanguage());

  const t = useTranslation(language);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Handle Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      const isDark = theme === AppTheme.Dark || 
        (theme === AppTheme.System && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes if set to system
    if (theme === AppTheme.System) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const handleThemeChange = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    setAppTheme(newTheme);
  }, []);

  const handleLanguageChange = useCallback((newLang: AppLanguage) => {
    setLanguageState(newLang);
    setAppLanguage(newLang);
  }, []);

  const handleScanComplete = useCallback((result: ScanResult) => {
    saveScan(result);
    setHistory(getHistory());
    setSelectedResult(result);
  }, []);

  const handleDeleteScan = useCallback((id: string) => {
    deleteScan(id);
    setHistory(getHistory());
  }, []);

  const handleDeleteFromPoster = useCallback((id: string) => {
    deleteScan(id);
    setHistory(getHistory());
    setSelectedResult(null);
  }, []);

  const handleUpdateScan = useCallback((updatedResult: ScanResult) => {
    updateScan(updatedResult);
    setHistory(getHistory());
    setSelectedResult(updatedResult);
  }, []);

  const handleClosePoster = useCallback(() => {
    setSelectedResult(null);
  }, []);

  return (
    <div className="h-[100dvh] w-full bg-white dark:bg-gray-900 flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      
      {/* Navigation - Bottom on Mobile, Sidebar on Tablet/Desktop */}
      <nav className={`
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 z-50
        ${selectedResult ? 'hidden md:flex' : 'flex'}
        fixed bottom-0 w-full flex-row justify-around pb-safe pt-2 px-2 border-t shadow-[0_-10px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.3)]
        md:relative md:w-24 lg:w-64 md:h-screen md:flex-col md:justify-start md:pt-8 md:px-4 md:border-t-0 md:border-r md:shadow-none
      `}>
        
        {/* Logo for Desktop Sidebar */}
        <div className="hidden md:flex items-center justify-center mb-10 lg:justify-start lg:px-2 w-full">
          <Logo className="w-10 h-10 lg:w-8 lg:h-8 shrink-0 shadow-sm rounded-xl" />
          <span className="hidden lg:block font-extrabold text-xl text-gray-900 dark:text-white ml-3 truncate">Nutri Lens</span>
        </div>

        <button 
          onClick={() => { setActiveTab('scan'); setSelectedResult(null); }}
          className={`
            flex flex-col items-center p-2 w-20 rounded-xl transition-colors
            md:w-16 md:h-16 md:justify-center md:mb-4
            lg:w-full lg:h-auto lg:flex-row lg:justify-start lg:px-4 lg:py-3 lg:mb-2
            ${activeTab === 'scan' && !selectedResult ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
          `}
        >
          <Camera size={24} className="mb-1 md:mb-0 lg:mr-4 shrink-0" />
          <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium">{t('nav_scan')}</span>
        </button>
        
        <button 
          onClick={() => { setActiveTab('history'); setSelectedResult(null); }}
          className={`
            flex flex-col items-center p-2 w-20 rounded-xl transition-colors
            md:w-16 md:h-16 md:justify-center md:mb-4
            lg:w-full lg:h-auto lg:flex-row lg:justify-start lg:px-4 lg:py-3 lg:mb-2
            ${activeTab === 'history' && !selectedResult ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
          `}
        >
          <Clock size={24} className="mb-1 md:mb-0 lg:mr-4 shrink-0" />
          <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium">{t('nav_history')}</span>
        </button>
        
        <button 
          onClick={() => { setActiveTab('settings'); setSelectedResult(null); }}
          className={`
            flex flex-col items-center p-2 w-20 rounded-xl transition-colors
            md:w-16 md:h-16 md:justify-center md:mb-4
            lg:w-full lg:h-auto lg:flex-row lg:justify-start lg:px-4 lg:py-3 lg:mb-2
            ${activeTab === 'settings' && !selectedResult ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
          `}
        >
          <SettingsIcon size={24} className="mb-1 md:mb-0 lg:mr-4 shrink-0" />
          <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium">{t('nav_settings')}</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {selectedResult ? (
          <Poster 
            result={selectedResult} 
            theme={posterTheme} 
            onThemeChange={setPosterTheme}
            onClose={handleClosePoster}
            onUpdateResult={handleUpdateScan}
            onDeleteResult={handleDeleteFromPoster}
            t={t}
            language={language}
          />
        ) : (
          <>
            {activeTab === 'scan' && <Scanner onScanComplete={handleScanComplete} t={t} language={language} />}
            {activeTab === 'history' && <History history={history} onSelect={setSelectedResult} onDelete={handleDeleteScan} t={t} language={language} />}
            {activeTab === 'settings' && <Settings theme={theme} onThemeChange={handleThemeChange} language={language} onLanguageChange={handleLanguageChange} t={t} />}
          </>
        )}
      </main>

    </div>
  );
}
