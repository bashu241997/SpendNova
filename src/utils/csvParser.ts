import Papa from 'papaparse';
import { Account, Category, Transaction } from './storage';

export interface ParseCashewResult {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

const generateId = (prefix: string, name: string) => {
  return `${prefix}_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 7)}`;
};

export const parseCashewCsv = (csvText: string): ParseCashewResult => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rawRows = result.data as any[];
  
  const accountsMap = new Map<string, Account>();
  const categoriesMap = new Map<string, Category>();
  const transactions: Transaction[] = [];

  const getAccountId = (name: string): string => {
    const key = name.trim().toLowerCase();
    if (!key) return '';
    let acc = Array.from(accountsMap.values()).find(a => a.name.toLowerCase() === key);
    if (!acc) {
      acc = {
        id: generateId('acc', key),
        name: name.trim(),
        icon: 'account-balance',
        color: '#64748B',
        type: 'custom',
      };
      accountsMap.set(acc.id, acc);
    }
    return acc.id;
  };

  const getCategoryId = (name: string): string => {
    const key = name.trim().toLowerCase();
    if (!key) return '';
    let cat = Array.from(categoriesMap.values()).find(c => c.name.toLowerCase() === key);
    if (!cat) {
      cat = {
        id: generateId('cat', key),
        name: name.trim(),
        type: 'expense', // defaults
        icon: 'label',
        color: '#94A3B8',
        subcategories: [],
      };
      categoriesMap.set(cat.id, cat);
    }
    return cat.id;
  };

  for (const row of rawRows) {
    const accountName = row['account'] || '';
    let amount = parseFloat(row['amount'] || '0');
    const title = row['title'] || '';
    const note = row['note'] || '';
    let dateStr = row['date'] || '';
    const isIncome = row['income'] === 'true';
    const categoryName = row['category name'] || '';
    const subcategoryName = row['subcategory name'] || '';
    const extra = row['extra'] || '';
    const labelsStr = row['type'] || ''; // e.g. 'default'

    if (!accountName || isNaN(amount)) continue;

    // Handle Dates (Cashew format: 2026-08-01 21:40:48.000)
    if (dateStr.includes(' ')) {
      dateStr = dateStr.replace(' ', 'T');
    }

    // Check if it's a Transfer
    if (note.includes('Transferred Balance')) {
      // Cashew splits transfers into two rows. We only process the negative (outflow) row to create a single transfer
      if (amount < 0) {
        const match = note.match(/Transferred Balance\n(.*)\s*→\s*(.*)/);
        let fromAccountName = accountName;
        let toAccountName = '';
        if (match) {
          fromAccountName = match[1].trim();
          toAccountName = match[2].trim();
        }
        
        transactions.push({
          id: generateId('tx', 'transfer'),
          date: dateStr,
          amount: Math.abs(amount),
          type: 'transfer',
          account: getAccountId(fromAccountName),
          toAccount: toAccountName ? getAccountId(toAccountName) : undefined,
          category: getCategoryId('Transfer'),
          description: title || 'Transfer',
          notes: note,
          recurrence: extra,
          labels: [labelsStr].filter(Boolean),
        });
      }
      continue;
    }

    // Normal Transaction
    const accountId = getAccountId(accountName);
    const categoryId = categoryName ? getCategoryId(categoryName) : '';
    
    // Auto-correct category type based on actual amount/income flag
    if (categoryId) {
      const cat = categoriesMap.get(categoryId);
      if (cat && isIncome && cat.type === 'expense') {
        cat.type = 'income'; 
      }
    }

    if (subcategoryName && categoryId) {
      const cat = categoriesMap.get(categoryId);
      if (cat) {
        if (!cat.subcategories) cat.subcategories = [];
        if (!cat.subcategories.includes(subcategoryName)) {
          cat.subcategories.push(subcategoryName);
        }
      }
    }

    transactions.push({
      id: generateId('tx', 'imported'),
      date: dateStr,
      amount: Math.abs(amount), // our app uses positive amounts and determines sign by 'type'
      type: isIncome ? 'income' : 'expense',
      account: accountId,
      category: categoryId,
      description: title || categoryName || 'Transaction',
      notes: note,
      subcategory: subcategoryName,
      recurrence: extra,
      labels: [labelsStr].filter(Boolean),
    });
  }

  return {
    transactions,
    accounts: Array.from(accountsMap.values()),
    categories: Array.from(categoriesMap.values()),
  };
};
