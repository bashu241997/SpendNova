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
  { id: 'slate', name: 'Slate Gray', color: '#94A3B8' },
  { id: 'indigo', name: 'Electric Indigo', color: '#6366F1' },
  { id: 'emerald', name: 'Mint Emerald', color: '#10B981' },
  { id: 'violet', name: 'Cyber Violet', color: '#8B5CF6' },
  { id: 'teal', name: 'Ocean Cyan', color: '#06B6D4' },
  { id: 'amber', name: 'Gold Sunburst', color: '#F59E0B' },
  { id: 'rose', name: 'Crimson Rose', color: '#F43F5E' },
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
    lightPrimary: '#334155',
    lightContainer: '#E2E8F0',
    onLightContainer: '#0F172A',
    darkPrimary: '#94A3B8',
    darkContainer: '#1E293B',
    onDarkContainer: '#F8FAFC',
  },
  indigo: {
    lightPrimary: '#4F46E5',
    lightContainer: '#EEF2FF',
    onLightContainer: '#312E81',
    darkPrimary: '#818CF8',
    darkContainer: '#2D2B69',
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
    lightContainer: '#F0F9FF',
    onLightContainer: '#0C4A6E',
    darkPrimary: '#38BDF8',
    darkContainer: '#07486B',
    onDarkContainer: '#BAE6FD',
  },
  amber: {
    lightPrimary: '#D97706',
    lightContainer: '#FFFBEB',
    onLightContainer: '#78350F',
    darkPrimary: '#FBBF24',
    darkContainer: '#592906',
    onDarkContainer: '#FEF08A',
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
    secondary: '#475569',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F1F5F9',
    onSecondaryContainer: '#0F172A',
    background: '#F8FAFC',
    onBackground: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: '#64748B',
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
