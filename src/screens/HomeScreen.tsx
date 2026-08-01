import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Transaction } from '../utils/storage';

interface HomeScreenProps {
  onAddTransaction: (type?: 'income' | 'expense' | 'transfer') => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: 'transactions' | 'budgets' | 'stats' | 'accounts' | 'settings') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onAddTransaction, 
  onEditTransaction,
  onNavigateTab 
}) => {
  const { 
    colors, 
    transactions, 
    accounts, 
    categories, 
    currencySymbol 
  } = useApp();

  // Current month date calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Current Month Transactions
  const monthlyTxs = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  // Monthly Income, Expense, Saved
  const { monthlyIncome, monthlyExpense, monthlyNet } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    monthlyTxs.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    return {
      monthlyIncome: inc,
      monthlyExpense: exp,
      monthlyNet: inc - exp
    };
  }, [monthlyTxs]);

  // Total Account Balances Calculation
  const accountBalances = useMemo(() => {
    const map: Record<string, number> = {};
    accounts.forEach(acc => {
      map[acc.id] = 0;
    });

    transactions.forEach(t => {
      if (t.type === 'income' && t.account && map[t.account] !== undefined) {
        map[t.account] += t.amount;
      } else if (t.type === 'expense' && t.account && map[t.account] !== undefined) {
        map[t.account] -= t.amount;
      } else if (t.type === 'transfer') {
        if (t.account && map[t.account] !== undefined) map[t.account] -= t.amount;
        if (t.toAccount && map[t.toAccount] !== undefined) map[t.toAccount] += t.amount;
      }
    });

    return map;
  }, [accounts, transactions]);

  const totalNetWorth = useMemo(() => {
    return Object.values(accountBalances).reduce((sum, b) => sum + b, 0);
  }, [accountBalances]);

  // Budget Calculations
  const budgetStats = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;

    categories.forEach(cat => {
      if (cat.type === 'expense' && cat.budget && cat.budget > 0) {
        totalBudget += cat.budget;
        
        const spent = monthlyTxs
          .filter(t => t.type === 'expense' && t.category === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        
        totalSpent += spent;
      }
    });

    const ratio = totalBudget > 0 ? totalSpent / totalBudget : 0;
    const remaining = totalBudget - totalSpent;
    const pct = Math.min(Math.round(ratio * 100), 999);

    let statusText = 'On Track';
    let statusColor = colors.success;
    let statusBg = '#E6F4EA';

    if (ratio > 1) {
      statusText = 'Over Budget';
      statusColor = colors.error;
      statusBg = '#FFEBEE';
    } else if (ratio >= 0.75) {
      statusText = 'Near Limit';
      statusColor = '#D97706';
      statusBg = '#FEF3C7';
    }

    return {
      totalBudget,
      totalSpent,
      remaining,
      pct,
      ratio: Math.min(ratio, 1),
      statusText,
      statusColor,
      statusBg
    };
  }, [categories, monthlyTxs, colors]);

  // Top Expense Categories
  const topCategories = useMemo(() => {
    const catSpent: Record<string, number> = {};
    monthlyTxs.filter(t => t.type === 'expense').forEach(t => {
      catSpent[t.category] = (catSpent[t.category] || 0) + t.amount;
    });

    return Object.keys(catSpent)
      .map(catId => {
        const cat = categories.find(c => c.id === catId || c.name === catId);
        return {
          id: catId,
          name: cat ? cat.name : catId,
          icon: cat ? cat.icon : 'category',
          color: cat ? cat.color : colors.primary,
          budget: cat ? cat.budget : undefined,
          spent: catSpent[catId],
        };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 4);
  }, [monthlyTxs, categories, colors]);

  // Recent 5 Transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [transactions]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Greeting & Date Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.greetingSub, { color: colors.onSurfaceVariant }]}>
            {monthNames[currentMonth]} {currentYear} OVERVIEW
          </Text>
          <Text style={[styles.greetingTitle, { color: colors.onSurface }]}>
            Dashboard
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.settingsIconBtn, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => onNavigateTab('settings')}
        >
          <MaterialIcons name="tune" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Hero Net Worth Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}>
        <Text style={[styles.heroLabel, { color: colors.onSurfaceVariant }]}>NET WORTH BALANCE</Text>
        <Text style={[styles.heroAmount, { color: colors.onSurface }]}>
          {currencySymbol}{totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>

        {/* Cashflow Row */}
        <View style={styles.cashflowRow}>
          <View style={styles.cashflowItem}>
            <View style={[styles.cashflowBadge, { backgroundColor: '#E6F4EA' }]}>
              <MaterialIcons name="arrow-downward" size={14} color={colors.success} />
              <Text style={[styles.cashflowBadgeText, { color: colors.success }]}>Income</Text>
            </View>
            <Text style={[styles.cashflowVal, { color: colors.success }]}>
              +{currencySymbol}{monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.cashflowDivider, { backgroundColor: colors.outline }]} />

          <View style={styles.cashflowItem}>
            <View style={[styles.cashflowBadge, { backgroundColor: '#FFEBEE' }]}>
              <MaterialIcons name="arrow-upward" size={14} color={colors.error} />
              <Text style={[styles.cashflowBadgeText, { color: colors.error }]}>Expenses</Text>
            </View>
            <Text style={[styles.cashflowVal, { color: colors.error }]}>
              -{currencySymbol}{monthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => onAddTransaction('expense')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="remove-circle-outline" size={18} color={colors.onPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.quickActionText, { color: colors.onPrimary }]}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.primaryContainer }]}
            onPress={() => onAddTransaction('income')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-circle-outline" size={18} color={colors.onPrimaryContainer} style={{ marginRight: 6 }} />
            <Text style={[styles.quickActionText, { color: colors.onPrimaryContainer }]}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => onAddTransaction('transfer')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="swap-horiz" size={18} color={colors.onSurface} style={{ marginRight: 6 }} />
            <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly Budget Pace Widget */}
      <TouchableOpacity 
        style={[styles.widgetCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}
        onPress={() => onNavigateTab('budgets')}
        activeOpacity={0.8}
      >
        <View style={styles.widgetHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.widgetIconCircle, { backgroundColor: colors.primaryContainer }]}>
              <MaterialIcons name="pie-chart" size={20} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.widgetTitle, { color: colors.onSurface }]}>Monthly Budget Pace</Text>
              <Text style={[styles.widgetSubTitle, { color: colors.onSurfaceVariant }]}>
                {budgetStats.totalBudget > 0 
                  ? `${currencySymbol}${budgetStats.totalSpent.toFixed(2)} of ${currencySymbol}${budgetStats.totalBudget.toFixed(2)}`
                  : 'No budgets set for categories'}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: budgetStats.statusBg }]}>
            <Text style={[styles.statusBadgeText, { color: budgetStats.statusColor }]}>
              {budgetStats.statusText}
            </Text>
          </View>
        </View>

        {budgetStats.totalBudget > 0 && (
          <View style={styles.widgetProgressContainer}>
            <View style={[styles.widgetProgressTrack, { backgroundColor: colors.surfaceVariant }]}>
              <View 
                style={[
                  styles.widgetProgressFill, 
                  { 
                    width: `${Math.min(budgetStats.pct, 100)}%`,
                    backgroundColor: budgetStats.statusColor
                  }
                ]} 
              />
            </View>
            <View style={styles.widgetProgressFooter}>
              <Text style={[styles.widgetFooterText, { color: colors.onSurfaceVariant }]}>
                {budgetStats.pct}% Spent
              </Text>
              <Text style={[
                styles.widgetFooterText, 
                { color: budgetStats.remaining >= 0 ? colors.success : colors.error, fontWeight: '700' }
              ]}>
                {budgetStats.remaining >= 0 
                  ? `${currencySymbol}${budgetStats.remaining.toFixed(2)} remaining` 
                  : `${currencySymbol}${Math.abs(budgetStats.remaining).toFixed(2)} over limit`}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Vaults & Accounts Carousel */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Vaults & Accounts</Text>
        <TouchableOpacity onPress={() => onNavigateTab('accounts')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>Manage ({accounts.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselScroll}>
        {accounts.map(acc => {
          const bal = accountBalances[acc.id] || 0;
          return (
            <TouchableOpacity
              key={acc.id}
              style={[styles.accountCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}
              onPress={() => onNavigateTab('accounts')}
              activeOpacity={0.8}
            >
              <View style={styles.accCardTop}>
                <View style={[styles.accIconCircle, { backgroundColor: acc.color + '20' }]}>
                  <MaterialIcons name={acc.icon as any} size={20} color={acc.color} />
                </View>
                <Text style={[styles.accTypeTag, { color: colors.onSurfaceVariant }]}>
                  {acc.type.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.accName, { color: colors.onSurface }]} numberOfLines={1}>
                {acc.name}
              </Text>
              <Text style={[styles.accBalance, { color: bal >= 0 ? colors.onSurface : colors.error }]}>
                {currencySymbol}{bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Top Category Spending */}
      {topCategories.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Top Category Burn</Text>
            <TouchableOpacity onPress={() => onNavigateTab('stats')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Analytics</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {topCategories.map(cat => {
              const pct = cat.budget ? Math.min(Math.round((cat.spent / cat.budget) * 100), 100) : 0;
              return (
                <View 
                  key={cat.id} 
                  style={[styles.catCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}
                >
                  <View style={styles.catCardTop}>
                    <View style={[styles.catIconContainer, { backgroundColor: cat.color + '20' }]}>
                      <MaterialIcons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <Text style={[styles.catSpentVal, { color: colors.onSurface }]}>
                      {currencySymbol}{cat.spent.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={[styles.catTitle, { color: colors.onSurface }]} numberOfLines={1}>
                    {cat.name}
                  </Text>

                  {cat.budget ? (
                    <View style={styles.catProgressBox}>
                      <View style={[styles.catTrack, { backgroundColor: colors.surfaceVariant }]}>
                        <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                      </View>
                      <Text style={[styles.catSub, { color: colors.onSurfaceVariant }]}>
                        {pct}% of {currencySymbol}{cat.budget}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.catSub, { color: colors.outline }]}>No budget target</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Recent Transactions Feed */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => onNavigateTab('transactions')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View All ({transactions.length})</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}>
            <MaterialIcons name="receipt-long" size={36} color={colors.outline} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No transactions logged yet.</Text>
            <TouchableOpacity 
              style={[styles.addFirstBtn, { backgroundColor: colors.primary }]}
              onPress={() => onAddTransaction()}
            >
              <Text style={[styles.addFirstBtnText, { color: colors.onPrimary }]}>+ Log First Transaction</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.txList}>
            {recentTransactions.map(t => {
              const cat = categories.find(c => c.id === t.category || c.name === t.category);
              const acc = accounts.find(a => a.id === t.account);
              const isInc = t.type === 'income';

              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.txItem, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}
                  onPress={() => onEditTransaction(t)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.txIconBox, { backgroundColor: (cat?.color || colors.primary) + '20' }]}>
                    <MaterialIcons 
                      name={(cat?.icon || 'receipt') as any} 
                      size={22} 
                      color={cat?.color || colors.primary} 
                    />
                  </View>

                  <View style={styles.txMeta}>
                    <Text style={[styles.txCategoryName, { color: colors.onSurface }]}>
                      {cat?.name || t.category}
                    </Text>
                    <Text style={[styles.txSubText, { color: colors.onSurfaceVariant }]}>
                      {acc?.name || 'Account'} • {t.date}
                    </Text>
                  </View>

                  <Text style={[
                    styles.txAmountText,
                    { color: isInc ? colors.success : colors.onSurface }
                  ]}>
                    {isInc ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '900',
  },
  settingsIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  cashflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cashflowItem: {
    flex: 1,
  },
  cashflowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  cashflowBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  cashflowVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  cashflowDivider: {
    width: 1,
    height: 32,
    opacity: 0.2,
    marginHorizontal: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  widgetCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  widgetSubTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  widgetProgressContainer: {
    marginTop: 12,
  },
  widgetProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  widgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  widgetProgressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  widgetFooterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  carouselScroll: {
    marginBottom: 24,
  },
  accountCard: {
    width: 160,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 12,
  },
  accCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  accIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accTypeTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  accName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  accBalance: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  catCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catSpentVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  catTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  catProgressBox: {
    gap: 4,
  },
  catTrack: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  catSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  txList: {
    gap: 8,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txMeta: {
    flex: 1,
  },
  txCategoryName: {
    fontSize: 14,
    fontWeight: '700',
  },
  txSubText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  txAmountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyBox: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 16,
  },
  addFirstBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
