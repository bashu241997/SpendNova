import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  ScrollView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Transaction, Account, Category } from '../utils/storage';
import { CalendarView } from '../components/CalendarView';

interface TransactionsScreenProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

type TabType = 'daily' | 'calendar' | 'monthly';

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  onAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, accounts, categories, colors, currencySymbol } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [currentFilterMonth, setCurrentFilterMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handlePrevMonth = () => {
    setCurrentFilterMonth(new Date(currentFilterMonth.getFullYear(), currentFilterMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentFilterMonth(new Date(currentFilterMonth.getFullYear(), currentFilterMonth.getMonth() + 1, 1));
  };

  const filterYear = currentFilterMonth.getFullYear();
  const filterMonth = currentFilterMonth.getMonth() + 1;

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      const inMonth = txDate.getFullYear() === filterYear && (txDate.getMonth() + 1) === filterMonth;
      
      if (!inMonth) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const categoryName = categories.find(c => c.id === t.category || c.name === t.category)?.name.toLowerCase() || '';
        const accountName = accounts.find(a => a.id === t.account || a.name === t.account)?.name.toLowerCase() || '';
        const desc = t.description.toLowerCase();
        return desc.includes(query) || categoryName.includes(query) || accountName.includes(query);
      }

      return true;
    });
  };

  const filteredList = getFilteredTransactions();

  const getAccountInfo = (id: string): Account | undefined => {
    return accounts.find(a => a.id === id || a.name === id);
  };

  const getCategoryInfo = (id: string, type: string): Category | undefined => {
    if (type === 'transfer') {
      return { id: 'transfer', name: 'Transfer', type: 'expense', icon: 'swap-horiz', color: colors.primary };
    }
    return categories.find(c => c.id === id || c.name === id);
  };

  const renderTransactionItem = (item: Transaction) => {
    const accountInfo = getAccountInfo(item.account);
    const toAccountInfo = item.toAccount ? getAccountInfo(item.toAccount) : undefined;
    const categoryInfo = getCategoryInfo(item.category, item.type);

    let prefix = '-';
    let amtColor = colors.error;
    if (item.type === 'income') {
      prefix = '+';
      amtColor = colors.success;
    } else if (item.type === 'transfer') {
      prefix = '';
      amtColor = colors.info;
    }

    return (
      <TouchableOpacity 
        style={[styles.txItem, { borderBottomColor: colors.surfaceVariant }]}
        onPress={() => onEditTransaction(item)}
      >
        <View style={[styles.txIconWrapper, { backgroundColor: categoryInfo?.color || colors.primary }]}>
          <MaterialIcons name={(categoryInfo?.icon || 'help-outline') as any} size={20} color="#FFF" />
        </View>

        <View style={styles.txMainInfo}>
          <Text style={[styles.txCategory, { color: colors.onBackground }]} numberOfLines={1}>
            {categoryInfo?.name || item.category}
          </Text>
          <Text style={[styles.txDetails, { color: colors.outline }]} numberOfLines={1}>
            {accountInfo?.name || 'Cash'} {toAccountInfo ? `➔ ${toAccountInfo.name}` : ''}
            {item.description ? ` | ${item.description}` : ''}
          </Text>
        </View>

        <View style={styles.txRightInfo}>
          <Text style={[styles.txAmount, { color: amtColor }]}>
            {prefix}{currencySymbol}{item.amount.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDailyTab = () => {
    const groups: { [date: string]: { income: number; expense: number; list: Transaction[] } } = {};
    
    filteredList.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = { income: 0, expense: 0, list: [] };
      }
      if (t.type === 'income') groups[t.date].income += t.amount;
      else if (t.type === 'expense') groups[t.date].expense += t.amount;
      groups[t.date].list.push(t);
    });

    const groupKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    if (groupKeys.length === 0) {
      return (
        <View style={styles.emptyView}>
          <Text style={[styles.emptyText, { color: colors.outline }]}>No records in this period</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={groupKeys}
        keyExtractor={item => item}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item: dateKey }) => {
          const group = groups[dateKey];
          const dateObj = new Date(dateKey);
          const dayNum = dateObj.getDate();
          const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
          
          return (
            <View style={[styles.dayCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.dayHeader, { borderBottomColor: colors.surfaceVariant }]}>
                <View style={styles.dayDateWrapper}>
                  <Text style={[styles.dayNumber, { color: colors.onSurface }]}>{dayNum}</Text>
                  <View style={styles.dayMeta}>
                    <Text style={[styles.dayOfWeek, { color: colors.outline }]}>{dayName}</Text>
                    <Text style={[styles.dayFullDate, { color: colors.outline }]}>{dateKey}</Text>
                  </View>
                </View>
                <View style={styles.dayTotals}>
                  {group.income > 0 && (
                    <Text style={[styles.dayTotalIncome, { color: colors.success }]}>
                      +{currencySymbol}{group.income.toFixed(2)}
                    </Text>
                  )}
                  {group.expense > 0 && (
                    <Text style={[styles.dayTotalExpense, { color: colors.error }]}>
                      -{currencySymbol}{group.expense.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>

              {group.list.map(t => (
                <View key={t.id}>
                  {renderTransactionItem(t)}
                </View>
              ))}
            </View>
          );
        }}
      />
    );
  };

  const renderCalendarTab = () => {
    const dayTxs = transactions.filter(t => t.date === selectedDate);
    
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <CalendarView
          transactions={transactions}
          colors={colors}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        
        <View style={styles.calendarListHeader}>
          <Text style={[styles.calendarListTitle, { color: colors.onBackground }]}>
            Records on {selectedDate}
          </Text>
          <Text style={[styles.calendarListCount, { color: colors.outline }]}>
            {dayTxs.length} items
          </Text>
        </View>

        {dayTxs.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={[styles.emptyText, { color: colors.outline }]}>No records on this day</Text>
          </View>
        ) : (
          <View style={[styles.dayCard, { backgroundColor: colors.surface, marginHorizontal: 16 }]}>
            {dayTxs.map(t => (
              <View key={t.id}>
                {renderTransactionItem(t)}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderMonthlyTab = () => {
    if (filteredList.length === 0) {
      return (
        <View style={styles.emptyView}>
          <Text style={[styles.emptyText, { color: colors.outline }]}>No records in this period</Text>
        </View>
      );
    }

    const sortedList = [...filteredList].sort((a, b) => b.date.localeCompare(a.date));

    return (
      <FlatList
        data={sortedList}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <View style={[styles.dayCard, { backgroundColor: colors.surface, paddingHorizontal: 12 }]}>
            <Text style={[styles.monthlyDateLabel, { color: colors.outline }]}>{item.date}</Text>
            {renderTransactionItem(item)}
          </View>
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topHeader}>
        <View style={styles.periodRow}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.periodArrow}>
            <MaterialIcons name="chevron-left" size={28} color={colors.onBackground} />
          </TouchableOpacity>
          <Text style={[styles.periodTitle, { color: colors.onBackground }]}>
            {monthNames[filterMonth - 1]} {filterYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.periodArrow}>
            <MaterialIcons name="chevron-right" size={28} color={colors.onBackground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialIcons name="search" size={20} color={colors.outline} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search category, note, account..."
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.onSurfaceVariant }]}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={colors.outline} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceVariant }]}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {(['daily', 'calendar', 'monthly'] as const).map(tab => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabItem,
                  active && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
                ]}
              >
                <Text 
                  style={[
                    styles.tabLabel, 
                    { color: active ? colors.primary : colors.outline },
                    active && { fontWeight: '700' }
                  ]}
                >
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.body}>
        {activeTab === 'daily' && renderDailyTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'monthly' && renderMonthlyTab()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  periodArrow: {
    padding: 4,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tabContainer: {
    borderBottomWidth: 1,
  },
  tabScroll: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
  },
  emptyView: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  dayCard: {
    borderRadius: 16,
    marginBottom: 16,
    paddingBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
  },
  dayDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  dayMeta: {
    justifyContent: 'center',
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayFullDate: {
    fontSize: 9,
  },
  dayTotals: {
    alignItems: 'flex-end',
  },
  dayTotalIncome: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayTotalExpense: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  txIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txMainInfo: {
    flex: 1,
  },
  txCategory: {
    fontSize: 14,
    fontWeight: '600',
  },
  txDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  txRightInfo: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekKeyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  monthlyDateLabel: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  calendarListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  calendarListTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  calendarListCount: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
