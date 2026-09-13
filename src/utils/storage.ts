import { SecureStorage } from './secureStorage';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import Papa from 'papaparse';


export type AccountType = 'savings' | 'credit' | 'cash' | 'custom';


export interface Account {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: AccountType;
  initialBalance?: number;
}

export interface SubCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budget?: number;
  subcategories?: SubCategory[];
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
  goalId?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  color: string;
  includedAccounts: string[];
  includedCategories: string[];
  excludedCategories: string[];
  includedSubcategories: string[];
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  frequency: 'monthly' | 'yearly' | 'weekly';
  nextDueDate: string;
  account: string;
  category: string;
  color: string;
  icon: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
  icon: string;
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
  budgets?: Budget[];
  recurring?: RecurringTransaction[];
  goals?: Goal[];
}

export interface AppPreferences {
  accentTheme: 'tonal' | 'slate' | 'nature' | 'classic' | 'core_blue';
  country: string;
}

const TRANSACTIONS_KEY = 'ledgeit_transactions';
const ACCOUNTS_KEY = 'ledgeit_accounts';
const CATEGORIES_KEY = 'ledgeit_categories';
const BUDGETS_KEY = 'ledgeit_budgets';
const RECURRING_KEY = 'ledgeit_recurring';
const GOALS_KEY = 'ledgeit_goals';
const CLOUD_BACKUPS_KEY = 'ledgeit_cloud_backups';
const TERMS_ACCEPTED_KEY = 'ledgeit_terms_accepted';
const PREFERENCES_KEY = 'spendnova_preferences';


export const DEFAULT_ACCOUNTS: Account[] = [];

export const DEFAULT_CATEGORIES: Category[] = [];

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const raw = await SecureStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.transactions)) return parsed.transactions;
    return [];
  } catch (e) {
    console.error('Failed to load transactions', e);
    return [];
  }
};

export const saveTransactions = async (txs: Transaction[]): Promise<void> => {
  try {
    await SecureStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
};

export const loadAccounts = async (): Promise<Account[]> => {
  try {
    const raw = await SecureStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return DEFAULT_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.accounts)) return parsed.accounts;
    return DEFAULT_ACCOUNTS;
  } catch (e) {
    console.error('Failed to load accounts', e);
    return DEFAULT_ACCOUNTS;
  }
};

export const saveAccounts = async (accs: Account[]): Promise<void> => {
  try {
    await SecureStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
};

export const loadCategories = async (): Promise<Category[]> => {
  try {
    const raw = await SecureStorage.getItem(CATEGORIES_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.categories)) return parsed.categories;
    return DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to load categories', e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = async (cats: Category[]): Promise<void> => {
  try {
    await SecureStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export const loadBudgets = async (): Promise<Budget[]> => {
  try {
    const raw = await SecureStorage.getItem(BUDGETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.budgets)) return parsed.budgets;
    return [];
  } catch (e) {
    console.error('Failed to load budgets', e);
    return [];
  }
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
  try {
    await SecureStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save budgets', e);
  }
};

export const loadRecurring = async (): Promise<RecurringTransaction[]> => {
  try {
    const raw = await SecureStorage.getItem(RECURRING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.recurring)) return parsed.recurring;
    return [];
  } catch (e) {
    console.error('Failed to load recurring transactions', e);
    return [];
  }
};

export const saveRecurring = async (recurring: RecurringTransaction[]): Promise<void> => {
  try {
    await SecureStorage.setItem(RECURRING_KEY, JSON.stringify(recurring));
  } catch (e) {
    console.error('Failed to save recurring transactions', e);
  }
};

export const loadGoals = async (): Promise<Goal[]> => {
  try {
    const raw = await SecureStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.goals)) return parsed.goals;
    return [];
  } catch (e) {
    console.error('Failed to load goals', e);
    return [];
  }
};

export const saveGoals = async (goals: Goal[]): Promise<void> => {
  try {
    await SecureStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals', e);
  }
};

export const exportDataToFile = async (data: AppData): Promise<boolean> => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);

    const rows = data.transactions.map(tx => {
      const acc = data.accounts.find(a => a.id === tx.account);
      const toAcc = data.accounts.find(a => a.id === tx.toAccount);
      const cat = data.categories.find(c => c.id === tx.category);
      let subName = '', subColor = '', subIcon = '';
      if (tx.subcategory && cat?.subcategories) {
        const sub = cat.subcategories.find(s => s.id === tx.subcategory || s.name === tx.subcategory);
        if (sub) {
          subName = (sub as any).name || String(sub);
          subColor = (sub as any).color || '';
          subIcon = (sub as any).icon || '';
        } else {
          subName = tx.subcategory;
        }
      }

      return {
        Date: tx.date,
        Type: tx.type,
        Amount: tx.amount,
        Description: tx.description,
        CategoryName: cat?.name || '',
        CategoryColor: cat?.color || '',
        CategoryIcon: cat?.icon || '',
        CategoryType: cat?.type || '',
        SubcategoryName: subName,
        SubcategoryColor: subColor,
        SubcategoryIcon: subIcon,
        AccountName: acc?.name || '',
        AccountColor: acc?.color || '',
        AccountIcon: (acc as any)?.icon || '',
        AccountType: acc?.type || '',
        AccountInitialBalance: (acc as any)?.initialBalance || 0,
        ToAccountName: toAcc?.name || '',
        ToAccountColor: toAcc?.color || '',
        ToAccountIcon: (toAcc as any)?.icon || '',
        ToAccountType: toAcc?.type || '',
        Notes: (tx as any).notes || ''
      };
    });

    const csvString = Papa.unparse(rows);
    const fileName = `spendnova_${dateStr}.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    const fileUri = ((FileSystem as any).documentDirectory || '') + fileName;
    await FileSystem.writeAsStringAsync(fileUri, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (!(await Sharing.isAvailableAsync())) {
      alert('Sharing is not available on this platform');
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export SpendNova Data',
      UTI: 'public.comma-separated-values-text',
    });
    
    return true;
  } catch (e) {
    console.error('Export failed', e);
    alert('Failed to export data: ' + (e instanceof Error ? e.message : String(e)));
    return false;
  }
};

export const exportSampleTemplate = async (): Promise<boolean> => {
  try {
    const sampleRows = [
      {
        Date: new Date().toISOString().slice(0, 10),
        Type: 'expense',
        Amount: 45.50,
        Description: 'Weekly Groceries',
        CategoryName: 'Food & Dining',
        CategoryColor: '#EF4444',
        CategoryIcon: 'restaurant',
        CategoryType: 'expense',
        SubcategoryName: 'Groceries',
        SubcategoryColor: '#EF4444',
        SubcategoryIcon: 'shopping-cart',
        AccountName: 'Main Checking',
        AccountColor: '#3B82F6',
        AccountIcon: 'account-balance',
        AccountType: 'savings',
        ToAccountName: '',
        ToAccountColor: '',
        ToAccountIcon: '',
        ToAccountType: '',
        Notes: 'Bought fresh produce and groceries'
      },
      {
        Date: new Date().toISOString().slice(0, 10),
        Type: 'income',
        Amount: 3500.00,
        Description: 'Monthly Salary Deposit',
        CategoryName: 'Salary',
        CategoryColor: '#10B981',
        CategoryIcon: 'work',
        CategoryType: 'income',
        SubcategoryName: 'Primary Income',
        SubcategoryColor: '#10B981',
        SubcategoryIcon: 'attach-money',
        AccountName: 'Main Checking',
        AccountColor: '#3B82F6',
        AccountIcon: 'account-balance',
        AccountType: 'savings',
        ToAccountName: '',
        ToAccountColor: '',
        ToAccountIcon: '',
        ToAccountType: '',
        Notes: 'Direct deposit payroll'
      },
      {
        Date: new Date().toISOString().slice(0, 10),
        Type: 'transfer',
        Amount: 500.00,
        Description: 'Savings Goal Deposit',
        CategoryName: 'Transfer',
        CategoryColor: '#6366F1',
        CategoryIcon: 'swap-horiz',
        CategoryType: 'expense',
        SubcategoryName: '',
        SubcategoryColor: '',
        SubcategoryIcon: '',
        AccountName: 'Main Checking',
        AccountColor: '#3B82F6',
        AccountIcon: 'account-balance',
        AccountType: 'savings',
        ToAccountName: 'Emergency Fund',
        ToAccountColor: '#10B981',
        ToAccountIcon: 'savings',
        ToAccountType: 'savings',
        Notes: 'Monthly automated transfer'
      }
    ];

    const csvString = Papa.unparse(sampleRows);
    const fileName = `spendnova_sample_template.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    const fileUri = ((FileSystem as any).documentDirectory || '') + fileName;
    await FileSystem.writeAsStringAsync(fileUri, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (!(await Sharing.isAvailableAsync())) {
      alert('Sharing is not available on this platform');
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Download SpendNova CSV Template',
      UTI: 'public.comma-separated-values-text',
    });

    return true;
  } catch (e) {
    console.error('Template export failed', e);
    alert('Failed to export sample template: ' + (e instanceof Error ? e.message : String(e)));
    return false;
  }
};

export const importDataFromFile = async (): Promise<AppData | null> => {
  try {
    let contents = '';

    if (Platform.OS === 'web') {
      contents = await new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,text/csv,.json,application/json';
        input.style.display = 'none';
        document.body.appendChild(input);
        
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          document.body.removeChild(input);
          if (!file) {
            resolve('');
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file natively on Web.'));
          reader.readAsText(file);
        };
        input.click();
      });
      
      if (!contents) return null;
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'public.comma-separated-values-text', 'application/json', 'public.json'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      
      const asset = result.assets[0];
      contents = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    try {
      const parsed = JSON.parse(contents);
      const data = parsed.data || parsed;
      if (Array.isArray(data.transactions) && Array.isArray(data.accounts) && Array.isArray(data.categories)) {
        return {
          transactions: data.transactions,
          accounts: data.accounts,
          categories: data.categories,
          budgets: Array.isArray(data.budgets) ? data.budgets : [],
          recurring: Array.isArray(data.recurring) ? data.recurring : [],
          goals: Array.isArray(data.goals) ? data.goals : [],
        };
      }
    } catch {
      // JSON parsing failed; continue with the legacy CSV importer below.
    }

    const parseResult = Papa.parse(contents, { header: true, skipEmptyLines: true });
    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      throw new Error('Invalid CSV file');
    }

    const rows: any[] = parseResult.data;
    if (rows.length === 0) return { transactions: [], accounts: [], categories: [] };

    const accountsMap = new Map<string, Account>();
    const categoriesMap = new Map<string, Category>();
    const transactions: Transaction[] = [];

    const generateId = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 6);

    for (const row of rows) {
      // Rehydrate Account
      let accId = '';
      if (row.AccountName) {
        const key = row.AccountName.toLowerCase();
        if (!accountsMap.has(key)) {
          accId = 'acc_' + generateId(row.AccountName);
          accountsMap.set(key, {
            id: accId,
            name: row.AccountName,
            color: row.AccountColor || '#64748B',
            icon: row.AccountIcon || 'account-balance',
            type: (row.AccountType as AccountType) || 'custom',
            initialBalance: parseFloat(row.AccountInitialBalance) || 0
          });
        } else {
          accId = accountsMap.get(key)!.id;
        }
      }

      // Rehydrate ToAccount
      let toAccId = '';
      if (row.ToAccountName) {
        const key = row.ToAccountName.toLowerCase();
        if (!accountsMap.has(key)) {
          toAccId = 'acc_' + generateId(row.ToAccountName);
          accountsMap.set(key, {
            id: toAccId,
            name: row.ToAccountName,
            color: row.ToAccountColor || '#64748B',
            icon: row.ToAccountIcon || 'account-balance',
            type: (row.ToAccountType as AccountType) || 'custom'
          });
        } else {
          toAccId = accountsMap.get(key)!.id;
        }
      }

      // Rehydrate Category & Subcategory
      let catId = '';
      let subcatId = '';
      if (row.CategoryName) {
        const catKey = row.CategoryName.toLowerCase();
        let cat = categoriesMap.get(catKey);
        
        if (!cat) {
          catId = 'cat_' + generateId(row.CategoryName);
          cat = {
            id: catId,
            name: row.CategoryName,
            color: row.CategoryColor || '#64748B',
            icon: row.CategoryIcon || 'label',
            type: (row.CategoryType || row.Type || 'expense') as 'income' | 'expense',
            subcategories: []
          };
          categoriesMap.set(catKey, cat);
        } else {
          catId = cat.id;
        }

        if (row.SubcategoryName) {
          let sub = cat.subcategories?.find(s => s.name.toLowerCase() === row.SubcategoryName.toLowerCase());
          if (!sub) {
            subcatId = 'sub_' + generateId(row.SubcategoryName);
            sub = {
              id: subcatId,
              name: row.SubcategoryName,
              color: row.SubcategoryColor || cat.color,
              icon: row.SubcategoryIcon || cat.icon
            };
            cat.subcategories = cat.subcategories || [];
            cat.subcategories.push(sub);
          } else {
            subcatId = sub.id;
          }
        }
      }

      transactions.push({
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        date: row.Date || new Date().toISOString(),
        type: (row.Type as 'income' | 'expense' | 'transfer') || 'expense',
        amount: parseFloat(row.Amount) || 0,
        description: row.Description || '',
        account: accId,
        toAccount: toAccId || undefined,
        category: catId,
        subcategory: subcatId || undefined,
        notes: row.Notes || ''
      });
    }

    return {
      transactions,
      accounts: Array.from(accountsMap.values()),
      categories: Array.from(categoriesMap.values())
    };
  } catch (error) {
    console.error('Import failed:', error);
    alert('Failed to import file. Choose a valid SpendNova CSV backup file.');
    return null;
  }
};

export const loadCloudBackups = async (): Promise<CloudBackup[]> => {
  try {
    const rawBackups = await SecureStorage.getItem(CLOUD_BACKUPS_KEY);
    return rawBackups ? JSON.parse(rawBackups) : [];
  } catch (e) {
    console.error('Failed to load cloud backups', e);
    return [];
  }
};

export const saveCloudBackups = async (backups: CloudBackup[]): Promise<void> => {
  try {
    await SecureStorage.setItem(CLOUD_BACKUPS_KEY, JSON.stringify(backups));
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
    const val = await SecureStorage.getItem(TERMS_ACCEPTED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
};

export const saveTermsAcceptance = async (accepted: boolean): Promise<void> => {
  try {
    await SecureStorage.setItem(TERMS_ACCEPTED_KEY, accepted ? 'true' : 'false');
  } catch (e) {
    console.error(e);
  }
};

export const loadAppPreferences = async (): Promise<AppPreferences | null> => {
  try {
    const raw = await SecureStorage.getItem(PREFERENCES_KEY);
    if (raw) return JSON.parse(raw);
    return { accentTheme: 'tonal', country: 'IN' };
  } catch (error) {
    console.error('Error loading app preferences:', error);
    return { accentTheme: 'tonal', country: 'IN' };
  }
};

export const saveAppPreferences = async (preferences: AppPreferences): Promise<void> => {
  try {
    await SecureStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
};

export const getAccountBalance = (acc: Account, transactions: Transaction[]): number => {
  const initial = acc.initialBalance || 0;
  let inc = 0, exp = 0, trOut = 0, trIn = 0;
  transactions.forEach(t => {
    if (t.account === acc.id || t.account === acc.name) {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
      if (t.type === 'transfer') trOut += t.amount;
    }
    if (t.type === 'transfer' && (t.toAccount === acc.id || t.toAccount === acc.name)) {
      trIn += t.amount;
    }
  });
  return initial + inc - exp - trOut + trIn;
};

export const getTotalNetWorth = (accounts: Account[], transactions: Transaction[]): number => {
  if (!Array.isArray(accounts) || accounts.length === 0) return 0;
  const safeTxs = Array.isArray(transactions) ? transactions : [];
  return accounts.reduce((sum, acc) => sum + getAccountBalance(acc, safeTxs), 0);
};



