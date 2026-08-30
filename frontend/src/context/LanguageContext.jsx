import { createContext, useContext, useMemo, useState } from 'react';

const STRINGS = {
  en: {
    chat: 'Chat',
    medicines: 'My Medicines',
    reminders: 'Reminders',
    uploadRx: 'Upload Prescription',
    healthTips: 'Health Tips',
    settings: 'Settings',
    help: 'Help',
    interactions: 'Drug Interactions',
    doseCalc: 'Dose Calculator',
    quickActions: 'Quick Actions',
    exportChat: 'Export Chat',
    wasHelpful: 'Was this answer helpful?',
    reportIssue: 'Report an issue',
    compliance: 'Educational use only — not medical advice',
  },
  hi: {
    chat: 'चैट',
    medicines: 'मेरी दवाएं',
    reminders: 'रिमाइंडर',
    uploadRx: 'प्रिस्क्रिप्शन अपलोड',
    healthTips: 'स्वास्थ्य सुझाव',
    settings: 'सेटिंग्स',
    help: 'सहायता',
    interactions: 'दवा इंटरैक्शन',
    doseCalc: 'खुराक कैलकुलेटर',
    quickActions: 'त्वरित कार्य',
    exportChat: 'चैट निर्यात',
    wasHelpful: 'क्या यह उत्तर सहायक था?',
    reportIssue: 'समस्या रिपोर्ट करें',
    compliance: 'केवल शैक्षिक — चिकित्सा सलाह नहीं',
  },
  pa: {
    chat: 'ਗੱਲਬਾਤ',
    medicines: 'ਮੇਰੀਆਂ ਦਵਾਈਆਂ',
    reminders: 'ਯਾਦ ਦਿਵਾਉਣੇ',
    uploadRx: 'ਨੁਸਖਾ ਅੱਪਲੋਡ',
    healthTips: 'ਸਿਹਤ ਸੁਝਾਅ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    help: 'ਮਦਦ',
    interactions: 'ਦਵਾਈ ਇੰਟਰੈਕਸ਼ਨ',
    doseCalc: 'ਖੁਰਾਕ ਕੈਲਕੁਲੇਟਰ',
    quickActions: 'ਤੁਰੰਤ ਕਾਰਵਾਈ',
    exportChat: 'ਚੈਟ ਐਕਸਪੋਰਟ',
    wasHelpful: 'ਕੀ ਇਹ ਜਵਾਬ ਮਦਦਗਾਰ ਸੀ?',
    reportIssue: 'ਸਮੱਸਿਆ ਰਿਪੋਰਟ ਕਰੋ',
    compliance: 'ਸਿਰਫ਼ ਸਿੱਖਿਆਤਮਕ — ਮੈਡੀਕਲ ਸਲਾਹ ਨਹੀਂ',
  },
  kn: {
    chat: 'ಚಾಟ್',
    medicines: 'ನನ್ನ ಔಷಧಿಗಳು',
    reminders: 'ಜ್ಞಾಪನೆಗಳು',
    uploadRx: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಶನ್ ಅಪ್‌ಲೋಡ್',
    healthTips: 'ಆರೋಗ್ಯ ಸಲಹೆಗಳು',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    help: 'ಸಹಾಯ',
    interactions: 'ಔಷಧಿ ಪರಸ್ಪರ ಕ್ರಿಯೆ',
    doseCalc: 'ಮೋಸದ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    quickActions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    exportChat: 'ಚಾಟ್ ರಫ್ತು',
    wasHelpful: 'ಈ ಉತ್ತರ ಸಹಾಯಕವಾಗಿತ್ತೇ?',
    reportIssue: 'ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ',
    compliance: 'ಕೇವಲ ಶೈಕ್ಷಣಿಕ — ವೈದ್ಯಕೀಯ ಸಲಹೆ ಅಲ್ಲ',
  },
};

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('medai-lang') || 'en');

  const setLanguage = (code) => {
    setLang(code);
    localStorage.setItem('medai-lang', code);
  };

  const t = useMemo(() => STRINGS[lang] || STRINGS.en, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
