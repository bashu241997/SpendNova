export interface CountryCurrency {
  code: string;     // ISO 3166-1 alpha-2 country code
  name: string;     // Country Name
  currency: string; // Currency Code (e.g. USD)
  symbol: string;   // Currency Symbol (e.g. $)
  flag: string;     // Emoji Flag
}

export const COUNTRIES: CountryCurrency[] = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'EU', name: 'European Union', currency: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$', flag: '🇨🇦' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', flag: '🇯🇵' },
  { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥', flag: '🇨🇳' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$', flag: '🇸🇬' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R', flag: '🇿🇦' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: '﷼', flag: '🇸🇦' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', symbol: '$', flag: '🇲🇽' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', currency: 'RUB', symbol: '₽', flag: '🇷🇺' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'TR', name: 'Turkey', currency: 'TRY', symbol: '₺', flag: '🇹🇷' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM', flag: '🇲🇾' },
  { code: 'PH', name: 'Philippines', currency: 'PHP', symbol: '₱', flag: '🇵🇭' },
  { code: 'TH', name: 'Thailand', currency: 'THB', symbol: '฿', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', currency: 'VND', symbol: '₫', flag: '🇻🇳' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', currency: 'EGP', symbol: '£', flag: '🇪🇬' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', currency: 'PEN', symbol: 'S/', flag: '🇵🇪' },
  { code: 'IL', name: 'Israel', currency: 'ILS', symbol: '₪', flag: '🇮🇱' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', symbol: 'Rs', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', symbol: '৳', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs', flag: '🇱🇰' },
  { code: 'SE', name: 'Sweden', currency: 'SEK', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', currency: 'NOK', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', currency: 'DKK', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PL', name: 'Poland', currency: 'PLN', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', currency: 'HUF', symbol: 'Ft', flag: '🇭🇺' },
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Attempts to detect the user's country code based on their browser/device timezone.
 * Defaults to 'US' if it cannot be determined reliably.
 */
export const detectUserCountry = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return 'US';
    
    // Simple timezone prefix mapping to country codes
    const tzMap: Record<string, string> = {
      'America/New_York': 'US', 'America/Los_Angeles': 'US', 'America/Chicago': 'US',
      'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
      'Europe/London': 'GB', 'Europe/Belfast': 'GB',
      'Europe/Berlin': 'EU', 'Europe/Paris': 'EU', 'Europe/Madrid': 'EU', 'Europe/Rome': 'EU', 'Europe/Amsterdam': 'EU',
      'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
      'America/Toronto': 'CA', 'America/Vancouver': 'CA',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Europe/Zurich': 'CH',
      'Asia/Singapore': 'SG',
      'Pacific/Auckland': 'NZ',
      'Africa/Johannesburg': 'ZA',
      'Asia/Dubai': 'AE',
      'Asia/Riyadh': 'SA',
      'America/Sao_Paulo': 'BR',
      'America/Mexico_City': 'MX',
      'Asia/Seoul': 'KR',
      'Europe/Moscow': 'RU',
      'Asia/Jakarta': 'ID',
      'Europe/Istanbul': 'TR',
      'Asia/Kuala_Lumpur': 'MY',
      'Asia/Manila': 'PH',
      'Asia/Bangkok': 'TH',
      'Asia/Ho_Chi_Minh': 'VN',
      'Africa/Lagos': 'NG',
      'Africa/Cairo': 'EG',
      'America/Argentina/Buenos_Aires': 'AR',
      'America/Bogota': 'CO',
      'America/Santiago': 'CL',
      'America/Lima': 'PE',
      'Asia/Jerusalem': 'IL',
      'Asia/Karachi': 'PK',
      'Asia/Dhaka': 'BD',
      'Asia/Colombo': 'LK',
      'Europe/Stockholm': 'SE',
      'Europe/Oslo': 'NO',
      'Europe/Copenhagen': 'DK',
      'Europe/Warsaw': 'PL',
      'Europe/Prague': 'CZ',
      'Europe/Budapest': 'HU',
    };

    if (tzMap[tz]) return tzMap[tz];

    const prefixMap: Record<string, string> = {
      'America': 'US',
      'Asia': 'IN',
      'Europe': 'EU',
      'Australia': 'AU',
      'Africa': 'ZA',
    };
    
    const prefix = tz.split('/')[0];
    if (prefixMap[prefix]) return prefixMap[prefix];

    return 'US';
  } catch (e) {
    return 'US';
  }
};

export const getCurrencySymbol = (countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.symbol : '$';
};

export const getCountryDetails = (countryCode: string): CountryCurrency => {
  return COUNTRIES.find(c => c.code === countryCode) || COUNTRIES.find(c => c.code === 'US')!;
};
