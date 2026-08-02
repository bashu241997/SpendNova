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

export type AccentTheme = 'slate' | 'nature' | 'classic' | 'core_blue';

export interface AccentOption {
  id: AccentTheme;
  name: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'nature', name: 'Nature Green', color: '#51B375' },
  { id: 'core_blue', name: 'Core Blue', color: '#2563EB' },
  { id: 'slate', name: 'Steel Grey', color: '#64748B' },
  { id: 'classic', name: 'Classic White', color: '#1F2937' },
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
  classic: {
    lightPrimary: '#1F2937',
    lightContainer: '#F3F4F6',
    onLightContainer: '#111827',
    darkPrimary: '#FAFAFA',
    darkContainer: '#1F2937',
    onDarkContainer: '#FAFAFA',
  },
};

export const getTheme = (type: ThemeType, accent: AccentTheme = 'nature'): ColorTheme => {
  const config = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.nature;

  const gradientMap: Record<AccentTheme, [string, string]> = {
    nature: ['#F0FDF4', '#FFFFFF'],
    core_blue: ['#EFF6FF', '#FFFFFF'],
    slate: ['#F8FAFC', '#FFFFFF'],
    classic: ['#FFFFFF', '#FFFFFF'],
  };

  const selectedGradient = gradientMap[accent] || ['#F8FAFC', '#FFFFFF'];

  if (type === 'dark') {
    return {
      primary: config.darkPrimary,
      onPrimary: '#090D16',
      primaryContainer: config.darkContainer,
      onPrimaryContainer: config.onDarkContainer,
      secondary: '#A7F3D0',
      onSecondary: '#090D16',
      secondaryContainer: '#1E293B',
      onSecondaryContainer: '#F8FAFC',
      background: '#090D16',
      onBackground: '#F8FAFC',
      surface: '#121824',
      onSurface: '#F8FAFC',
      surfaceVariant: '#1A2333',
      onSurfaceVariant: '#94A3B8',
      outline: '#263147',
      error: '#FB7185',
      onError: '#090D16',
      success: '#34D399',
      onSuccess: '#090D16',
      info: '#38BDF8',
      onInfo: '#090D16',
      backgroundGradient: ['#090D16', '#121824'],
    };
  }

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
    background: selectedGradient[0],
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
