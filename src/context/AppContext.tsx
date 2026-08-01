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
  CloudBackup, 
  AppData,

  loadTransactions,
  saveTransactions,
  loadAccounts,
  saveAccounts,
  loadCategories,
  saveCategories,
  loadCloudBackups,
  saveCloudBackups,
  createCloudBackup,
  deleteCloudBackup,
  loadTermsAcceptance,
  saveTermsAcceptance,

} from '../utils/storage';

export type CountryType = 'US' | 'IN' | 'EU' | 'UK';

export const countryToSymbolMap: Record<CountryType, string> = {
  US: '$',
  IN: '₹',
  EU: '€',
  UK: '£',
};

interface AppContextProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
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

  importBackupData: (data: AppData) => Promise<void>;
  mergeBackupData: (data: AppData) => Promise<void>;
  cloudBackups: CloudBackup[];
  refreshCloudBackups: () => Promise<void>;
  backupToCloud: (deviceName: string) => Promise<void>;
  restoreBackupFromCloud: (backupId: string) => Promise<void>;
  removeCloudBackup: (backupId: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeType, setThemeTypeState] = useState<ThemeType>('light');
  const [accentTheme, setAccentTheme] = useState<AccentTheme>('slate');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cloudBackups, setCloudBackups] = useState<CloudBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountryState] = useState<CountryType>('IN');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);


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
      setTransactions(txs);
      setAccounts(accs);
      setCategories(cats);
      
      const backups = await loadCloudBackups();
      setCloudBackups(backups);

      const termsAccepted = await loadTermsAcceptance();
      setHasAcceptedTerms(termsAccepted);


      
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

  const refreshCloudBackups = async () => {
    const backups = await loadCloudBackups();
    setGoogleBackups(backups);
  };

  const setGoogleBackups = (backups: CloudBackup[]) => {
    setCloudBackups(backups);
  };

  const backupToCloud = async (deviceName: string) => {
    const currentData: AppData = { transactions, accounts, categories };
    const newBackup = await createCloudBackup(currentData, deviceName);
    const backups = await loadCloudBackups();
    setGoogleBackups(backups);
  };

  const restoreBackupFromCloud = async (backupId: string) => {
    const backups = await loadCloudBackups();
    const backup = backups.find(b => b.id === backupId);
    if (backup) {
      await importBackupData(backup.data);
    }
  };

  const removeCloudBackup = async (backupId: string) => {
    await deleteCloudBackup(backupId);
    const backups = await loadCloudBackups();
    setGoogleBackups(backups);
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        accounts,
        categories,
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
        importBackupData,
        mergeBackupData,
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
