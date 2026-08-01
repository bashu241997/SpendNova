import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { 
  ColorTheme, 
  ThemeType, 
  AccentTheme,
  getTheme 
} from '../theme/colors';
import { 
  Transaction, 
  Account, 
  Category, 
  Budget,
  RecurringTransaction,
  Goal,
  CloudBackup, 
  AppData,

  loadTransactions,
  saveTransactions,
  loadAccounts,
  saveAccounts,
  loadCategories,
  saveCategories,
  loadBudgets,
  saveBudgets,
  loadRecurring,
  saveRecurring,
  loadGoals,
  saveGoals,
  loadCloudBackups,
  saveCloudBackups,
  createCloudBackup,
  deleteCloudBackup,
  loadTermsAcceptance,
  saveTermsAcceptance,

} from '../utils/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  uploadDriveBackup, 
  downloadDriveBackup, 
  listDriveBackups, 
  deleteDriveBackup,
  DriveFile
} from '../utils/googleDrive';

export type CountryType = 'US' | 'IN' | 'EU' | 'UK';

export const countryToSymbolMap: Record<CountryType, string> = {
  US: '$',
  IN: '₹',
  EU: '€',
  UK: '£',
};

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AppContextProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  recurringTxs: RecurringTransaction[];
  goals: Goal[];
  loading: boolean;
  themeType: ThemeType;
  setThemeType: (theme: ThemeType) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (accent: AccentTheme) => void;
  colors: ColorTheme;
  country: CountryType;
  setCountry: (country: CountryType) => void;
  currencySymbol: string;
  hasAcceptedTerms: boolean;
  acceptTerms: () => Promise<void>;

  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addAccount: (acc: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (acc: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setCategoryBudget: (categoryId: string, budget?: number) => Promise<void>;

  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addRecurring: (r: Omit<RecurringTransaction, 'id'>) => Promise<void>;
  updateRecurring: (r: RecurringTransaction) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;

  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (g: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  depositToGoal: (goalId: string, amount: number) => Promise<void>;

  importBackupData: (data: AppData) => Promise<void>;
  mergeBackupData: (data: AppData) => Promise<void>;

  googleToken: string | null;
  googleUser: GoogleUser | null;
  setGoogleAuth: (token: string | null, user: GoogleUser | null) => Promise<void>;
  
  cloudBackups: DriveFile[];
  refreshCloudBackups: () => Promise<void>;
  backupToCloud: () => Promise<void>;
  restoreBackupFromCloud: (fileId: string) => Promise<void>;
  removeCloudBackup: (fileId: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeType, setThemeTypeState] = useState<ThemeType>('light');
  const [accentTheme, setAccentTheme] = useState<AccentTheme>('slate');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTxs, setRecurringTxs] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cloudBackups, setCloudBackups] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountryState] = useState<CountryType>('IN');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    if (systemScheme === 'dark') {
      setThemeTypeState('dark');
    } else {
      setThemeTypeState('light');
    }
  }, [systemScheme]);

  useEffect(() => {
    const init = async () => {
      const txs = await loadTransactions();
      const accs = await loadAccounts();
      const cats = await loadCategories();
      const bgs = await loadBudgets();
      const recs = await loadRecurring();
      const gls = await loadGoals();
      setTransactions(txs);
      setAccounts(accs);
      setCategories(cats);
      setBudgets(bgs);
      setRecurringTxs(recs);
      setGoals(gls);

      const termsAccepted = await loadTermsAcceptance();
      setHasAcceptedTerms(termsAccepted);

      const storedToken = await AsyncStorage.getItem('google_auth_token');
      const storedUser = await AsyncStorage.getItem('google_auth_user');
      
      if (storedToken && storedUser) {
        setGoogleToken(storedToken);
        setGoogleUser(JSON.parse(storedUser));
        const backups = await listDriveBackups(storedToken);
        setCloudBackups(backups);
      }
      
      setLoading(false);
    };
    init();
  }, []);

  const colors = getTheme(themeType, accentTheme);

  const setThemeType = (theme: ThemeType) => {
    setThemeTypeState(theme);
  };

  const setCountry = (newCountry: CountryType) => {
    setCountryState(newCountry);
  };

  const acceptTerms = async () => {
    setHasAcceptedTerms(true);
    await saveTermsAcceptance(true);
  };



  const currencySymbol = countryToSymbolMap[country];

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const updateTransaction = async (updatedTx: Transaction) => {
    const updated = transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const addAccount = async (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...acc,
      id: `acc_${Date.now()}`
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    await saveAccounts(updated);
  };

  const updateAccount = async (updatedAcc: Account) => {
    const updated = accounts.map(a => a.id === updatedAcc.id ? updatedAcc : a);
    setAccounts(updated);
    await saveAccounts(updated);
  };

  const deleteAccount = async (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    await saveAccounts(updated);

    const fallbackAccount = updated.length > 0 ? updated[0].id : '';
    const remappedTxs = transactions.map(t => {
      let changed = false;
      const patch = { ...t };
      if (t.account === id) {
        patch.account = fallbackAccount;
        changed = true;
      }
      if (t.toAccount === id) {
        patch.toAccount = fallbackAccount;
        changed = true;
      }
      return changed ? patch : t;
    });
    setTransactions(remappedTxs);
    await saveTransactions(remappedTxs);
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}`
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    await saveCategories(updated);
  };

  const updateCategory = async (updatedCat: Category) => {
    const updated = categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    setCategories(updated);
    await saveCategories(updated);
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await saveCategories(updated);

    const remappedTxs = transactions.map(t => {
      if (t.category === id) {
        return { ...t, category: 'cat_other_exp' };
      }
      return t;
    });
    setTransactions(remappedTxs);
    await saveTransactions(remappedTxs);
  };

  const setCategoryBudget = async (categoryId: string, budget?: number) => {
    const updated = categories.map(c => {
      if (c.id === categoryId) {
        return { ...c, budget: budget && budget > 0 ? budget : undefined };
      }
      return c;
    });
    setCategories(updated);
    await saveCategories(updated);
  };

  const importBackupData = async (data: AppData) => {
    setTransactions(data.transactions);
    setAccounts(data.accounts);
    setCategories(data.categories);
    await saveTransactions(data.transactions);
    await saveAccounts(data.accounts);
    await saveCategories(data.categories);
  };

  const mergeBackupData = async (data: AppData) => {
    const mergedTxs = [...transactions, ...data.transactions];
    const mergedAccs = [...accounts, ...data.accounts.filter(a => !accounts.find(existing => existing.id === a.id))];
    const mergedCats = [...categories, ...data.categories.filter(c => !categories.find(existing => existing.id === c.id))];
    
    setTransactions(mergedTxs);
    setAccounts(mergedAccs);
    setCategories(mergedCats);
    await saveTransactions(mergedTxs);
    await saveAccounts(mergedAccs);
    await saveCategories(mergedCats);
  };

  const setGoogleAuth = async (token: string | null, user: GoogleUser | null) => {
    setGoogleToken(token);
    setGoogleUser(user);
    if (token && user) {
      await AsyncStorage.setItem('google_auth_token', token);
      await AsyncStorage.setItem('google_auth_user', JSON.stringify(user));
      const backups = await listDriveBackups(token);
      setCloudBackups(backups);
    } else {
      await AsyncStorage.removeItem('google_auth_token');
      await AsyncStorage.removeItem('google_auth_user');
      setCloudBackups([]);
    }
  };

  const refreshCloudBackups = async () => {
    if (!googleToken) return;
    const backups = await listDriveBackups(googleToken);
    setCloudBackups(backups);
  };

  const backupToCloud = async () => {
    if (!googleToken) return;
    const currentData: AppData = { transactions, accounts, categories, budgets };
    const success = await uploadDriveBackup(JSON.stringify(currentData), googleToken);
    if (success) {
      await refreshCloudBackups();
    } else {
      alert('Failed to upload backup to Google Drive.');
    }
  };

  const restoreBackupFromCloud = async (fileId: string) => {
    if (!googleToken) return;
    const backupData = await downloadDriveBackup(fileId, googleToken);
    if (backupData) {
      await importBackupData(backupData);
    } else {
      alert('Failed to restore backup from Google Drive.');
    }
  };

  const removeCloudBackup = async (fileId: string) => {
    if (!googleToken) return;
    const success = await deleteDriveBackup(fileId, googleToken);
    if (success) {
      await refreshCloudBackups();
    } else {
      alert('Failed to delete backup from Google Drive.');
    }
  };

  const addBudget = async (b: Omit<Budget, 'id'>) => {
    const newB: Budget = {
      ...b,
      id: `bg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    const newList = [...budgets, newB];
    setBudgets(newList);
    await saveBudgets(newList);
  };

  const updateBudget = async (b: Budget) => {
    const newList = budgets.map(item => item.id === b.id ? b : item);
    setBudgets(newList);
    await saveBudgets(newList);
  };

  const deleteBudget = async (id: string) => {
    const newList = budgets.filter(item => item.id !== id);
    setBudgets(newList);
    await saveBudgets(newList);
  };

  const addRecurring = async (r: Omit<RecurringTransaction, 'id'>) => {
    const newR: RecurringTransaction = {
      ...r,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    const newList = [...recurringTxs, newR];
    setRecurringTxs(newList);
    await saveRecurring(newList);
  };

  const updateRecurring = async (r: RecurringTransaction) => {
    const newList = recurringTxs.map(item => item.id === r.id ? r : item);
    setRecurringTxs(newList);
    await saveRecurring(newList);
  };

  const deleteRecurring = async (id: string) => {
    const newList = recurringTxs.filter(item => item.id !== id);
    setRecurringTxs(newList);
    await saveRecurring(newList);
  };

  const addGoal = async (g: Omit<Goal, 'id'>) => {
    const newG: Goal = {
      ...g,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    const newList = [...goals, newG];
    setGoals(newList);
    await saveGoals(newList);
  };

  const updateGoal = async (g: Goal) => {
    const newList = goals.map(item => item.id === g.id ? g : item);
    setGoals(newList);
    await saveGoals(newList);
  };

  const deleteGoal = async (id: string) => {
    const newList = goals.filter(item => item.id !== id);
    setGoals(newList);
    await saveGoals(newList);
  };

  const depositToGoal = async (goalId: string, amount: number) => {
    const newList = goals.map(item => {
      if (item.id === goalId) {
        return { ...item, currentAmount: item.currentAmount + amount };
      }
      return item;
    });
    setGoals(newList);
    await saveGoals(newList);
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        accounts,
        categories,
        budgets,
        recurringTxs,
        goals,
        loading,
        themeType,
        setThemeType,
        accentTheme,
        setAccentTheme,
        colors,
        country,
        setCountry,
        currencySymbol,
        hasAcceptedTerms,
        acceptTerms,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        setCategoryBudget,
        addBudget,
        updateBudget,
        deleteBudget,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        importBackupData,
        mergeBackupData,
        
        googleToken,
        googleUser,
        setGoogleAuth,
        cloudBackups,
        refreshCloudBackups,
        backupToCloud,
        restoreBackupFromCloud,
        removeCloudBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
