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

export type AccentTheme = 'slate' | 'emerald' | 'warm' | 'teal' | 'violet' | 'rose';

export interface AccentOption {
  id: AccentTheme;
  name: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'slate', name: 'Slate Gray', color: '#94A3B8' },
  { id: 'warm', name: 'Warm Amber', color: '#FBBF24' },
  { id: 'emerald', name: 'Forest Emerald', color: '#34D399' },
  { id: 'teal', name: 'Ocean Blue', color: '#38BDF8' },
  { id: 'violet', name: 'Royal Indigo', color: '#818CF8' },
  { id: 'rose', name: 'Crimson Rose', color: '#FB7185' },
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
    darkContainer: '#35363A',
    onDarkContainer: '#E8EAED',
  },
  warm: {
    lightPrimary: '#D97706',
    lightContainer: '#FEF3C7',
    onLightContainer: '#92400E',
    darkPrimary: '#FBBF24',
    darkContainer: '#3A342B',
    onDarkContainer: '#FEF08A',
  },
  emerald: {
    lightPrimary: '#059669',
    lightContainer: '#D1FAE5',
    onLightContainer: '#065F46',
    darkPrimary: '#34D399',
    darkContainer: '#27382E',
    onDarkContainer: '#A7F3D0',
  },
  teal: {
    lightPrimary: '#0284C7',
    lightContainer: '#E0F2FE',
    onLightContainer: '#075985',
    darkPrimary: '#38BDF8',
    darkContainer: '#263642',
    onDarkContainer: '#BAE6FD',
  },
  violet: {
    lightPrimary: '#4338CA',
    lightContainer: '#EEF2FF',
    onLightContainer: '#3730A3',
    darkPrimary: '#818CF8',
    darkContainer: '#2E3048',
    onDarkContainer: '#C7D2FE',
  },
  rose: {
    lightPrimary: '#E11D48',
    lightContainer: '#FFE4E6',
    onLightContainer: '#9F1239',
    darkPrimary: '#FB7185',
    darkContainer: '#382A2E',
    onDarkContainer: '#FECDD3',
  },
};

export const getTheme = (type: ThemeType, accent: AccentTheme = 'slate'): ColorTheme => {
  const config = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.slate;

  if (type === 'dark') {
    return {
      primary: config.darkPrimary,
      onPrimary: '#202124',
      primaryContainer: config.darkContainer,
      onPrimaryContainer: config.onDarkContainer,
      secondary: '#E8EAED',
      onSecondary: '#202124',
      secondaryContainer: '#35363A',
      onSecondaryContainer: '#E8EAED',
      background: '#202124',
      onBackground: '#E8EAED',
      surface: '#292A2D',
      onSurface: '#E8EAED',
      surfaceVariant: '#35363A',
      onSurfaceVariant: '#BDC1C6',
      outline: '#3C4043',
      error: '#F28B82',
      onError: '#202124',
      success: '#81C995',
      onSuccess: '#202124',
      info: '#8AB4F8',
      onInfo: '#202124',
    };
  }

  return {
    primary: config.lightPrimary,
    onPrimary: '#FFFFFF',
    primaryContainer: config.lightContainer,
    onPrimaryContainer: config.onLightContainer,
    secondary: '#3C4043',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F1F3F4',
    onSecondaryContainer: '#202124',
    background: '#F8F9FA',
    onBackground: '#202124',
    surface: '#FFFFFF',
    onSurface: '#202124',
    surfaceVariant: '#F1F3F4',
    onSurfaceVariant: '#5F6368',
    outline: '#DADCE0',
    error: '#D93025',
    onError: '#FFFFFF',
    success: '#188038',
    onSuccess: '#FFFFFF',
    info: '#1A73E8',
    onInfo: '#FFFFFF',
  };
};

export const lightTheme = getTheme('light', 'slate');
export const darkTheme = getTheme('dark', 'slate');

