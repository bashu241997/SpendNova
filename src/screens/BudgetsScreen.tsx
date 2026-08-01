import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Category } from '../utils/storage';

type FilterType = 'all' | 'ontrack' | 'warning' | 'over' | 'unbudgeted';

export const BudgetsScreen: React.FC = () => {
  const { 
    colors, 
    categories, 
    transactions, 
    currencySymbol,
    setCategoryBudget 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [budgetValueInput, setBudgetValueInput] = useState('');

  // Calculate current month's spending for each category
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [transactions]);

  // Compute category spending mapping
  const categorySpentMap = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthTransactions.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [currentMonthTransactions]);

  const expenseCategories = useMemo(() => {
    return categories.filter(c => c.type === 'expense');
  }, [categories]);

  // Budget Items stats
  const budgetStats = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let budgetedCount = 0;
    let onTrackCount = 0;
    let warningCount = 0;
    let overCount = 0;

    expenseCategories.forEach(cat => {
      const spent = categorySpentMap[cat.id] || 0;
      if (cat.budget && cat.budget > 0) {
        budgetedCount++;
        totalBudget += cat.budget;
        totalSpent += spent;

        const ratio = spent / cat.budget;
        if (ratio > 1) {
          overCount++;
        } else if (ratio >= 0.75) {
          warningCount++;
        } else {
          onTrackCount++;
        }
      }
    });

    const remainingTotal = totalBudget - totalSpent;
    const overallRatio = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remainingTotal,
      overallRatio: Math.min(Math.round(overallRatio), 999),
      budgetedCount,
      onTrackCount,
      warningCount,
      overCount
    };
  }, [expenseCategories, categorySpentMap]);

  // Filter categories list
  const filteredCategories = useMemo(() => {
    return expenseCategories.filter(cat => {
      const budget = cat.budget || 0;
      const spent = categorySpentMap[cat.id] || 0;
      const hasBudget = budget > 0;
      const ratio = hasBudget ? spent / budget : 0;

      if (activeFilter === 'all') return true;
      if (activeFilter === 'unbudgeted') return !hasBudget;
      if (!hasBudget) return false;

      if (activeFilter === 'ontrack') return ratio < 0.75;
      if (activeFilter === 'warning') return ratio >= 0.75 && ratio <= 1.0;
      if (activeFilter === 'over') return ratio > 1.0;

      return true;
    });
  }, [expenseCategories, categorySpentMap, activeFilter]);

  const handleOpenEditBudget = (cat: Category) => {
    setEditingCategory(cat);
    setBudgetValueInput(cat.budget ? cat.budget.toString() : '');
  };

  const handleSaveBudget = async () => {
    if (!editingCategory) return;
    const val = parseFloat(budgetValueInput);

    if (isNaN(val) || val <= 0) {
      await setCategoryBudget(editingCategory.id, undefined);
    } else {
      await setCategoryBudget(editingCategory.id, val);
    }

    setEditingCategory(null);
    setBudgetValueInput('');
  };

  const handleQuickSetPreset = (amount: number) => {
    setBudgetValueInput(amount.toString());
  };

  const getStatusBadge = (spent: number, budget?: number) => {
    if (!budget || budget <= 0) {
      return {
        label: 'No Budget',
        color: colors.outline,
        bg: colors.surfaceVariant,
        progressColor: colors.outline,
        ratio: 0
      };
    }

    const ratio = spent / budget;
    const pct = Math.round(ratio * 100);

    if (ratio > 1) {
      return {
        label: `${pct}% • Over Budget`,
        color: colors.error,
        bg: '#FFEBEE',
        progressColor: colors.error,
        ratio: Math.min(ratio, 1)
      };
    }

    if (ratio >= 0.75) {
      return {
        label: `${pct}% • Near Limit`,
        color: '#D97706',
        bg: '#FEF3C7',
        progressColor: '#F59E0B',
        ratio
      };
    }

    return {
      label: `${pct}% • On Track`,
      color: colors.success,
      bg: '#E6F4EA',
      progressColor: colors.success,
      ratio
    };
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Summary Card */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerSubTitle, { color: colors.onSurfaceVariant }]}>MONTHLY BUDGET HEALTH</Text>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Category Limits</Text>
          </View>
          <View style={[styles.overallTag, { backgroundColor: budgetStats.remainingTotal >= 0 ? colors.primaryContainer : '#FFEBEE' }]}>
            <Text style={[styles.overallTagText, { color: budgetStats.remainingTotal >= 0 ? colors.onPrimaryContainer : colors.error }]}>
              {budgetStats.overallRatio}% Spent
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Total Budget</Text>
            <Text style={[styles.metricVal, { color: colors.onSurface }]}>
              {currencySymbol}{budgetStats.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.outline }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Spent This Month</Text>
            <Text style={[styles.metricVal, { color: colors.primary }]}>
              {currencySymbol}{budgetStats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.outline }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Remaining</Text>
            <Text style={[
              styles.metricVal, 
              { color: budgetStats.remainingTotal >= 0 ? colors.success : colors.error }
            ]}>
              {currencySymbol}{Math.abs(budgetStats.remainingTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              {budgetStats.remainingTotal < 0 && ' over'}
            </Text>
          </View>
        </View>

        {/* Overall Progress Bar */}
        <View style={styles.overallBarContainer}>
          <View style={[styles.overallTrack, { backgroundColor: colors.surfaceVariant }]}>
            <View 
              style={[
                styles.overallFill, 
                { 
                  width: `${Math.min(budgetStats.overallRatio, 100)}%`,
                  backgroundColor: budgetStats.overallRatio > 100 ? colors.error : colors.primary
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.statusChipsRow}>
          <View style={[styles.miniChip, { backgroundColor: '#E6F4EA' }]}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.miniChipText, { color: colors.success }]}>{budgetStats.onTrackCount} On Track</Text>
          </View>

          {budgetStats.warningCount > 0 && (
            <View style={[styles.miniChip, { backgroundColor: '#FEF3C7' }]}>
              <View style={[styles.dot, { backgroundColor: '#D97706' }]} />
              <Text style={[styles.miniChipText, { color: '#B45309' }]}>{budgetStats.warningCount} Near Limit</Text>
            </View>
          )}

          {budgetStats.overCount > 0 && (
            <View style={[styles.miniChip, { backgroundColor: '#FFEBEE' }]}>
              <View style={[styles.dot, { backgroundColor: colors.error }]} />
              <Text style={[styles.miniChipText, { color: colors.error }]}>{budgetStats.overCount} Over Budget</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Chips Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { id: 'all', label: `All (${expenseCategories.length})` },
          { id: 'ontrack', label: `On Track (${budgetStats.onTrackCount})` },
          { id: 'warning', label: `Near Limit (${budgetStats.warningCount})` },
          { id: 'over', label: `Over Budget (${budgetStats.overCount})` },
          { id: 'unbudgeted', label: 'Unbudgeted' },
        ].map(filter => {
          const active = activeFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                { backgroundColor: active ? colors.primary : colors.surfaceVariant }
              ]}
              onPress={() => setActiveFilter(filter.id as FilterType)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterChipText,
                { color: active ? colors.onPrimary : colors.onSurface }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Category List */}
      <View style={styles.listSection}>
        {filteredCategories.map(cat => {
          const spent = categorySpentMap[cat.id] || 0;
          const budget = cat.budget;
          const status = getStatusBadge(spent, budget);
          const remaining = budget ? budget - spent : 0;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}
              onPress={() => handleOpenEditBudget(cat)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
                    <MaterialIcons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.catName, { color: colors.onSurface }]}>{cat.name}</Text>
                    <Text style={[styles.catSubText, { color: colors.onSurfaceVariant }]}>
                      {budget ? `${currencySymbol}${spent.toFixed(2)} of ${currencySymbol}${budget.toFixed(2)}` : 'No monthly budget target'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              {budget && budget > 0 ? (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min((spent / budget) * 100, 100)}%`,
                          backgroundColor: status.progressColor 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.progressFooter}>
                    <Text style={[
                      styles.remainingText, 
                      { color: remaining >= 0 ? colors.onSurfaceVariant : colors.error }
                    ]}>
                      {remaining >= 0 
                        ? `${currencySymbol}${remaining.toFixed(2)} remaining` 
                        : `${currencySymbol}${Math.abs(remaining).toFixed(2)} over budget!`}
                    </Text>
                    <MaterialIcons name="edit" size={16} color={colors.outline} />
                  </View>
                </View>
              ) : (
                <View style={styles.setBudgetPrompt}>
                  <Text style={[styles.setBudgetPromptText, { color: colors.primary }]}>
                    + Tap to set monthly budget limit
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Edit Budget Modal */}
      {editingCategory && (
        <Modal
          visible={!!editingCategory}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingCategory(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.surfaceVariant }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.iconContainer, { backgroundColor: editingCategory.color + '20', marginRight: 10 }]}>
                    <MaterialIcons name={editingCategory.icon as any} size={22} color={editingCategory.color} />
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.onBackground }]}>
                    Set Budget: {editingCategory.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setEditingCategory(null)}>
                  <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
                Monthly Target Budget ({currencySymbol})
              </Text>
              
              <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                <Text style={[styles.currencyPrefix, { color: colors.onSurface }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.input, { color: colors.onSurface }]}
                  value={budgetValueInput}
                  onChangeText={setBudgetValueInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.outline}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>

              {/* Shortcut buttons */}
              <View style={styles.presetRow}>
                {[100, 250, 500, 1000].map(amt => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.presetChip, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => handleQuickSetPreset(amt)}
                  >
                    <Text style={[styles.presetChipText, { color: colors.onSurface }]}>
                      {currencySymbol}{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                {editingCategory.budget ? (
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#FFEBEE', flex: 1, marginRight: 8 }]}
                    onPress={async () => {
                      await setCategoryBudget(editingCategory.id, undefined);
                      setEditingCategory(null);
                    }}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.error }]}>Remove</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 2 }]}
                  onPress={handleSaveBudget}
                >
                  <Text style={[styles.modalBtnText, { color: colors.onPrimary }]}>Save Budget Target</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerSubTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  overallTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  overallTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricDivider: {
    width: 1,
    height: 24,
    opacity: 0.3,
  },
  overallBarContainer: {
    marginBottom: 16,
  },
  overallTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    borderRadius: 5,
  },
  statusChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listSection: {
    gap: 12,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
  },
  catSubText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
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
  progressContainer: {
    marginTop: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  setBudgetPrompt: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  setBudgetPromptText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalBtn: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
