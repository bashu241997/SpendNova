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
export type AccentTheme = 'youtube' | 'slate' | 'nature' | 'classic' | 'core_blue';

export interface AccentOption {
  id: AccentTheme;
  name: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'youtube', name: 'YouTube Theme', color: '#0F0F0F' },
];

export const getTheme = (type: ThemeType, _accent: AccentTheme = 'youtube'): ColorTheme => {
  if (type === 'dark') {
    // Official YouTube Dark Theme with sleek Black/White primary accent:
    return {
      primary: '#FFFFFF',           // Sleek White Primary Text/Accent for Dark Mode
      onPrimary: '#0F0F0F',
      primaryContainer: '#272727',  // YouTube Surface Container
      onPrimaryContainer: '#FFFFFF',
      secondary: '#3EA6FF',         // YouTube Action Blue
      onSecondary: '#0F0F0F',
      secondaryContainer: 'rgba(255,255,255,0.1)',
      onSecondaryContainer: '#FFFFFF',
      background: '#0F0F0F',        // YouTube Pure Dark Background
      onBackground: '#FFFFFF',      // YouTube Primary Text
      surface: '#212121',           // YouTube Card Surface
      onSurface: '#FFFFFF',
      surfaceVariant: '#282828',    // YouTube Variant Surface
      onSurfaceVariant: '#AAAAAA',  // YouTube Secondary Text
      outline: '#3F3F3F',           // YouTube Divider Border
      error: '#FF4E45',             // YouTube Red for Expenses
      onError: '#FFFFFF',
      success: '#2BA640',           // YouTube Green for Income
      onSuccess: '#FFFFFF',
      info: '#3EA6FF',
      onInfo: '#FFFFFF',
      backgroundGradient: ['#0F0F0F', '#181818'],
    };
  }

  // Official YouTube Light Theme with sleek Black primary accent:
  return {
    primary: '#0F0F0F',             // Sleek Black Primary Accent for Light Mode
    onPrimary: '#FFFFFF',
    primaryContainer: '#F2F2F2',    // YouTube Light Surface Container
    onPrimaryContainer: '#0F0F0F',
    secondary: '#065FD4',           // YouTube Light Blue Link Accent
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E5E5E5',
    onSecondaryContainer: '#0F0F0F',
    background: '#FFFFFF',          // YouTube Base Light Background
    onBackground: '#0F0F0F',        // YouTube Dark Primary Text
    surface: '#FFFFFF',             // YouTube Raised Background
    onSurface: '#0F0F0F',
    surfaceVariant: '#F9F9F9',      // YouTube Light Card Surface
    onSurfaceVariant: '#606060',    // YouTube Light Secondary Text
    outline: '#E5E5E5',             // YouTube Light Border
    error: '#E1002D',               // YouTube Red for Expenses
    onError: '#FFFFFF',
    success: '#107516',             // YouTube Green for Income
    onSuccess: '#FFFFFF',
    info: '#065FD4',
    onInfo: '#FFFFFF',
    backgroundGradient: ['#FFFFFF', '#F9F9F9'],
  };
};

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
