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
    return {
      primary: '#10B981',           // Emerald/Mint accent
      onPrimary: '#FFFFFF',         // White text for primary buttons
      primaryContainer: '#042F2E',  // Dark Teal for active states
      onPrimaryContainer: '#34D399',// Light Mint text
      secondary: '#9CA3AF',         // Gray 400
      onSecondary: '#111827',
      secondaryContainer: '#1F2937',// Card background
      onSecondaryContainer: '#F3F4F6',
      background: '#0F172A',        // Slate 900 background
      onBackground: '#F8FAFC',      // White Text
      surface: '#1E293B',           // Slate 800 surfaces
      onSurface: '#F8FAFC',
      surfaceVariant: '#334155',    // Slate 700 
      onSurfaceVariant: '#94A3B8',  // Slate 400 text
      outline: '#334155',           // Slate 700 border
      error: '#EF4444',             
      onError: '#FFFFFF',
      success: '#10B981',           
      onSuccess: '#FFFFFF',
      info: '#3B82F6',              
      onInfo: '#FFFFFF',
      backgroundGradient: ['#0F172A', '#0F172A'], 
    };
  }

  return {
    primary: '#059669',             // Emerald/Mint primary
    onPrimary: '#FFFFFF',
    primaryContainer: '#D1FAE5',    // Light Mint for active states
    onPrimaryContainer: '#065F46',  // Dark Mint text
    secondary: '#6B7280',           // Gray 500
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFFFFF',
    onSecondaryContainer: '#111827',
    background: '#F8F9FA',          // Soft Off-White Background
    onBackground: '#111827',        // Dark Gray text
    surface: '#FFFFFF',             // Pure white cards
    onSurface: '#111827',
    surfaceVariant: '#F3F4F6',      // Gray 100
    onSurfaceVariant: '#4B5563',    // Gray 600 text
    outline: '#E5E7EB',             // Soft gray border
    error: '#DC2626',               
    onError: '#FFFFFF',
    success: '#059669',             
    onSuccess: '#FFFFFF',
    info: '#2563EB',                
    onInfo: '#FFFFFF',
    backgroundGradient: ['#F8F9FA', '#F8F9FA'], 
  };
};

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
