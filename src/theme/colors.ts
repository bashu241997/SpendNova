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

export const getTheme = (): ColorTheme => {
  return {
    primary: '#262626',             // Softened black (Instagram style)
    onPrimary: '#FFFFFF',           // White text on buttons
    primaryContainer: '#E4E4E7',    // Light gray for active states
    onPrimaryContainer: '#262626',  // Softened black
    secondary: '#8E8E8E',           // Instagram secondary grey
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFFFFF',
    onSecondaryContainer: '#262626',
    background: '#fafafa',
    onBackground: '#262626',
    surface: '#FFFFFF',
    onSurface: '#262626',
    surfaceVariant: '#F9F9FB',
    onSurfaceVariant: '#737373',    // Instagram tertiary grey
    outline: '#E4E4E7',             // Zinc 200 border
    error: '#DC2626',
    onError: '#FFFFFF',
    success: '#52b375',
    onSuccess: '#FFFFFF',
    info: '#262626',                // Replaced blue info with soft black
    onInfo: '#FFFFFF',
    backgroundGradient: ['#F7F5F1', '#F7F5F1'],
  };
};

