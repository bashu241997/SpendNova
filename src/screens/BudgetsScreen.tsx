import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  useWindowDimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BudgetModal } from '../components/BudgetModal';
import { Budget } from '../utils/storage';
import { ParallaxCard } from '../components/ParallaxCard';

export const BudgetsScreen: React.FC = () => {
  const { 
    budgets, 
    transactions, 
    accounts, 
    categories, 
    colors, 
    currencySymbol,
    addBudget,
    updateBudget,
    deleteBudget
  } = useApp();

  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const getBudgetSpent = (b: Budget) => {
    // Current month filter
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const spentTxs = transactions.filter(t => {
      // Include expenses and category-linked transfers for budgets
      if (t.type !== 'expense' && t.type !== 'transfer') return false;
      
      const tDate = new Date(t.date);
      if (tDate.getFullYear() !== currentYear || tDate.getMonth() !== currentMonth) return false;

      // Filter by accounts
      if (b.includedAccounts && b.includedAccounts.length > 0) {
        if (!b.includedAccounts.includes(t.account)) return false;
      }

      // Filter by categories
      if (b.excludedCategories && b.excludedCategories.includes(t.category)) {
        return false;
      }

      if (b.includedCategories && b.includedCategories.length > 0) {
        if (!b.includedCategories.includes(t.category)) return false;
        
        // If categories are included, check subcategories if they exist in the budget
        if (b.includedSubcategories && b.includedSubcategories.length > 0) {
          if (t.subcategory && !b.includedSubcategories.includes(t.subcategory)) return false;
        }
      }

      return true;
    });

    return spentTxs.reduce((sum, t) => sum + t.amount, 0);
  };

  const getDaysInfo = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const currentDay = now.getDate();
    const daysRemaining = daysInMonth - currentDay + 1; // including today
    return { currentDay, daysInMonth, daysRemaining, monthName: now.toLocaleDateString('en-US', { month: 'short' }) };
  };

  const daysInfo = getDaysInfo();
  const numColumns = width > 700 ? 2 : 1;
  const cardWidth = width > 700 ? '48%' : '100%';

  const openAdd = () => {
    setEditingBudget(null);
    setModalVisible(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Budgets</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={openAdd}>
            <MaterialIcons name="add" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {budgets.map(b => {
            const spent = getBudgetSpent(b);
            const remaining = b.amount - spent;
            const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
            const clampedPercent = Math.min(Math.max(percent, 0), 100);
            const dailyAvailable = remaining > 0 ? remaining / daysInfo.daysRemaining : 0;
            
            return (
              <ParallaxCard key={b.id} style={[styles.budgetCard, { width: cardWidth as any }]}>
                {/* Top Half */}
                <View style={[styles.cardTop, { backgroundColor: `${b.color}30` }]}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.budgetName, { color: colors.onSurface }]}>{b.name}</Text>
                    <TouchableOpacity onPress={() => openEdit(b)}>
                      <MaterialIcons name="edit" size={20} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.budgetAmounts}>
                    <Text style={[styles.spentAmount, { color: colors.onSurface }]}>{currencySymbol}{spent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</Text>
                    <Text style={[styles.totalAmount, { color: colors.onSurfaceVariant }]}> left of {currencySymbol}{b.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</Text>
                  </Text>
                </View>
                
                {/* Bottom Half */}
                <View style={[styles.cardBottom, { backgroundColor: colors.surface }]}>
                  <View style={styles.progressContainer}>
                    <Text style={[styles.dateLabel, { color: colors.onSurfaceVariant }]}>{daysInfo.monthName} 1</Text>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceVariant }]}>
                      <View style={[styles.progressBarFill, { width: `${clampedPercent}%`, backgroundColor: b.color }]}>
                        {clampedPercent > 15 && (
                          <Text style={styles.progressPercentText}>{Math.round(clampedPercent)}%</Text>
                        )}
                      </View>
                      
                      {/* Today Marker */}
                      <View style={[styles.todayMarker, { left: `${(daysInfo.currentDay / daysInfo.daysInMonth) * 100}%` }]}>
                        <View style={[styles.todayTooltip, { backgroundColor: colors.onSurface }]}>
                          <Text style={[styles.todayTooltipText, { color: colors.surface }]}>Today</Text>
                        </View>
                        <View style={[styles.todayLine, { backgroundColor: colors.onSurface }]} />
                      </View>
                    </View>
                    <Text style={[styles.dateLabel, { color: colors.onSurfaceVariant }]}>{daysInfo.monthName} {daysInfo.daysInMonth}</Text>
                  </View>
                  
                  <Text style={[styles.dailyLimitText, { color: colors.onSurfaceVariant }]}>
                    You can spend {currencySymbol}{dailyAvailable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/day for {daysInfo.daysRemaining} more days
                  </Text>
                </View>
              </ParallaxCard>
            );
          })}

          <TouchableOpacity style={[styles.addCard, { width: cardWidth as any, borderColor: colors.outline }]} onPress={openAdd}>
            <MaterialIcons name="add" size={32} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        colors={colors}
        accounts={accounts}
        categories={categories}
        budgetToEdit={editingBudget}
        onSave={addBudget}
        onUpdate={updateBudget}
        onDelete={deleteBudget}
        currencySymbol={currencySymbol}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openAdd}>
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 24,
  },
  iconBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 115,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  budgetCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardTop: {
    padding: 24,
    paddingBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 22,
    fontWeight: '700',
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardBottom: {
    padding: 24,
    paddingTop: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 12,
    overflow: 'visible',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  todayMarker: {
    position: 'absolute',
    top: -24,
    bottom: -8,
    width: 2,
    alignItems: 'center',
  },
  todayTooltip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  todayTooltipText: {
    fontSize: 8,
    fontWeight: '700',
  },
  todayLine: {
    width: 2,
    flex: 1,
    borderRadius: 1,
  },
  dailyLimitText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  addCard: {
    height: 160,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  }
});
