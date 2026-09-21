import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AccessibilitySettings } from '@/types';

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  dyslexiaFont: false,
  fontSize: 'medium',
  lineSpacing: 'normal',
  wordSpacing: 'normal',
  readingRuler: false,
  highContrast: false,
  colorTheme: 'default',
  textToSpeech: true,
  largeButtons: false,
};

const STORAGE_KEY = 'nest-accessibility';

const AuthContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [rulerPos, setRulerPos] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!settings.readingRuler) return;
    const handleMove = (e: MouseEvent) => {
      setRulerPos(e.clientY - 20);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [settings.readingRuler]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <AuthContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
      {settings.readingRuler && (
        <div className="reading-ruler" style={{ top: `${rulerPos}px` }} />
      )}
    </AuthContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}

function applySettings(settings: AccessibilitySettings) {
  const body = document.body;

  // Font family
  body.classList.toggle('font-dyslexic', settings.dyslexiaFont);

  // Font size
  const fontSizes: Record<string, string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
    'x-large': '22px',
  };
  document.documentElement.style.setProperty('--nest-font-size', fontSizes[settings.fontSize]);

  // Line spacing
  const lineSpacings: Record<string, string> = {
    normal: '1.6',
    relaxed: '1.8',
    wide: '2.2',
  };
  document.documentElement.style.setProperty('--nest-line-spacing', lineSpacings[settings.lineSpacing]);

  // Word spacing
  const wordSpacings: Record<string, string> = {
    normal: '0.05em',
    wide: '0.2em',
  };
  document.documentElement.style.setProperty('--nest-word-spacing', wordSpacings[settings.wordSpacing]);

  // High contrast
  body.classList.toggle('high-contrast', settings.highContrast || settings.colorTheme === 'high-contrast');

  // Large buttons
  body.classList.toggle('large-buttons', settings.largeButtons);

  // Color theme
  body.classList.remove('theme-default', 'theme-blue', 'theme-green', 'theme-warm');
  if (settings.colorTheme !== 'default' && settings.colorTheme !== 'high-contrast') {
    body.classList.add(`theme-${settings.colorTheme}`);
  }
}
