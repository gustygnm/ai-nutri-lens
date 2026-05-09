import { ScanResult, AppTheme, AppLanguage, ScanMode } from '../types.ts';

const STORAGE_KEY = 'nutrilap_history';
const THEME_KEY = 'nutrilens_theme';
const LANG_KEY = 'nutrilens_lang';
const MODE_KEY = 'nutrilens_mode';

export const getHistory = (): ScanResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load history', error);
    return [];
  }
};

export const saveScan = (scan: ScanResult): void => {
  try {
    const history = getHistory();
    history.unshift(scan); // Add to beginning
    
    // Batasi riwayat maksimal 30 item agar LocalStorage tidak penuh (Limit browser biasanya 5MB)
    if (history.length > 30) {
      history.length = 30;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save scan', error);
    alert('Gagal menyimpan ke riwayat. Penyimpanan browser penuh.');
  }
};

export const updateScan = (updatedScan: ScanResult): void => {
  try {
    const history = getHistory();
    const index = history.findIndex(scan => scan.id === updatedScan.id);
    if (index !== -1) {
      history[index] = updatedScan;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to update scan', error);
  }
};

export const deleteScan = (id: string): void => {
  try {
    const history = getHistory();
    const updated = history.filter(scan => scan.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete scan', error);
  }
};

export const getAppTheme = (): AppTheme => {
  return (localStorage.getItem(THEME_KEY) as AppTheme) || AppTheme.System;
};

export const setAppTheme = (theme: AppTheme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getAppLanguage = (): AppLanguage => {
  return (localStorage.getItem(LANG_KEY) as AppLanguage) || AppLanguage.ID;
};

export const setAppLanguage = (lang: AppLanguage): void => {
  localStorage.setItem(LANG_KEY, lang);
};

export const getDefaultScanMode = (): ScanMode => {
  return (localStorage.getItem(MODE_KEY) as ScanMode) || ScanMode.NORMAL;
};

export const setDefaultScanMode = (mode: ScanMode): void => {
  localStorage.setItem(MODE_KEY, mode);
};
