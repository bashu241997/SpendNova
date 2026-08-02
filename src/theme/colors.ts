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
  backgroundGradient: string[];
}

export type ThemeType = 'light' | 'dark';

export type AccentTheme = 
  | 'slate' 
  | 'indigo' 
  | 'emerald' 
  | 'violet' 
  | 'teal' 
  | 'amber' 
  | 'rose' 
  | 'nature' 
  | 'classic' 
  | 'core_blue';

export interface AccentOption {
  id: AccentTheme;
  name: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'nature', name: 'Nature Green', color: '#51B375' },
  { id: 'core_blue', name: 'Core Blue', color: '#2563EB' },
  { id: 'slate', name: 'Stale Grey', color: '#64748B' },
  { id: 'amber', name: 'Peach Coral', color: '#FF7A59' },
  { id: 'classic', name: 'Classic White', color: '#1F2937' },
  { id: 'indigo', name: 'Indigo', color: '#4F46E5' },
  { id: 'emerald', name: 'Emerald', color: '#059669' },
  { id: 'violet', name: 'Violet', color: '#7C3AED' },
  { id: 'teal', name: 'Sky Blue', color: '#0284C7' },
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
  nature: {
    lightPrimary: '#51B375',
    lightContainer: '#EAF6EE',
    onLightContainer: '#1F5335',
    darkPrimary: '#73D097',
    darkContainer: '#1F5335',
    onDarkContainer: '#EAF6EE',
  },
  core_blue: {
    lightPrimary: '#2563EB',
    lightContainer: '#DBEAFE',
    onLightContainer: '#1E3A8A',
    darkPrimary: '#60A5FA',
    darkContainer: '#1E3A8A',
    onDarkContainer: '#DBEAFE',
  },
  slate: {
    lightPrimary: '#64748B',
    lightContainer: '#F1F5F9',
    onLightContainer: '#1E293B',
    darkPrimary: '#94A3B8',
    darkContainer: '#1E293B',
    onDarkContainer: '#F1F5F9',
  },
  amber: {
    lightPrimary: '#FF7A59',
    lightContainer: '#FFF0ED',
    onLightContainer: '#802613',
    darkPrimary: '#FFA085',
    darkContainer: '#802613',
    onDarkContainer: '#FFF0ED',
  },
  classic: {
    lightPrimary: '#1F2937',
    lightContainer: '#F3F4F6',
    onLightContainer: '#111827',
    darkPrimary: '#FAFAFA',
    darkContainer: '#1F2937',
    onDarkContainer: '#FAFAFA',
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
  rose: {
    lightPrimary: '#E11D48',
    lightContainer: '#FFF1F2',
    onLightContainer: '#881337',
    darkPrimary: '#FB7185',
    darkContainer: '#5C0D22',
    onDarkContainer: '#FECDD3',
  },
};

export const getTheme = (type: ThemeType, accent: AccentTheme = 'nature'): ColorTheme => {
  const config = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.nature;

  const gradientMap: Record<AccentTheme, [string, string]> = {
    nature: ['#F3FAF5', '#FFFFFF'],
    core_blue: ['#F2F7FD', '#FFFFFF'],
    slate: ['#F5F7FA', '#FFFFFF'],
    amber: ['#FCF5F3', '#FFFFFF'],
    classic: ['#FFFFFF', '#FFFFFF'],
    indigo: ['#F4F5FB', '#FFFFFF'],
    emerald: ['#F1FAF5', '#FFFFFF'],
    violet: ['#F6F4FA', '#FFFFFF'],
    teal: ['#F1F8FA', '#FFFFFF'],
    rose: ['#FAF2F4', '#FFFFFF'],
  };

  const selectedGradient = gradientMap[accent] || ['#F8FAFC', '#FFFFFF'];

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
      background: 'transparent',
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
      backgroundGradient: ['#0B0F19', '#151C2C'],
    };
  }

  // Classic White utilizes a slightly softer, warmer text shade for optimal eye comfort
  const isClassic = accent === 'classic';
  const textColor = isClassic ? '#1F2937' : '#0F172A';
  const textVariantColor = isClassic ? '#4B5563' : '#334155';

  return {
    primary: config.lightPrimary,
    onPrimary: '#FFFFFF',
    primaryContainer: config.lightContainer,
    onPrimaryContainer: config.onLightContainer,
    secondary: '#334155',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E2E8F0',
    onSecondaryContainer: '#0F172A',
    background: 'transparent',
    onBackground: textColor,
    surface: '#FFFFFF',
    onSurface: textColor,
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: textVariantColor,
    outline: '#E2E8F0',
    error: '#E11D48',
    onError: '#FFFFFF',
    success: '#059669',
    onSuccess: '#FFFFFF',
    info: '#0284C7',
    onInfo: '#FFFFFF',
    backgroundGradient: selectedGradient,
  };
};

export const lightTheme = getTheme('light', 'nature');
export const darkTheme = getTheme('dark', 'nature');
