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
    primary: '#18181B',             // Near black (like Prinqo buttons)
    onPrimary: '#FFFFFF',           // White text on buttons
    primaryContainer: '#E4E4E7',    // Light gray for active states
    onPrimaryContainer: '#18181B',  // Black text
    secondary: '#71717A',           // Zinc 500 (muted text)
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFFFFF',
    onSecondaryContainer: '#18181B',
    background: '#F7F5F1',          // Warm paper background exactly from Prinqo
    onBackground: '#18181B',        // Near black text
    surface: '#FFFFFF',             // Pure white cards
    onSurface: '#18181B',           // Near black text on cards
    surfaceVariant: '#F4F4F5',      // Zinc 100 for alternate backgrounds
    onSurfaceVariant: '#52525B',    // Zinc 600
    outline: '#E4E4E7',             // Zinc 200 border
    error: '#DC2626',               
    onError: '#FFFFFF',
    success: '#16A34A',             
    onSuccess: '#FFFFFF',
    info: '#18181B',                // Replaced blue info with black
    onInfo: '#FFFFFF',
    backgroundGradient: ['#F7F5F1', '#F7F5F1'], 
  };
};

