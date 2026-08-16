import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Transaction } from '../utils/storage';

interface HomeScreenProps {
  onAddTransaction: (type?: 'income' | 'expense' | 'transfer') => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: 'transactions' | 'budgets' | 'stats' | 'accounts' | 'settings' | 'recurring' | 'goals') => void;
}

const formatTime = (isoString: string) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateKey = (isoString: string) => {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onAddTransaction, 
  onEditTransaction,
  onNavigateTab 
}) => {
  const { accounts, categories, transactions, budgets, recurringTxs, goals, colors, currencySymbol } = useApp();

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1024;
  const carouselCardWidth = isLargeScreen ? 280 : Math.min(Math.max(width - 32, 280), 340);
  const desktopFeatureCardWidth = isLargeScreen ? 420 : Math.min(Math.max(width - 40, 290), 360);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const currentDay = now.getDate();
  const daysLeft = daysInMonth - currentDay + 1;

  const [containerWidth, setContainerWidth] = useState(300);

  const squareGap = 3.5;
  const squareSize = useMemo(() => {
    const padding = 32;
    const totalGapsWidth = 17 * squareGap;
    const availableWidth = containerWidth - padding;
    return Math.max(Math.floor((availableWidth - totalGapsWidth) / 18), 6);
  }, [containerWidth]);

  const gridHeight = useMemo(() => {
    return 7 * squareSize + 6 * squareGap;
  }, [squareSize]);

  // 1. Generate activity heatmap (last 18 weeks, Sun-Sat)
  const heatmapData = useMemo(() => {
    const days: { date: Date; dateStr: string; count: number; amount: number }[] = [];
    const today = new Date();
    
    // Find the Sunday 17 weeks ago
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - 17 * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 18 * 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      
      const safeTxsList = Array.isArray(transactions) ? transactions : [];
      const dayTxs = safeTxsList.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getFullYear() === d.getFullYear() &&
               txDate.getMonth() === d.getMonth() &&
               txDate.getDate() === d.getDate();
      });
      const count = dayTxs.length;
      const amount = dayTxs.reduce((sum, t) => sum + t.amount, 0);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      days.push({
        date: d,
        dateStr,
        count,
        amount
      });
    }
    return days;
  }, [transactions]);

  const weeks = useMemo(() => {
    const weeksList: typeof heatmapData[] = [];
    for (let i = 0; i < 18; i++) {
      weeksList.push(heatmapData.slice(i * 7, (i + 1) * 7));
    }
    return weeksList;
  }, [heatmapData]);

  const weekLabels = useMemo(() => {
    const labels: { index: number; text: string }[] = [];
    weeks.forEach((week, index) => {
      if (index % 3 === 0) {
        const sun = week[0]?.date;
        if (sun) {
          labels.push({
            index,
            text: sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          });
        }
      }
    });
    return labels;
  }, [weeks]);

  // Recurring EMIs / Subscriptions Stats (Upcoming vs Overdue)
  const recurringStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let upcomingCount = 0;
    let upcomingSum = 0;
    let overdueCount = 0;
    let overdueSum = 0;

    (recurringTxs || []).forEach(r => {
      const due = new Date(r.nextDueDate);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        overdueCount++;
        overdueSum += r.amount;
      } else if (diffDays <= 7) {
        upcomingCount++;
        upcomingSum += r.amount;
      }
    });

    return { upcomingCount, upcomingSum, overdueCount, overdueSum };
  }, [recurringTxs]);

  // Monthly Transactions Filter
  const monthlyTxs = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  // Accounts Calculation
  const accountStats = useMemo(() => {
    const stats = accounts.map(acc => {
      let balance = (acc as any).initialBalance || 0;
      let txCount = 0;
      
      transactions.forEach(t => {
        if (t.account === acc.id) {
          txCount++;
          if (t.type === 'income') balance += t.amount;
          if (t.type === 'expense') balance -= t.amount;
          if (t.type === 'transfer') balance -= t.amount;
        }
        if (t.type === 'transfer' && t.toAccount === acc.id) {
          txCount++;
          balance += t.amount;
        }
      });
      return { ...acc, balance, txCount };
    });
    return stats;
  }, [accounts, transactions]);

  // Budget Calculations matching BudgetsScreen
  const userBudgetStats = useMemo(() => {
    if (budgets && budgets.length > 0) {
      return budgets.map(b => {
        const spent = transactions.filter(t => {
          if (t.type !== 'expense') return false;
          const tDate = new Date(t.date);
          if (tDate.getFullYear() !== currentYear || tDate.getMonth() !== currentMonth) return false;

          if (b.includedAccounts && b.includedAccounts.length > 0) {
            if (!b.includedAccounts.includes(t.account)) return false;
          }
          if (b.excludedCategories && b.excludedCategories.includes(t.category)) return false;
          if (b.includedCategories && b.includedCategories.length > 0) {
            if (!b.includedCategories.includes(t.category)) return false;
            if (b.includedSubcategories && b.includedSubcategories.length > 0) {
              if (t.subcategory && !b.includedSubcategories.includes(t.subcategory)) return false;
            }
          }
          return true;
        }).reduce((sum, t) => sum + t.amount, 0);

        const left = b.amount - spent;
        const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
        const daily = Math.max(left / daysLeft, 0);

        let icon = 'pie-chart';
        if (b.includedCategories && b.includedCategories.length > 0) {
          const firstCat = categories.find(c => c.id === b.includedCategories[0] || c.name === b.includedCategories[0]);
          if (firstCat?.icon) icon = firstCat.icon;
        }

        return {
          id: b.id,
          name: b.name,
          color: b.color || colors.primary,
          icon,
          budget: b.amount,
          spent,
          left,
          pct,
          daily,
          hasBudget: true
        };
      });
    }

    return categories.filter(c => c.type === 'expense').map(cat => {
      const spent = monthlyTxs
        .filter(t => t.type === 'expense' && (t.category === cat.id || t.category === cat.name))
        .reduce((sum, t) => sum + t.amount, 0);

      const hasBudget = Boolean(cat.budget && cat.budget > 0);
      const budgetVal = hasBudget ? cat.budget! : 0;
      const left = hasBudget ? budgetVal - spent : 0;
      const pct = hasBudget ? Math.min((spent / budgetVal) * 100, 100) : (spent > 0 ? 100 : 0);
      const daily = hasBudget ? Math.max(left / daysLeft, 0) : 0;

      return {
        id: cat.id,
        name: cat.name,
        color: cat.color || colors.primary,
        icon: cat.icon || 'label',
        budget: budgetVal,
        spent,
        left,
        pct,
        daily,
        hasBudget
      };
    });
  }, [budgets, categories, transactions, monthlyTxs, daysLeft, currentYear, currentMonth, colors.primary]);

  // Grouped Transactions
  const groupedTxs = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const groups: { title: string; data: Transaction[] }[] = [];
    
    sorted.slice(0, 50).forEach(t => { // Show last 50
      const key = formatDateKey(t.date);
      let group = groups.find(g => g.title === key);
      if (!group) {
        group = { title: key, data: [] };
        groups.push(group);
      }
      group.data.push(t);
    });
    return groups;
  }, [transactions]);

  // Header Time logic
  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.timeText, { color: colors.onBackground }]}>{timeString}</Text>
          <Text style={[styles.dateText, { color: colors.onSurfaceVariant }]}>{dayName}</Text>
          <Text style={[styles.dateText, { color: colors.onSurfaceVariant }]}>{monthDay}, {currentYear}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.greetingText, { color: colors.onSurfaceVariant }]}>Hello there</Text>
          <Text style={[styles.nameText, { color: colors.onBackground }]}>Welcome back</Text>
        </View>
      </View>

      {/* SPLIT LAYOUT FROM TOP */}
      <View style={[styles.splitContainer, isLargeScreen ? styles.splitRow : styles.splitCol]}>
        
        {/* LEFT COLUMN: ACCOUNTS, BUDGETS, GOALS, UPCOMING/OVERDUE */}
        <View style={[styles.leftColumn, isLargeScreen && { flex: 1, minWidth: 0, paddingRight: 24 }]}>
          
          {/* ACCOUNTS CAROUSEL */}
          <View style={styles.carouselContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
              {accountStats.map(acc => {
                const isPos = acc.balance >= 0;
                const dotColor = isPos ? colors.success : colors.error;
                return (
                  <TouchableOpacity 
                    key={acc.id} 
                    style={[styles.accountCard, { width: isLargeScreen ? 172 : 145, backgroundColor: colors.surface }]}
                    onPress={() => onNavigateTab('accounts')}
                  >
                    <View style={styles.accCardTop}>
                      <Text style={[styles.accName, { color: colors.onSurface }]} numberOfLines={1}>{acc.name}</Text>
                      <View style={[styles.accDot, { backgroundColor: dotColor }]} />
                    </View>
                    <Text style={[styles.accBalance, { color: isPos ? colors.success : colors.error }]}>
                      {isPos ? '' : '-'}{currencySymbol}{Math.abs(acc.balance).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.accTxCount, { color: colors.onSurfaceVariant }]}>{acc.txCount} transactions</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* SPENDING FLOW SECTION (Heatmap Only) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Spending Flow</Text>
            <TouchableOpacity onPress={() => onNavigateTab('stats')}>
              <Text style={[styles.seeAllText, { color: colors.onSurfaceVariant }]}>View Details</Text>
            </TouchableOpacity>
          </View>

          <View 
            style={[styles.analyticsCard, { backgroundColor: colors.surface }]}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0) setContainerWidth(w);
            }}
          >
            <Text style={[styles.heatmapTitle, { color: colors.onSurfaceVariant, marginBottom: 12 }]}>Transaction Activity (Last 18 Weeks)</Text>
            
            <View style={styles.heatmapWrapper}>
              {/* Day of week labels */}
              <View style={[styles.dayLabelsCol, { height: gridHeight }]}>
                <Text style={[styles.dayLabelText, { color: colors.outline, height: squareSize, lineHeight: squareSize }]}>S</Text>
                <Text style={[styles.dayLabelText, { color: colors.outline, height: squareSize, lineHeight: squareSize }]}>M</Text>
                <Text style={[styles.dayLabelText, { color: colors.outline, height: squareSize, lineHeight: squareSize }]}>T</Text>
                <Text style={[styles.dayLabelText, { color: colors.outline, height: squareSize, lineHeight: squareSize }]}>W</Text>
                <Text style={[styles.dayLabelText, { color: colors.outline, height: squareSize, lineHeight: squareSize }]}>T</Text>
                <Text style={[styles.dayLabelText, { color: colors.outline, height: squareSize, lineHeight: squareSize }]}>F</Text>
                <Text style={[styles.dayLabelText, { color: colors.outline, height: squareSize, lineHeight: squareSize }]}>S</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={[styles.heatmapGrid, { height: gridHeight, gap: squareGap }]}>
                  {weeks.map((week, wIdx) => (
                    <View key={`week-${wIdx}`} style={[styles.heatmapColumn, { gap: squareGap }]}>
                      {week.map((day, dIdx) => {
                        let bg = colors.surfaceVariant;
                        if (day.count > 0) {
                          if (day.count === 1) bg = colors.outline;
                          else if (day.count === 2) bg = '#B0B0B0';
                          else bg = '#757575';
                        }
                        return (
                          <View 
                            key={day.dateStr} 
                            style={[styles.heatmapSquare, { width: squareSize, height: squareSize, backgroundColor: bg }]} 
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>

                {/* Heatmap Dates Labels */}
                <View style={styles.heatmapLabelsRow}>
                  {weekLabels.map((lbl, idx) => {
                    const leftPos = lbl.index * (squareSize + squareGap);
                    return (
                      <Text 
                        key={`lbl-${idx}`} 
                        style={[styles.heatmapLabelText, { color: colors.onSurfaceVariant, left: leftPos }]}
                      >
                        {lbl.text}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Legend section at the bottom */}
            <View style={[styles.legendRow, { borderTopColor: colors.surfaceVariant }]}>
              <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Less</Text>
              <View style={[styles.legendSquare, { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.surfaceVariant }]} />
              <View style={[styles.legendSquare, { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.outline }]} />
              <View style={[styles.legendSquare, { width: 10, height: 10, borderRadius: 2, backgroundColor: '#B0B0B0' }]} />
              <View style={[styles.legendSquare, { width: 10, height: 10, borderRadius: 2, backgroundColor: '#757575' }]} />
              <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>More</Text>
            </View>
          </View>

          {/* HORIZONTAL BUDGETS CAROUSEL */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Active Budgets</Text>
            <TouchableOpacity onPress={() => onNavigateTab('budgets')}>
              <Text style={[styles.seeAllText, { color: colors.onSurfaceVariant }]}>View All ({userBudgetStats.length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.carouselContainer}>
            {(!budgets || budgets.length === 0) ? (
              <TouchableOpacity
                style={[styles.emptyGoalCard, { width: desktopFeatureCardWidth, backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}
                onPress={() => onNavigateTab('budgets')}
              >
                <View style={[styles.emptyGoalIcon, { backgroundColor: colors.surface }]}>
                  <MaterialIcons name="account-balance-wallet" size={23} color={colors.primary} />
                </View>
                <View style={styles.emptyGoalContent}>
                  <Text style={[styles.emptyGoalTitle, { color: colors.onPrimaryContainer }]}>Create a budget</Text>
                  <Text style={[styles.emptyGoalDescription, { color: colors.onPrimaryContainer }]}>Set spending limits and track where your money goes.</Text>
                </View>
                <View style={[styles.emptyGoalAction, { backgroundColor: colors.primaryContainer, borderWidth: 1, borderColor: colors.outline }]}>
                  <MaterialIcons name="add" size={18} color={colors.onPrimaryContainer} />
                </View>
              </TouchableOpacity>
            ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
              {userBudgetStats.map(b => {
                // Calculate progress position (day of month percentage for Today badge)
                const now = new Date();
                const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const currentDay = now.getDate();
                const dayPct = Math.min(Math.max((currentDay / totalDaysInMonth) * 100, 5), 90);

                const monthName = now.toLocaleDateString('en-US', { month: 'short' });
                const startDateStr = `${monthName} 1`;
                const endDateStr = `${monthName} ${totalDaysInMonth}`;

                return (
                  <TouchableOpacity 
                    key={b.id} 
                    style={[
                      styles.horizontalBudgetCard,
                      { width: desktopFeatureCardWidth, backgroundColor: colors.surface }
                    ]}
                    onPress={() => onNavigateTab('budgets')}
                    activeOpacity={0.85}
                  >
                    {/* SOFT TINTED TOP HEADER BAND */}
                    <View style={[styles.bCardHeaderBand, { backgroundColor: `${b.color}12` }]}>
                      <View style={styles.bCardTop}>
                        <Text style={[styles.bName, { color: colors.onSurface }]} numberOfLines={1}>{b.name}</Text>
                        <View style={[styles.bIconWrap, { backgroundColor: `${b.color}18` }]}>
                          <MaterialIcons name={(b.icon || 'pie-chart') as any} size={16} color={b.color || colors.primary} />
                        </View>
                      </View>

                      <View style={styles.bAmountRow}>
                        <Text style={[styles.bLeft, { color: colors.onSurface }]}>
                          {currencySymbol}{Math.max(b.left, 0).toLocaleString('en-IN')}
                        </Text>
                        <Text style={[styles.bTotal, { color: colors.onSurfaceVariant }]}>
                          left of {currencySymbol}{b.budget.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    {/* BODY BAND */}
                    <View style={styles.bCardBodyBand}>
                      {b.hasBudget ? (
                        <>
                          {/* TODAY MARKER & PROGRESS BAR */}
                          <View style={styles.todayMarkerWrapper}>
                            <View style={[styles.todayBadge, { left: `${dayPct}%`, backgroundColor: colors.onSurface }]}>
                              <Text style={[styles.todayText, { color: colors.surface }]}>Today</Text>
                            </View>
                            
                            <View style={[styles.bProgressBar, { backgroundColor: `${b.color}15` }]}>
                              <View style={[styles.bProgressFill, { backgroundColor: `${b.color}90`, width: `${Math.min(b.pct, 100)}%` }]} />
                            </View>
                            
                            <View style={styles.dateRangeRow}>
                              <Text style={[styles.dateRangeText, { color: colors.onSurfaceVariant }]}>{startDateStr}</Text>
                              <Text style={[styles.dateRangeText, { color: colors.onSurfaceVariant }]}>{endDateStr}</Text>
                            </View>
                          </View>

                          <Text style={[styles.bDailyText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                            You can spend {currencySymbol}{b.daily.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/day for {daysLeft} more days
                          </Text>
                        </>
                      ) : (
                        <View style={{ marginTop: 4 }}>
                          <Text style={[styles.bDailyText, { color: colors.onSurfaceVariant }]}>
                            Spent: {currencySymbol}{b.spent.toLocaleString('en-IN')} (No limit set)
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            )}
          </View>

          {/* SAVINGS GOALS CAROUSEL */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Savings Goals</Text>
            <TouchableOpacity onPress={() => onNavigateTab('goals')}>
              <Text style={[styles.seeAllText, { color: colors.onSurfaceVariant }]}>View All ({(goals || []).length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.carouselContainer}>
            {(!goals || goals.length === 0) ? (
              <TouchableOpacity
                style={[styles.emptyGoalCard, { width: desktopFeatureCardWidth, backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}
                onPress={() => onNavigateTab('goals')}
              >
                <View style={[styles.emptyGoalIcon, { backgroundColor: colors.surface }]}>
                  <MaterialIcons name="emoji-events" size={23} color={colors.primary} />
                </View>
                <View style={styles.emptyGoalContent}>
                  <Text style={[styles.emptyGoalTitle, { color: colors.onPrimaryContainer }]}>Start a savings goal</Text>
                  <Text style={[styles.emptyGoalDescription, { color: colors.onPrimaryContainer }]}>Plan for an emergency fund, trip, or big purchase.</Text>
                </View>
                <View style={[styles.emptyGoalAction, { backgroundColor: colors.primaryContainer, borderWidth: 1, borderColor: colors.outline }]}>
                  <MaterialIcons name="add" size={18} color={colors.onPrimaryContainer} />
                </View>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
                {goals.map(g => {
                  const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
                  const remaining = Math.max(g.targetAmount - g.currentAmount, 0);

                  return (
                    <TouchableOpacity 
                      key={g.id} 
                      style={[styles.goalCardHorizontal, { width: desktopFeatureCardWidth, backgroundColor: colors.surface }]}
                      onPress={() => onNavigateTab('goals')}
                      activeOpacity={0.85}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={[styles.bIconWrap, { backgroundColor: `${g.color || colors.primary}12`, marginRight: 10, width: 34, height: 34, borderRadius: 17 }]}>
                          <MaterialIcons name={(g.icon || 'savings') as any} size={18} color={g.color || colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[{ fontSize: 15, fontWeight: '700', color: colors.onSurface }]} numberOfLines={1}>{g.name}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 }}>
                        <Text style={[styles.bLeft, { color: colors.onSurface }]}>
                          {currencySymbol}{g.currentAmount.toLocaleString('en-IN')}
                        </Text>
                        <Text style={[styles.bTotal, { color: colors.onSurfaceVariant }]}>
                          of {currencySymbol}{g.targetAmount.toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <View style={[styles.bProgressBar, { backgroundColor: `${g.color || colors.primary}12`, marginBottom: 8 }]}>
                        <View style={[styles.bProgressFill, { backgroundColor: `${g.color || colors.primary}80`, width: `${pct}%` }]} />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.onSurfaceVariant }}>{Math.round(pct)}% saved</Text>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.onSurfaceVariant }}>{currencySymbol}{remaining.toLocaleString('en-IN')} left</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* UPCOMING & OVERDUE BILLS */}
          <View style={styles.goalsGrid}>
            <TouchableOpacity 
              style={[styles.goalCard, { backgroundColor: colors.surface }]}
              onPress={() => onNavigateTab('recurring')}
            >
              <View style={styles.goalHeader}>
                <MaterialIcons name="event" size={20} color={colors.primary} />
                <Text style={[styles.goalTitle, { color: colors.onSurface }]}>Upcoming Bills</Text>
              </View>
              <View style={styles.goalFooter}>
                <Text style={[styles.goalTx, { color: colors.onSurfaceVariant }]}>{recurringStats.upcomingCount} due in 7d</Text>
                <Text style={[styles.goalAmt, { color: colors.primary }]}>{currencySymbol}{recurringStats.upcomingSum.toLocaleString('en-IN')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.goalCard, { backgroundColor: colors.surface }]}
              onPress={() => onNavigateTab('recurring')}
            >
              <View style={styles.goalHeader}>
                <MaterialIcons name="warning" size={20} color={colors.error} />
                <Text style={[styles.goalTitle, { color: colors.onSurface }]}>Overdue EMIs</Text>
              </View>
              <View style={styles.goalFooter}>
                <Text style={[styles.goalTx, { color: colors.onSurfaceVariant }]}>{recurringStats.overdueCount} overdue</Text>
                <Text style={[styles.goalAmt, { color: colors.error }]}>{currencySymbol}{recurringStats.overdueSum.toLocaleString('en-IN')}</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>

        {/* RIGHT COLUMN: RECENT TRANSACTIONS (Independent scroll on web) */}
        <View style={[
          styles.rightColumn, 
          isLargeScreen && { width: 440, marginLeft: 24 },
          (isLargeScreen && Platform.OS === 'web') ? ({ 
            maxHeight: 'calc(100vh - 160px)', 
            overflowY: 'auto', 
            paddingRight: 8 
          } as any) : undefined
        ]}>
          {groupedTxs.map(group => (
            <View key={group.title} style={styles.txGroup}>
              <Text style={[styles.txGroupTitle, { color: colors.onSurfaceVariant }]}>{group.title}</Text>
              
              {group.data.map(tx => {
                const isExpense = tx.type === 'expense' || tx.type === 'transfer';
                const isIncome = tx.type === 'income';
                
                let amtColor = colors.onSurface;
                if (isExpense) amtColor = colors.error;
                if (isIncome) amtColor = colors.success;

                let amtPrefix = isExpense ? '-' : (isIncome ? '+' : '');
                
                const cat = categories.find(c => c.id === tx.category);
                const acc = accounts.find(a => a.id === tx.account);
                const toAcc = accounts.find(a => a.id === tx.toAccount);
                
                let subObj: any = null;
                if (tx.subcategory && cat?.subcategories) {
                  subObj = cat.subcategories.find(s => {
                    const isObj = typeof s === 'object';
                    const sid = isObj ? (s as any).id : s;
                    const sname = isObj ? (s as any).name : s;
                    return sid === tx.subcategory || sname === tx.subcategory;
                  });
                  if (typeof subObj !== 'object') {
                    subObj = { name: subObj, color: cat.color, icon: cat.icon };
                  }
                }

                return (
                  <TouchableOpacity 
                    key={tx.id} 
                    style={[styles.txItem, { backgroundColor: colors.surface }]}
                    onPress={() => onEditTransaction(tx)}
                  >
                    <View style={styles.txIconWrap}>
                      <View style={[styles.txIconCircle, { backgroundColor: `${cat?.color || colors.outline}20` }]}>
                        <MaterialIcons name={(cat?.icon || 'help-outline') as any} size={24} color={cat?.color || colors.outline} />
                      </View>
                    </View>
                    
                    <View style={styles.txMid}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                        <Text style={[styles.txTitle, { color: colors.onSurface }]}>
                          {tx.description || cat?.name || 'Transaction'}
                        </Text>
                        {subObj && (
                          <View style={[styles.subPill, { backgroundColor: `${subObj.color}15` }]}>
                            <MaterialIcons name={subObj.icon} size={12} color={subObj.color} style={{ marginRight: 4 }} />
                            <Text style={[styles.subPillText, { color: colors.onSurface }]}>{subObj.name}</Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {tx.type === 'transfer' ? (
                          <>
                            <Text style={[styles.txSub, { color: colors.onSurfaceVariant }]}>{acc?.name || 'Unknown'}</Text>
                            <MaterialIcons name="arrow-forward" size={12} color={colors.onSurfaceVariant} style={{ marginHorizontal: 4 }} />
                            <Text style={[styles.txSub, { color: colors.onSurfaceVariant }]}>{toAcc?.name || 'Unknown'}</Text>
                          </>
                        ) : (
                          <Text style={[styles.txSub, { color: colors.onSurfaceVariant }]}>{acc?.name || 'Unknown'}</Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.txRight}>
                      <Text style={[styles.txAmount, { color: amtColor }]}>
                        {amtPrefix}{currencySymbol}{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                      </Text>
                      <Text style={[styles.txTime, { color: colors.onSurfaceVariant }]}>{formatTime(tx.date)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          {groupedTxs.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={48} color={colors.onSurfaceVariant} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No recent transactions found.</Text>
            </View>
          )}
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'web' ? 28 : 20,
    paddingTop: Platform.OS === 'web' ? 28 : 20,
    paddingBottom: 22,
  },
  headerLeft: {
    flex: 1,
  },
  timeText: {
    fontSize: Platform.OS === 'web' ? 44 : 32,
    fontWeight: '300',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 28 : 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  carouselContainer: {
    marginBottom: 24,
  },
  carouselScroll: {
    paddingHorizontal: Platform.OS === 'web' ? 28 : 20,
    gap: 12,
  },
  accountCard: {
    width: 145,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  accCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  accName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    paddingRight: 6,
  },
  accDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accBalance: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  accTxCount: {
    fontSize: 11,
  },
  splitContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 28 : 20,
    paddingBottom: 110,
  },
  splitRow: {
    flexDirection: 'row',
  },
  splitCol: {
    flexDirection: 'column',
  },
  leftColumn: {
    marginBottom: 24,
  },
  rightColumn: {
    
  },
  horizontalBudgetCard: {
    width: 260,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  goalCardHorizontal: {
    width: 280,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  emptyGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 94,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  emptyGoalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emptyGoalContent: {
    flex: 1,
    paddingRight: 8,
  },
  emptyGoalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  emptyGoalDescription: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.78,
  },
  emptyGoalAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bCardHeaderBand: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  bCardBodyBand: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
  },
  bCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  bAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bLeft: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
  },
  bTotal: {
    fontSize: 12,
    fontWeight: '500',
  },
  bProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bProgPercentInside: {
    position: 'absolute',
    right: 8,
    fontSize: 9,
    fontWeight: '700',
  },
  todayMarkerWrapper: {
    marginTop: 2,
    marginBottom: 10,
    position: 'relative',
  },
  todayBadge: {
    position: 'absolute',
    top: -16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 2,
  },
  todayText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dateRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  dateRangeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  bDailyText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  goalTx: {
    fontSize: 12,
  },
  goalAmt: {
    fontSize: 16,
    fontWeight: '700',
  },
  txGroup: {
    marginBottom: 24,
  },
  txGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  txIconWrap: {
    marginRight: 12,
  },
  txIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txMid: {
    flex: 1,
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  txSub: {
    fontSize: 13,
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  txTime: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  analyticsCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    marginHorizontal: Platform.OS === 'web' ? 28 : 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  heatmapContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  heatmapTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heatmapWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabelsCol: {
    marginRight: 8,
    height: 91,
    justifyContent: 'space-around',
  },
  dayLabelText: {
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'right',
    width: 10,
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 3.5,
    height: 91,
  },
  heatmapColumn: {
    flexDirection: 'column',
    gap: 3.5,
  },
  heatmapSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  heatmapLabelsRow: {
    height: 16,
    position: 'relative',
    marginTop: 6,
  },
  heatmapLabelText: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '600',
    marginHorizontal: 2,
  },
  legendSquare: {
    marginHorizontal: 1,
  },
});
