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
    // angular.dev Clean Layout Aesthetic (No aggressive reds)
    return {
      primary: '#F8FAFC',           // White text/icons for active states
      onPrimary: '#0F172A',         // Slate background for primary buttons
      primaryContainer: '#1E293B',  // Slate 800 (very subtle hover/active state)
      onPrimaryContainer: '#F8FAFC',// White text
      secondary: '#94A3B8',         // Slate 400 (muted secondary text/icons)
      onSecondary: '#0F172A',
      secondaryContainer: '#0F172A',// Transparent/Background for cards
      onSecondaryContainer: '#F8FAFC',
      background: '#09090B',        // Very deep almost-black slate
      onBackground: '#F8FAFC',      // White Text
      surface: '#09090B',           // Exactly matches background (NO visible card boxes)
      onSurface: '#F8FAFC',
      surfaceVariant: '#18181B',    // Zinc 900 (barely visible elevation)
      onSurfaceVariant: '#A1A1AA',  // Zinc 400 text
      outline: '#27272A',           // Zinc 800 (very subtle glassy border)
      error: '#EF4444',             // Standard Red (only for actual errors)
      onError: '#FFFFFF',
      success: '#10B981',           // Emerald 500 (only for positive numbers)
      onSuccess: '#FFFFFF',
      info: '#3B82F6',              // Blue 500
      onInfo: '#FFFFFF',
      backgroundGradient: ['#09090B', '#09090B'], 
    };
  }

  // angular.dev Light Layout Aesthetic
  return {
    primary: '#09090B',             // Near black for active text/icons
    onPrimary: '#FFFFFF',
    primaryContainer: '#F4F4F5',    // Zinc 100 for subtle hover/active states
    onPrimaryContainer: '#09090B',  
    secondary: '#71717A',           // Zinc 500
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFFFFF',
    onSecondaryContainer: '#09090B',
    background: '#FFFFFF',          // Pure white
    onBackground: '#09090B',        // Near black text
    surface: '#FFFFFF',             // Exactly matches background
    onSurface: '#09090B',
    surfaceVariant: '#FAFAFA',      // Zinc 50
    onSurfaceVariant: '#52525B',    // Zinc 600 text
    outline: '#E4E4E7',             // Zinc 200 border
    error: '#DC2626',               
    onError: '#FFFFFF',
    success: '#059669',             
    onSuccess: '#FFFFFF',
    info: '#2563EB',                
    onInfo: '#FFFFFF',
    backgroundGradient: ['#FFFFFF', '#FFFFFF'], 
  };
};

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
