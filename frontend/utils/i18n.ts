import { AppLanguage } from '../types.ts';

export const translations = {
  en: {
    // Navigation
    nav_scan: 'Scan',
    nav_history: 'History',
    nav_settings: 'Settings',
    
    // Scanner
    app_title: 'Nutri Lens',
    app_subtitle: 'AI-Powered Nutrition Scanner',
    tap_to_scan: 'Tap to scan label',
    upload_gallery: 'or upload from gallery',
    analyzing: 'Analyzing Nutrition Facts...',
    ai_processing: 'Gemini AI is processing',
    analyze_btn: 'Analyze Label',
    invalid_image: 'Please upload a valid image file.',
    analyze_error: 'Failed to analyze image. Please try again.',
    choose_scan_mode: 'Choose Scan Mode',
    current_mode: 'Current Mode',
    
    // Scan Modes
    mode_normal: 'Normal Mode',
    mode_normal_desc: 'General health analysis',
    mode_diet: 'Weight Loss',
    mode_diet_desc: 'Focus on low calorie & high protein',
    mode_diabetes: 'Diabetes',
    mode_diabetes_desc: 'Focus on low sugar & complex carbs',
    mode_pregnancy: 'Pregnancy',
    mode_pregnancy_desc: 'Safe ingredients for expecting mothers',
    mode_breastfeeding: 'Breastfeeding',
    mode_breastfeeding_desc: 'Optimal nutrition for nursing',
    mode_kids: 'Kids',
    mode_kids_desc: 'Low sugar, minimal additives',
    mode_hypertension: 'Hypertension',
    mode_hypertension_desc: 'Focus on low sodium',
    mode_fitness: 'Fitness',
    mode_fitness_desc: 'High protein, recovery friendly',
    
    // History
    history_title: 'History',
    history_subtitle: 'Your recent nutrition scan history',
    search_placeholder: 'Search product...',
    no_scans: 'No Scans Yet',
    no_scans_desc: 'Your scan history will appear here.',
    delete_confirm: 'Delete this scan?',
    sort_title: 'Sort by',
    sort_newest: 'Newest',
    sort_oldest: 'Oldest',
    sort_best: 'Grade: Best (A → D)',
    sort_worst: 'Grade: Worst (D → A)',
    sugar_label: 'Sugar',
    fat_label: 'Fat',
    delete_title: 'Delete Scan?',
    delete_desc: 'This action cannot be undone. Are you sure you want to delete this scan from your history?',
    cancel: 'Cancel',
    delete: 'Delete',
    
    // Poster / Result
    share_title: 'Share Result',
    share_text: 'Take a screenshot to share this poster!',
    scanned_with: 'Scanned with Nutri Lens AI',
    calories: 'Calories',
    sugar: 'Sugar',
    sat_fat: 'Sat. Fat',
    fiber: 'Fiber',
    share_scanned: 'I scanned ',
    share_grade: ' and it got a Nutri-Grade ',
    edit_name: 'Edit Product Name',
    share_options_title: 'Share Options',
    share_image: 'Share Image',
    share_image_desc: 'Share as a beautiful poster',
    share_text_only: 'Share Text',
    share_text_desc: 'Share analysis text only',
    copied_to_clipboard: 'Copied to clipboard!',
    share_error_image: 'Failed to generate image. Try sharing text instead.',
    share_error_unsupported: 'Sharing is not supported on this device.',
    why_this_grade: 'Why this grade?',
    recommendation_for_you: 'Recommendation',
    
    // Settings
    settings_title: 'Settings',
    theme: 'Theme',
    theme_desc: 'Choose your preferred app appearance.',
    language: 'Language',
    language_desc: 'Choose your preferred language.',
    default_mode: 'Default Mode',
    default_mode_desc: 'Set your primary health goal.',
    about: 'About',
    about_desc: 'Information about Nutri Lens.',
    guide: 'User Guide',
    guide_desc: 'Learn how to use Nutri Lens effectively.',
    
    // Guide
    guide_how_to_use: 'How to Use',
    guide_step_1: '1. Choose your health goal in the Scan Mode selector.',
    guide_step_2: '2. Point your camera at a Nutrition Facts label or upload an image.',
    guide_step_3: '3. Wait for the AI to analyze and read your personalized insights.',
    guide_what_to_scan: 'What to Scan',
    guide_what_to_scan_desc: 'Scan the standard Nutrition Facts table found on the back of food packaging. Ensure the text is clear and readable.',
    guide_modes_explanation: 'Scan Modes Explained',
    
    // Theme Options
    theme_system: 'System (default)',
    theme_system_desc: 'Follows your device active theme.',
    theme_light: 'Light Mode',
    theme_light_desc: 'Clean and bright appearance.',
    theme_dark: 'Dark Mode',
    theme_dark_desc: 'Elegant appearance, easier on the eyes in the dark.',
    
    // Language Options
    lang_id: 'Bahasa Indonesia',
    lang_id_desc: 'Gunakan Bahasa Indonesia di seluruh aplikasi.',
    lang_en: 'English',
    lang_en_desc: 'Use English throughout the application.',
    
    // About
    about_app_name: 'Nutri Lens',
    about_version: 'Version 2.0.0 (Personalized Edition)',
    about_description: 'Nutri Lens is an AI-Powered Nutrition Scanner that utilizes the Google Gemini API to analyze nutrition facts labels on food packaging. It provides personalized health insights, Nutri-Grade scoring, and actionable recommendations based on your specific dietary needs and health goals.',
    about_tech: 'Powered by Google Gemini & React',
    developer_info: 'Developer Information',
  },
  id: {
    // Navigation
    nav_scan: 'Pindai',
    nav_history: 'Riwayat',
    nav_settings: 'Pengaturan',
    
    // Scanner
    app_title: 'Nutri Lens',
    app_subtitle: 'Pemindai Nutrisi bertenaga AI',
    tap_to_scan: 'Ketuk untuk memindai label',
    upload_gallery: 'atau unggah dari galeri',
    analyzing: 'Menganalisis Informasi Gizi...',
    ai_processing: 'Gemini AI sedang memproses',
    analyze_btn: 'Analisis Label',
    invalid_image: 'Harap unggah file gambar yang valid.',
    analyze_error: 'Gagal menganalisis gambar. Silakan coba lagi.',
    choose_scan_mode: 'Pilih Mode Pindai',
    current_mode: 'Mode Saat Ini',
    
    // Scan Modes
    mode_normal: 'Mode Normal',
    mode_normal_desc: 'Analisis kesehatan umum',
    mode_diet: 'Diet / Turun Berat',
    mode_diet_desc: 'Fokus rendah kalori & tinggi protein',
    mode_diabetes: 'Diabetes',
    mode_diabetes_desc: 'Fokus rendah gula & karbo kompleks',
    mode_pregnancy: 'Ibu Hamil',
    mode_pregnancy_desc: 'Bahan aman untuk ibu mengandung',
    mode_breastfeeding: 'Ibu Menyusui',
    mode_breastfeeding_desc: 'Nutrisi optimal untuk menyusui',
    mode_kids: 'Anak-anak',
    mode_kids_desc: 'Rendah gula, minim pengawet',
    mode_hypertension: 'Hipertensi',
    mode_hypertension_desc: 'Fokus rendah natrium/garam',
    mode_fitness: 'Kebugaran',
    mode_fitness_desc: 'Tinggi protein, baik untuk pemulihan',
    
    // History
    history_title: 'Riwayat',
    history_subtitle: 'Riwayat pemindaian nutrisi terbaru Anda',
    search_placeholder: 'Cari produk...',
    no_scans: 'Belum Ada Pindaian',
    no_scans_desc: 'Riwayat pindaian Anda akan muncul di sini.',
    delete_confirm: 'Hapus pindaian ini?',
    sort_title: 'Urutkan',
    sort_newest: 'Terbaru',
    sort_oldest: 'Terlama',
    sort_best: 'Grade: Terbaik (A → D)',
    sort_worst: 'Grade: Terburuk (D → A)',
    sugar_label: 'Gula',
    fat_label: 'Lemak',
    delete_title: 'Hapus Pindaian?',
    delete_desc: 'Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus pindaian ini dari riwayat?',
    cancel: 'Batal',
    delete: 'Hapus',
    
    // Poster / Result
    share_title: 'Bagikan Hasil',
    share_text: 'Ambil tangkapan layar untuk membagikan poster ini!',
    scanned_with: 'Dipindai dengan Nutri Lens AI',
    calories: 'Kalori',
    sugar: 'Gula',
    sat_fat: 'Lemak Jenuh',
    fiber: 'Serat',
    share_scanned: 'Saya memindai ',
    share_grade: ' dan mendapatkan Nutri-Grade ',
    edit_name: 'Edit Nama Produk',
    share_options_title: 'Opsi Bagikan',
    share_image: 'Bagikan Gambar',
    share_image_desc: 'Bagikan sebagai poster yang indah',
    share_text_only: 'Bagikan Teks',
    share_text_desc: 'Bagikan teks analisis saja',
    copied_to_clipboard: 'Disalin ke papan klip!',
    share_error_image: 'Gagal membuat gambar. Coba bagikan teks saja.',
    share_error_unsupported: 'Fitur berbagi tidak didukung di perangkat ini.',
    why_this_grade: 'Mengapa grade ini?',
    recommendation_for_you: 'Rekomendasi',
    
    // Settings
    settings_title: 'Pengaturan',
    theme: 'Tema',
    theme_desc: 'Pilih tema pilihan Anda untuk aplikasi.',
    language: 'Bahasa',
    language_desc: 'Pilih bahasa pilihan Anda untuk aplikasi.',
    default_mode: 'Mode Default',
    default_mode_desc: 'Atur tujuan kesehatan utama Anda.',
    about: 'Tentang',
    about_desc: 'Informasi tentang aplikasi Nutri Lens.',
    guide: 'Panduan Penggunaan',
    guide_desc: 'Pelajari cara menggunakan Nutri Lens dengan efektif.',
    
    // Guide
    guide_how_to_use: 'Cara Penggunaan',
    guide_step_1: '1. Pilih tujuan kesehatan Anda pada pemilih Mode Pindai.',
    guide_step_2: '2. Arahkan kamera ke label Informasi Nilai Gizi atau unggah gambar.',
    guide_step_3: '3. Tunggu AI menganalisis dan baca wawasan personal Anda.',
    guide_what_to_scan: 'Apa yang Bisa Dipindai',
    guide_what_to_scan_desc: 'Pindai tabel Informasi Nilai Gizi standar yang ada di belakang kemasan makanan. Pastikan teks terlihat jelas dan terbaca.',
    guide_modes_explanation: 'Penjelasan Mode Pindai',
    
    // Theme Options
    theme_system: 'Sistem (default)',
    theme_system_desc: 'Mengikuti tema aktif perangkat Anda.',
    theme_light: 'Mode Terang',
    theme_light_desc: 'Tampilan terang dan bersih.',
    theme_dark: 'Mode Gelap',
    theme_dark_desc: 'Tampilan elegan yang lebih nyaman di tempat gelap.',
    
    // Language Options
    lang_id: 'Bahasa Indonesia',
    lang_id_desc: 'Gunakan Bahasa Indonesia di seluruh aplikasi.',
    lang_en: 'English',
    lang_en_desc: 'Use English throughout the application.',
    
    // About
    about_app_name: 'Nutri Lens',
    about_version: 'Versi 2.0.0 (Edisi Personal)',
    about_description: 'Nutri Lens adalah Pemindai Nutrisi bertenaga AI yang memanfaatkan Google Gemini API untuk menganalisis label informasi nilai gizi pada kemasan makanan. Aplikasi ini memberikan wawasan kesehatan personal, penilaian Nutri-Grade, dan rekomendasi yang dapat ditindaklanjuti berdasarkan kebutuhan diet dan tujuan kesehatan spesifik Anda.',
    about_tech: 'Ditenagai oleh Google Gemini & React',
    developer_info: 'Informasi Pengembang',
  }
};

export type TranslationKey = keyof typeof translations.en;

export const useTranslation = (lang: AppLanguage) => {
  return (key: TranslationKey): string => {
    return translations[lang][key] || key;
  };
};
