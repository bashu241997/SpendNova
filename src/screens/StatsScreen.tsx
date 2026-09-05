import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Transaction, Category } from '../utils/storage';
import { AnalyticsChart } from '../components/AnalyticsChart';

interface StatsScreenProps {
  onEditTransaction: (tx: Transaction) => void;
  onBack?: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onEditTransaction, onBack }) => {
  const { transactions, categories, colors, currencySymbol } = useApp();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategoryForDrillDown, setSelectedCategoryForDrillDown] = useState<string | null>(null);

  const [currentFilterMonth, setCurrentFilterMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const filterYear = currentFilterMonth.getFullYear();
  const filterMonth = currentFilterMonth.getMonth() + 1;

  const handlePrevMonth = () => {
    setCurrentFilterMonth(new Date(filterYear, currentFilterMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentFilterMonth(new Date(filterYear, currentFilterMonth.getMonth() + 1, 1));
  };

  const monthlyTxs = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate.getFullYear() === filterYear && (txDate.getMonth() + 1) === filterMonth;
  });

  const filteredTxs = monthlyTxs.filter(t => t.type === type);
  const totalAmount = filteredTxs.reduce((sum, t) => sum + t.amount, 0);

  const totalEarned = monthlyTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalBurned = monthlyTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netVibe = totalEarned - totalBurned;

  let vibeStatus = 'Balanced';
  let vibeColor = colors.success;
  let vibeMessage = "Cash flow is positive for this period.";
  if (netVibe < 0) {
    vibeStatus = 'Deficit Alert';
    vibeColor = colors.error;
    vibeMessage = "Expenses exceed income for this period.";
  } else if (totalEarned === 0 && totalBurned === 0) {
    vibeStatus = 'No Activity';
    vibeColor = colors.outline;
    vibeMessage = "No transactions recorded for this period.";
  } else if (netVibe > totalEarned * 0.5) {
    vibeStatus = 'High Savings';
    vibeColor = colors.primary;
    vibeMessage = "Strong savings rate for this period.";
  }

  const grouped = filteredTxs.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const breakdownData = Object.keys(grouped)
    .map(catId => {
      const cat = categories.find(c => c.id === catId || c.name === catId);
      const name = cat ? cat.name : catId;
      const color = cat ? cat.color : '#9E9E9E';
      const icon = cat ? cat.icon : 'help-outline';
      const amount = grouped[catId];
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      const count = filteredTxs.filter(t => t.category === catId).length;

      return {
        id: catId,
        name,
        color,
        icon,
        amount,
        percentage,
        count,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const drillDownTxs = selectedCategoryForDrillDown 
    ? filteredTxs.filter(t => t.category === selectedCategoryForDrillDown).sort((a,b) => b.date.localeCompare(a.date))
    : [];

  const drillDownCatName = selectedCategoryForDrillDown 
    ? categories.find(c => c.id === selectedCategoryForDrillDown || c.name === selectedCategoryForDrillDown)?.name || selectedCategoryForDrillDown
    : '';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.innerContainer}>
        <View style={styles.topHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
              <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.onBackground }}>Analytics</Text>
        </View>

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

        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant, marginTop: 4 }]}>
          <TouchableOpacity
            onPress={() => {
              setType('expense');
              setSelectedCategoryForDrillDown(null);
            }}
            style={[
              styles.tabItem, 
              type === 'expense' && { backgroundColor: colors.error }
            ]}
          >
            <Text style={[
              styles.tabLabel, 
              { color: type === 'expense' ? colors.onError : colors.onSurfaceVariant }
            ]}>
              EXPENSE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setType('income');
              setSelectedCategoryForDrillDown(null);
            }}
            style={[
              styles.tabItem, 
              type === 'income' && { backgroundColor: colors.success }
            ]}
          >
            <Text style={[
              styles.tabLabel, 
              { color: type === 'income' ? colors.onSuccess : colors.onSurfaceVariant }
            ]}>
              INCOME
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedCategoryForDrillDown ? (
        <View style={{ flex: 1 }}>
          <View style={styles.drillDownHeader}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => setSelectedCategoryForDrillDown(null)}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
              <Text style={[styles.backText, { color: colors.onBackground }]}>
                {drillDownCatName}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.drillDownTotal, { color: type === 'expense' ? colors.error : colors.success }]}>
              {currencySymbol}{drillDownTxs.reduce((sum,t) => sum + t.amount, 0).toFixed(2)}
            </Text>
          </View>
          
          <FlatList
            data={drillDownTxs}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.txItem, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceVariant }]}
                onPress={() => onEditTransaction(item)}
              >
                <View style={styles.txMainInfo}>
                  <Text style={[styles.txDate, { color: colors.onSurfaceVariant }]}>{item.date}</Text>
                  <Text style={[styles.txDesc, { color: colors.onBackground }]}>
                    {item.description || 'No description'}
                  </Text>
                </View>
                <Text style={[styles.txAmt, { color: type === 'expense' ? colors.error : colors.success }]}>
                  {currencySymbol}{item.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[styles.vibeCard, { borderColor: vibeColor }]}>
            <View style={styles.vibeRow}>
              <Text style={[styles.vibeTitle, { color: colors.onBackground }]}>Financial Status:</Text>
              <Text style={[styles.vibeBadge, { backgroundColor: vibeColor, color: colors.background }]}>
                {vibeStatus}
              </Text>
            </View>
            <Text style={[styles.vibeDesc, { color: colors.onSurfaceVariant }]}>{vibeMessage}</Text>
            
            <View style={[styles.vibeStatsRow, { marginTop: 12 }]}>
              <View style={styles.vibeCol}>
                <Text style={{ fontSize: 10, color: colors.onSurfaceVariant, fontWeight: '600' }}>TOTAL INCOME</Text>
                <Text style={{ fontSize: 14, color: colors.success, fontWeight: '800' }}>+{currencySymbol}{totalEarned.toFixed(2)}</Text>
              </View>
              <View style={[styles.vibeDivider, { backgroundColor: colors.surfaceVariant }]} />
              <View style={styles.vibeCol}>
                <Text style={{ fontSize: 10, color: colors.onSurfaceVariant, fontWeight: '600' }}>TOTAL EXPENSE</Text>
                <Text style={{ fontSize: 14, color: colors.error, fontWeight: '800' }}>-{currencySymbol}{totalBurned.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <AnalyticsChart
            transactions={monthlyTxs}
            categories={categories}
            colors={colors}
            type={type}
          />

          {breakdownData.length > 0 && (
            <View style={styles.listContainer}>
              <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
                Category Breakdown
              </Text>
              {breakdownData.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.breakdownItem, { backgroundColor: colors.surface }]}
                  onPress={() => setSelectedCategoryForDrillDown(item.id)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.color }]}>
                    <MaterialIcons name={item.icon as any} size={22} color="#FFF" />
                  </View>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemRow}>
                      <Text style={[styles.itemName, { color: colors.onBackground }]}>{item.name}</Text>
                      <Text style={[styles.itemVal, { color: colors.onBackground }]}>
                        {currencySymbol}{item.amount.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={styles.itemRow}>
                      <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceVariant }]}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { 
                              backgroundColor: item.color, 
                              width: `${item.percentage}%` 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.itemPct, { color: colors.onSurfaceVariant }]}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    
                    <Text style={[styles.itemCount, { color: colors.onSurfaceVariant }]}>
                      {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                    </Text>
                  </View>
                  
                  <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  periodArrow: {
    padding: 4,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    paddingBottom: 115,
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingLeft: 4,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemPct: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 10,
  },
  drillDownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  drillDownTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 115,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  txMainInfo: {
    flex: 1,
  },
  txDate: {
    fontSize: 10,
    marginBottom: 4,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  txAmt: {
    fontSize: 14,
    fontWeight: '700',
  },
  vibeCard: {
    margin: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.03)',
  },
  vibeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vibeTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  vibeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },
  vibeDesc: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  vibeStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibeCol: {
    flex: 1,
    alignItems: 'center',
  },
  vibeDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
  },
});
