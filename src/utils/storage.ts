import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export type AccountType = 'savings' | 'credit' | 'cash' | 'custom';


export interface Account {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: AccountType;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budget?: number;
  subcategories?: string[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  account: string;
  toAccount?: string;
  category: string;
  description: string;
  notes?: string;
  subcategory?: string;
  recurrence?: string;
  labels?: string[];
  isPending?: boolean;
}

export interface CloudBackup {
  id: string;
  timestamp: string;
  device: string;
  data: AppData;
}

export interface AppData {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

const TRANSACTIONS_KEY = 'ledgeit_transactions';
const ACCOUNTS_KEY = 'ledgeit_accounts';
const CATEGORIES_KEY = 'ledgeit_categories';
const CLOUD_BACKUPS_KEY = 'ledgeit_cloud_backups';
const TERMS_ACCEPTED_KEY = 'ledgeit_terms_accepted';


export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_cash', name: 'Main Cash', icon: 'payments', color: '#4CAF50', type: 'cash' },
  { id: 'acc_savings', name: 'Chase Bank', icon: 'account-balance', color: '#2196F3', type: 'savings' },
  { id: 'acc_credit', name: 'Barclays Card', icon: 'credit-card', color: '#F44336', type: 'credit' }
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_salary', name: 'Salary', type: 'income', icon: 'work', color: '#10B981' },
  { id: 'cat_allowance', name: 'Allowance', type: 'income', icon: 'card-giftcard', color: '#84CC16' },
  { id: 'cat_bonus', name: 'Bonus', type: 'income', icon: 'monetization-on', color: '#14B8A6' },
  { id: 'cat_other_inc', name: 'Other (Income)', type: 'income', icon: 'more-horiz', color: '#3B82F6' },
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'restaurant', color: '#F59E0B', budget: 500 },
  { id: 'cat_social', name: 'Social & Fun', type: 'expense', icon: 'sports-esports', color: '#EC4899', budget: 250 },
  { id: 'cat_transport', name: 'Transport & Fuel', type: 'expense', icon: 'directions-car', color: '#06B6D4', budget: 180 },
  { id: 'cat_culture', name: 'Culture & Movies', type: 'expense', icon: 'movie', color: '#6366F1', budget: 120 },
  { id: 'cat_household', name: 'Household & Rent', type: 'expense', icon: 'home', color: '#EAB308', budget: 800 },
  { id: 'cat_apparel', name: 'Apparel & Clothes', type: 'expense', icon: 'checkroom', color: '#A855F7', budget: 200 },
  { id: 'cat_beauty', name: 'Beauty & Personal', type: 'expense', icon: 'spa', color: '#F43F5E', budget: 100 },
  { id: 'cat_health', name: 'Health & Pharmacy', type: 'expense', icon: 'medical-services', color: '#EF4444', budget: 150 },
  { id: 'cat_education', name: 'Education & Courses', type: 'expense', icon: 'school', color: '#3B82F6', budget: 300 },
  { id: 'cat_other_exp', name: 'Other (Expense)', type: 'expense', icon: 'more-horiz', color: '#64748B', budget: 150 }
];

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load transactions', e);
    return [];
  }
};

export const saveTransactions = async (txs: Transaction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
};

export const loadAccounts = async (): Promise<Account[]> => {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ACCOUNTS;
  } catch (e) {
    console.error('Failed to load accounts', e);
    return DEFAULT_ACCOUNTS;
  }
};

export const saveAccounts = async (accs: Account[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
};

export const loadCategories = async (): Promise<Category[]> => {
  try {
    const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to load categories', e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = async (cats: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export const exportDataToFile = async (data: AppData): Promise<boolean> => {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    
    if (Platform.OS === 'web') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ledgeit_backup.json';
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    const fileUri = ((FileSystem as any).documentDirectory || '') + 'ledgeit_backup.json';
    await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (!(await Sharing.isAvailableAsync())) {
      alert('Sharing is not available on this platform');
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Export LedgeIt Data',
      UTI: 'public.json',
    });
    
    return true;
  } catch (e) {
    console.error('Export failed', e);
    alert('Failed to export data: ' + (e instanceof Error ? e.message : String(e)));
    return false;
  }
};

export const importDataFromFile = async (): Promise<AppData | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    let contents = '';
    const asset = result.assets[0];
    
    if (Platform.OS === 'web') {
      if ((asset as any).file) {
        contents = await (asset as any).file.text();
      } else {
        const response = await fetch(asset.uri);
        contents = await response.text();
      }
    } else {
      contents = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    const parsedData = JSON.parse(contents);
    
    if (
      parsedData &&
      Array.isArray(parsedData.transactions) &&
      Array.isArray(parsedData.accounts) &&
      Array.isArray(parsedData.categories)
    ) {
      return parsedData as AppData;
    } else {
      throw new Error('Invalid backup file structure. Must contain transactions, accounts, and categories.');
    }
  } catch (e) {
    console.error('Import failed', e);
    alert('Import failed: ' + (e instanceof Error ? e.message : String(e)));
    return null;
  }
};

export const loadCloudBackups = async (): Promise<CloudBackup[]> => {
  try {
    const rawBackups = await AsyncStorage.getItem(CLOUD_BACKUPS_KEY);
    return rawBackups ? JSON.parse(rawBackups) : [];
  } catch (e) {
    console.error('Failed to load cloud backups', e);
    return [];
  }
};

export const saveCloudBackups = async (backups: CloudBackup[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CLOUD_BACKUPS_KEY, JSON.stringify(backups));
  } catch (e) {
    console.error('Failed to save cloud backups', e);
  }
};

export const createCloudBackup = async (data: AppData, deviceName: string): Promise<CloudBackup> => {
  const backups = await loadCloudBackups();
  const newBackup: CloudBackup = {
    id: `backup_${Date.now()}`,
    timestamp: new Date().toISOString(),
    device: deviceName || 'Mobile Device',
    data: JSON.parse(JSON.stringify(data)),
  };
  
  const updatedBackups = [newBackup, ...backups].slice(0, 5);
  await saveCloudBackups(updatedBackups);
  return newBackup;
};

export const deleteCloudBackup = async (backupId: string): Promise<void> => {
  const backups = await loadCloudBackups();
  const updated = backups.filter(b => b.id !== backupId);
  await saveCloudBackups(updated);
};

export const loadTermsAcceptance = async (): Promise<boolean> => {
  try {
    const val = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
};

export const saveTermsAcceptance = async (accepted: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, accepted ? 'true' : 'false');
  } catch (e) {
    console.error(e);
  }
};




