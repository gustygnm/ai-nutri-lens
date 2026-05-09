import React, { useState, useEffect, useCallback } from 'react';
import { Scanner } from './components/Scanner.tsx';
import { History } from './components/History.tsx';
import { Poster } from './components/Poster.tsx';
import { Settings } from './components/Settings.tsx';
import { 
  getHistory, saveScan, deleteScan, updateScan,
  getAppTheme, setAppTheme, getAppLanguage, setAppLanguage,
  getDefaultScanMode, setDefaultScanMode
} from './services/storageService.ts';
import { ScanResult, PosterTheme, AppTheme, AppLanguage, ScanMode } from './types.ts';
import { Camera, Clock, Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from './utils/i18n.ts';

type Tab = 'scan' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [posterTheme, setPosterTheme] = useState<PosterTheme>(PosterTheme.Midnight);
  
  // Settings State
  const [theme, setThemeState] = useState<AppTheme>(getAppTheme());
  const [language, setLanguageState] = useState<AppLanguage>(getAppLanguage());
  const [defaultMode, setDefaultModeState] = useState<ScanMode>(getDefaultScanMode());

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

  const handleModeChange = useCallback((newMode: ScanMode) => {
    setDefaultModeState(newMode);
    setDefaultScanMode(newMode);
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

  const handleUpdateScan = useCallback((updatedResult: ScanResult) => {
    updateScan(updatedResult);
    setHistory(getHistory());
    setSelectedResult(updatedResult);
  }, []);

  const handleClosePoster = useCallback(() => {
    setSelectedResult(null);
  }, []);

  // If a result is selected, show the Poster view full screen
  if (selectedResult) {
    return (
      <div className="h-[100dvh] w-full max-w-md mx-auto bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative flex flex-col">
        <Poster 
          result={selectedResult} 
          theme={posterTheme} 
          onThemeChange={setPosterTheme}
          onClose={handleClosePoster}
          onUpdateResult={handleUpdateScan}
          t={t}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col relative transition-colors duration-300">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'scan' && (
          <Scanner 
            onScanComplete={handleScanComplete} 
            t={t} 
            language={language} 
            defaultMode={defaultMode}
          />
        )}
        {activeTab === 'history' && (
          <History 
            history={history} 
            onSelect={setSelectedResult} 
            onDelete={handleDeleteScan}
            t={t}
            language={language}
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            theme={theme}
            onThemeChange={handleThemeChange}
            language={language}
            onLanguageChange={handleLanguageChange}
            defaultMode={defaultMode}
            onModeChange={handleModeChange}
            t={t}
          />
        )}
      </main>

      {/* Bottom Navigation - Always on top with z-50 and extra bottom padding for mobile safe area */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around pb-6 pt-2 px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.3)] z-50 transition-colors duration-300 relative">
        <button 
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center p-2 w-20 rounded-xl transition-colors ${activeTab === 'scan' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <Camera size={24} className="mb-1" />
          <span className="text-[10px] font-medium">{t('nav_scan')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center p-2 w-20 rounded-xl transition-colors ${activeTab === 'history' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <Clock size={24} className="mb-1" />
          <span className="text-[10px] font-medium">{t('nav_history')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center p-2 w-20 rounded-xl transition-colors ${activeTab === 'settings' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <SettingsIcon size={24} className="mb-1" />
          <span className="text-[10px] font-medium">{t('nav_settings')}</span>
        </button>
      </nav>
    </div>
  );
}
