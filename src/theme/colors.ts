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
export type AccentTheme = 'tonal' | 'slate' | 'nature' | 'classic' | 'core_blue';

export interface AccentOption {
  id: AccentTheme;
  name: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'tonal', name: 'SpendNova Tonal Theme', color: '#606060' },
];

export const getTheme = (type: ThemeType, _accent: AccentTheme = 'tonal'): ColorTheme => {
  if (type === 'dark') {
    // Pure Dark Neutral Tonal System (Red & Green ONLY for Loss & Profit):
    return {
      primary: '#F1F1F1',           // Soft off-white text & active state
      onPrimary: '#0F0F0F',
      primaryContainer: '#272727',  // Soft dark grey container (#272727)
      onPrimaryContainer: '#F1F1F1',// Soft off-white text on container
      secondary: '#AAAAAA',         // Soft muted grey text
      onSecondary: '#0F0F0F',
      secondaryContainer: '#272727',// Soft dark grey chip
      onSecondaryContainer: '#F1F1F1',
      background: '#0F0F0F',        // Base Dark Background
      onBackground: '#F1F1F1',      // Soft off-white text
      surface: '#212121',           // Soft dark grey card surface (#212121)
      onSurface: '#F1F1F1',
      surfaceVariant: '#282828',    // Soft dark grey variant surface (#282828)
      onSurfaceVariant: '#AAAAAA',  // Muted secondary text
      outline: '#383838',           // Soft muted dark grey border (#383838)
      error: '#FF4E45',             // Vibrant Red for Expense / Loss
      onError: '#FFFFFF',
      success: '#2BA640',           // Vibrant Green for Income / Profit
      onSuccess: '#FFFFFF',
      info: '#AAAAAA',              // Muted Neutral Grey
      onInfo: '#0F0F0F',
      backgroundGradient: ['#0F0F0F', '#181818'],
    };
  }

  // Pure Light Neutral Tonal System (Red & Green ONLY for Loss & Profit):
  return {
    primary: '#0F0F0F',             // Charcoal for active states
    onPrimary: '#FFFFFF',
    primaryContainer: '#F2F2F2',    // Soft Light Grey Pill Container
    onPrimaryContainer: '#0F0F0F',  // Charcoal text on soft grey container
    secondary: '#606060',           // Medium Grey Text
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F2F2F2',  // Soft Chip Background
    onSecondaryContainer: '#0F0F0F',
    background: '#FFFFFF',          // Pure White Base Canvas
    onBackground: '#0F0F0F',        // Primary Charcoal Text
    surface: '#FFFFFF',             // Raised White Card Surface
    onSurface: '#0F0F0F',
    surfaceVariant: '#F9F9F9',      // Soft Variant Surface
    onSurfaceVariant: '#606060',    // Secondary Grey Text
    outline: '#E5E5E5',             // Soft Light Grey Border
    error: '#C30027',               // Soft Red for Expense / Loss
    onError: '#FFFFFF',
    success: '#107516',             // Soft Green for Income / Profit
    onSuccess: '#FFFFFF',
    info: '#606060',                // Neutral Secondary Grey
    onInfo: '#FFFFFF',
    backgroundGradient: ['#FFFFFF', '#F9F9F9'],
  };
};

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
