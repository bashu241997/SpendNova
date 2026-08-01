export interface ColorTheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  error: string;
  onError: string;
  success: string;
  onSuccess: string;
  info: string;
  onInfo: string;
}

export type ThemeType = 'light' | 'dark';

export type AccentTheme = 'slate' | 'indigo' | 'emerald' | 'violet' | 'teal' | 'amber' | 'rose';

export interface AccentOption {
  id: AccentTheme;
  name: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'slate', name: 'Core Blue', color: '#2563EB' },
  { id: 'indigo', name: 'Indigo', color: '#4F46E5' },
  { id: 'emerald', name: 'Emerald', color: '#059669' },
  { id: 'violet', name: 'Violet', color: '#7C3AED' },
  { id: 'teal', name: 'Sky', color: '#0284C7' },
  { id: 'amber', name: 'Orange', color: '#EA580C' },
  { id: 'rose', name: 'Rose', color: '#E11D48' },
];

const ACCENT_CONFIGS: Record<AccentTheme, {
  lightPrimary: string;
  lightContainer: string;
  onLightContainer: string;
  darkPrimary: string;
  darkContainer: string;
  onDarkContainer: string;
}> = {
  slate: {
    lightPrimary: '#2563EB',
    lightContainer: '#DBEAFE',
    onLightContainer: '#1E3A8A',
    darkPrimary: '#60A5FA',
    darkContainer: '#1E3A8A',
    onDarkContainer: '#DBEAFE',
  },
  indigo: {
    lightPrimary: '#4F46E5',
    lightContainer: '#EEF2FF',
    onLightContainer: '#312E81',
    darkPrimary: '#818CF8',
    darkContainer: '#312E81',
    onDarkContainer: '#E0E7FF',
  },
  emerald: {
    lightPrimary: '#059669',
    lightContainer: '#ECFDF5',
    onLightContainer: '#064E3B',
    darkPrimary: '#34D399',
    darkContainer: '#064E3B',
    onDarkContainer: '#A7F3D0',
  },
  violet: {
    lightPrimary: '#7C3AED',
    lightContainer: '#F5F3FF',
    onLightContainer: '#4C1D95',
    darkPrimary: '#C084FC',
    darkContainer: '#3B1578',
    onDarkContainer: '#DDD6FE',
  },
  teal: {
    lightPrimary: '#0284C7',
    lightContainer: '#E0F2FE',
    onLightContainer: '#0C4A6E',
    darkPrimary: '#38BDF8',
    darkContainer: '#0C4A6E',
    onDarkContainer: '#E0F2FE',
  },
  amber: {
    lightPrimary: '#EA580C',
    lightContainer: '#FFF7ED',
    onLightContainer: '#7C2D12',
    darkPrimary: '#FB923C',
    darkContainer: '#7C2D12',
    onDarkContainer: '#FFEDD5',
  },
  rose: {
    lightPrimary: '#E11D48',
    lightContainer: '#FFF1F2',
    onLightContainer: '#881337',
    darkPrimary: '#FB7185',
    darkContainer: '#5C0D22',
    onDarkContainer: '#FECDD3',
  },
};

export const getTheme = (type: ThemeType, accent: AccentTheme = 'slate'): ColorTheme => {
  const config = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.slate;

  if (type === 'dark') {
    return {
      primary: config.darkPrimary,
      onPrimary: '#0B0F19',
      primaryContainer: config.darkContainer,
      onPrimaryContainer: config.onDarkContainer,
      secondary: '#A7F3D0',
      onSecondary: '#0B0F19',
      secondaryContainer: '#1E293B',
      onSecondaryContainer: '#F8FAFC',
      background: '#0B0F19',
      onBackground: '#F8FAFC',
      surface: '#151C2C',
      onSurface: '#F8FAFC',
      surfaceVariant: '#1F293D',
      onSurfaceVariant: '#94A3B8',
      outline: '#2D394E',
      error: '#FB7185',
      onError: '#0B0F19',
      success: '#34D399',
      onSuccess: '#0B0F19',
      info: '#38BDF8',
      onInfo: '#0B0F19',
    };
  }

  return {
    primary: config.lightPrimary,
    onPrimary: '#FFFFFF',
    primaryContainer: config.lightContainer,
    onPrimaryContainer: config.onLightContainer,
    secondary: '#334155',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E2E8F0',
    onSecondaryContainer: '#0F172A',
    background: '#F8FAFC',
    onBackground: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: '#334155',
    outline: '#E2E8F0',
    error: '#E11D48',
    onError: '#FFFFFF',
    success: '#059669',
    onSuccess: '#FFFFFF',
    info: '#0284C7',
    onInfo: '#FFFFFF',
  };
};

export const lightTheme = getTheme('light', 'slate');
export const darkTheme = getTheme('dark', 'slate');
