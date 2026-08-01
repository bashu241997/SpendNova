import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SectionList,
  ScrollView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Transaction, Account, Category } from '../utils/storage';

interface TransactionsScreenProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  onAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, accounts, categories, colors, currencySymbol } = useApp();

  const [currentFilterMonth, setCurrentFilterMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (monthScrollRef.current) {
      setTimeout(() => {
        const selectedIndex = currentFilterMonth.getMonth();
        monthScrollRef.current?.scrollTo({ x: Math.max(0, selectedIndex * 85 - 120), animated: true });
      }, 50);
    }
  }, [currentFilterMonth]);

  const filterYear = currentFilterMonth.getFullYear();
  const filterMonth = currentFilterMonth.getMonth() + 1;

  const { sections, summary } = useMemo(() => {
    let inc = 0;
    let exp = 0;

    const filtered = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getFullYear() === filterYear && (txDate.getMonth() + 1) === filterMonth;
    });

    const groups: Record<string, Transaction[]> = {};
    
    filtered.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else if (t.type === 'expense') exp += t.amount;

      const dateKey = t.date.split('T')[0] || t.date.split(' ')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    
    const sects = sortedDates.map(dateKey => {
      const dayTxs = groups[dateKey].sort((a, b) => b.date.localeCompare(a.date));
      let daySum = 0;
      dayTxs.forEach(t => {
        if (t.type === 'income') daySum += t.amount;
        if (t.type === 'expense') daySum -= t.amount;
      });

      return {
        title: dateKey,
        data: dayTxs,
        daySum
      };
    });

    return {
      sections: sects,
      summary: { inc, exp, net: inc - exp }
    };
  }, [transactions, filterYear, filterMonth]);

  const getAccountInfo = (id: string): Account | undefined => {
    return accounts.find(a => a.id === id || a.name === id);
  };

  const getCategoryInfo = (id: string, type: string): Category | undefined => {
    if (type === 'transfer') {
      return { id: 'transfer', name: 'Transfer', type: 'expense', icon: 'swap-horiz', color: '#9CA3AF' };
    }
    return categories.find(c => c.id === id || c.name === id);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const accountInfo = getAccountInfo(item.account);
    const toAccountInfo = item.toAccount ? getAccountInfo(item.toAccount) : undefined;
    const categoryInfo = getCategoryInfo(item.category, item.type);

    let amtColor = '#EF4444';
    let amtIcon = 'arrow-drop-down';
    
    if (item.type === 'income') {
      amtColor = '#22C55E';
      amtIcon = 'arrow-drop-up';
    } else if (item.type === 'transfer') {
      amtColor = '#6B7280';
      amtIcon = 'swap-horiz';
    }

    const txDate = new Date(item.date);
    const timeStr = isNaN(txDate.getTime()) ? '' : txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (item.type === 'transfer') {
      return (
        <TouchableOpacity style={styles.txItemContainer} onPress={() => onEditTransaction(item)}>
          <View style={[styles.iconCircle, { backgroundColor: '#E5E7EB' }]}>
            <MaterialIcons name="swap-horiz" size={20} color="#6B7280" />
          </View>
          <View style={styles.txMiddle}>
            <Text style={styles.txTitle}>{item.description || 'Transfer'}</Text>
            <View style={styles.pillsRow}>
              {accountInfo && (
                <View style={[styles.pill, { backgroundColor: accountInfo.color ? `${accountInfo.color}20` : '#F3F4F6' }]}>
                  <Text style={[styles.pillText, { color: accountInfo.color || '#374151' }]}>{accountInfo.name}</Text>
                </View>
              )}
              <MaterialIcons name="arrow-right-alt" size={16} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
              {toAccountInfo && (
                <View style={[styles.pill, { backgroundColor: toAccountInfo.color ? `${toAccountInfo.color}20` : '#F3F4F6' }]}>
                  <Text style={[styles.pillText, { color: toAccountInfo.color || '#374151' }]}>{toAccountInfo.name}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.txRight}>
            <Text style={styles.txTime}>{timeStr}</Text>
            <View style={styles.amtRow}>
              <MaterialIcons name="swap-horiz" size={16} color={amtColor} style={{ marginRight: 2 }} />
              <Text style={[styles.txAmount, { color: amtColor }]}>{currencySymbol}{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.txItemContainer} onPress={() => onEditTransaction(item)}>
        <View style={[styles.iconCircle, { backgroundColor: categoryInfo?.color ? `${categoryInfo.color}30` : '#F3F4F6' }]}>
          <MaterialIcons name={(categoryInfo?.icon || 'label') as any} size={20} color={categoryInfo?.color || '#6B7280'} />
        </View>

        <View style={styles.txMiddle}>
          <Text style={styles.txTitle} numberOfLines={1}>{item.description}</Text>
          {!!item.subcategory && (
            <View style={styles.subNoteRow}>
              <MaterialIcons name="subdirectory-arrow-right" size={12} color="#9CA3AF" />
              <Text style={styles.subNoteText} numberOfLines={1}>{item.subcategory}</Text>
            </View>
          )}
          <View style={styles.pillsRow}>
            {accountInfo && (
              <View style={[styles.pill, { backgroundColor: accountInfo.color ? `${accountInfo.color}20` : '#F3F4F6' }]}>
                <Text style={[styles.pillText, { color: accountInfo.color || '#374151' }]}>{accountInfo.name}</Text>
              </View>
            )}
            {categoryInfo && (
              <View style={[styles.pill, { backgroundColor: categoryInfo.color ? `${categoryInfo.color}20` : '#F3F4F6' }]}>
                <Text style={[styles.pillText, { color: categoryInfo.color || '#374151' }]}>{categoryInfo.name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.txRight}>
          <Text style={styles.txTime}>{timeStr}</Text>
          <View style={styles.amtRow}>
            <MaterialIcons name={amtIcon as any} size={18} color={amtColor} style={{ marginRight: -2 }} />
            <Text style={[styles.txAmount, { color: amtColor }]}>
              {currencySymbol}{item.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title, daySum } }: any) => {
    const d = new Date(title);
    const isToday = new Date().toDateString() === d.toDateString();
    const formattedDate = isNaN(d.getTime()) ? title : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const headerTitle = isToday ? `Today, ${formattedDate}` : formattedDate;

    return (
      <View style={styles.dateHeaderContainer}>
        <Text style={styles.dateHeaderText}>{headerTitle}</Text>
        <Text style={styles.dateHeaderSum}>
          {daySum >= 0 ? '' : '-'}{currencySymbol}{Math.abs(daySum).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Transactions</Text>

      <View style={styles.monthSelectorWrapper}>
        <TouchableOpacity style={styles.monthArrow} onPress={() => setCurrentFilterMonth(new Date(filterYear, filterMonth - 2, 1))}>
          <MaterialIcons name="chevron-left" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        
        <ScrollView 
          ref={monthScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthScroll}
        >
          {[...Array(12)].map((_, i) => {
            const isSelected = filterMonth === i + 1;
            return (
              <TouchableOpacity 
                key={i} 
                style={[styles.monthItem, isSelected && styles.monthItemSelected]}
                onPress={() => setCurrentFilterMonth(new Date(filterYear, i, 1))}
              >
                <Text style={[
                  styles.monthText, 
                  isSelected ? styles.monthTextSelected : { color: colors.outline }
                ]}>
                  {MONTHS[i]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.monthArrow} onPress={() => setCurrentFilterMonth(new Date(filterYear, filterMonth, 1))}>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBar}>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryText, { color: '#EF4444' }]}>
            - {currencySymbol}{summary.exp.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
          </Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryText, { color: '#22C55E' }]}>
            ^ {currencySymbol}{summary.inc.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
          </Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryText, { color: '#374151' }]}>
            = {currencySymbol}{summary.net.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
          </Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderTransactionItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={{ color: '#9CA3AF' }}>No transactions in {MONTHS[filterMonth - 1]}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  monthSelectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  monthArrow: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  monthScroll: {
    paddingHorizontal: 8,
  },
  monthItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  monthItemSelected: {
    borderBottomColor: '#000',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
  },
  monthTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  summaryBox: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 8,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 16,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dateHeaderSum: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  txItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subNoteText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  txTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  amtRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyView: {
    paddingTop: 60,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'web' ? 24 : 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  }
});
