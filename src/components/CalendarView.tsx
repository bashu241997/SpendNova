import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { Transaction } from '../utils/storage';

interface CalendarViewProps {
  transactions: Transaction[];
  colors: ColorTheme;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currentMonth?: Date;
  onMonthChange?: (newMonth: Date) => void;
  showMonthHeader?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  colors,
  selectedDate,
  onSelectDate,
  currentMonth: controlledMonth,
  onMonthChange,
  showMonthHeader = true,
}) => {
  const [internalMonth, setInternalMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const activeMonth = controlledMonth || internalMonth;

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();

  const handlePrevMonth = () => {
    const newM = new Date(year, month - 1, 1);
    if (onMonthChange) onMonthChange(newM);
    else setInternalMonth(newM);
  };

  const handleNextMonth = () => {
    const newM = new Date(year, month + 1, 1);
    if (onMonthChange) onMonthChange(newM);
    else setInternalMonth(newM);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  const getDayFinances = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTxs = transactions.filter(t => {
      const txDateKey = (t.date || '').split('T')[0].split(' ')[0];
      return txDateKey === dateStr;
    });
    
    const income = dayTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, dateStr };
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      {showMonthHeader && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 4 }}>
            <MaterialIcons name="chevron-left" size={26} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.onSurface }]}>
            {monthNames[month]} {year}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={{ padding: 4 }}>
            <MaterialIcons name="chevron-right" size={26} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.weekLabels}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
          <Text 
            key={d} 
            style={[
              styles.weekLabel, 
              { color: colors.onSurfaceVariant },
              index === 0 && { color: colors.error },
              index === 6 && { color: colors.info }
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }

          const { income, expense, dateStr } = getDayFinances(day);
          const isSelected = selectedDate === dateStr;

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.cell,
                isSelected && { backgroundColor: colors.primaryContainer, borderRadius: 12 }
              ]}
              onPress={() => onSelectDate(dateStr)}
            >
              <Text 
                style={[
                  styles.dayNumber, 
                  { color: colors.onSurface },
                  isSelected && { fontWeight: '700', color: colors.onPrimaryContainer }
                ]}
              >
                {day}
              </Text>
              
              <View style={styles.indicatorContainer}>
                {income > 0 && (
                  <Text style={[styles.amountText, { color: '#22C55E' }]} numberOfLines={1}>
                    +{income >= 1000 ? `${(income/1000).toFixed(1)}k` : income.toFixed(0)}
                  </Text>
                )}
                {expense > 0 && (
                  <Text style={[styles.amountText, { color: '#EF4444' }]} numberOfLines={1}>
                    -{expense >= 1000 ? `${(expense/1000).toFixed(1)}k` : expense.toFixed(0)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    height: 52,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '500',
  },
  indicatorContainer: {
    marginTop: 2,
    alignItems: 'center',
    width: '100%',
  },
  amountText: {
    fontSize: 8,
    fontWeight: '600',
    lineHeight: 9,
    textAlign: 'center',
    width: '100%',
  },
});
