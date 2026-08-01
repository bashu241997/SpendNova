import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ColorTheme } from '../theme/colors';
import { Transaction, Category } from '../utils/storage';

interface AnalyticsChartProps {
  transactions: Transaction[];
  categories: Category[];
  colors: ColorTheme;
  type: 'income' | 'expense';
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  transactions,
  colors,
  type,
}) => {
  const [width, setWidth] = useState(Dimensions.get('window').width - 48); // default width, updated via onLayout
  const height = 180;
  const padding = 20;

  const filteredTxs = useMemo(() => transactions.filter(t => t.type === type), [transactions, type]);
  const totalAmount = useMemo(() => filteredTxs.reduce((sum, t) => sum + t.amount, 0), [filteredTxs]);

  // Aggregate by day of month (assuming data passed in is a single month)
  const chartData = useMemo(() => {
    if (filteredTxs.length === 0) return [];
    
    // Find the month we are looking at by checking the first transaction
    // Or just default to current month if transactions is empty.
    const sampleDate = filteredTxs[0] ? new Date(filteredTxs[0].date) : new Date();
    const year = sampleDate.getFullYear();
    const month = sampleDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dailyTotals = new Array(daysInMonth).fill(0);
    
    filteredTxs.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const dayIdx = d.getDate() - 1;
        dailyTotals[dayIdx] += t.amount;
      }
    });

    // Instead of raw daily amounts, we can optionally make it cumulative, 
    // but the user asked for an area chart. Usually, spending over time is cumulative in area charts
    // or just daily spikes. Cumulative looks better for an area chart.
    const cumulative = [];
    let running = 0;
    for (let i = 0; i < dailyTotals.length; i++) {
      running += dailyTotals[i];
      cumulative.push(running);
    }
    return cumulative;
  }, [filteredTxs]);

  const { maxVal, minVal } = useMemo(() => {
    if (chartData.length === 0) return { maxVal: 0, minVal: 0 };
    return {
      maxVal: Math.max(...chartData),
      minVal: Math.min(0, ...chartData)
    };
  }, [chartData]);

  if (totalAmount === 0 || chartData.length === 0) {
    return (
      <View style={[styles.container, { height }]} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.outline }]}>
            No data available for this selection
          </Text>
        </View>
      </View>
    );
  }

  // Calculate Path
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  const stepX = graphWidth / (chartData.length - 1 || 1);
  const rangeY = maxVal - minVal || 1; // avoid div by 0

  const getPoint = (val: number, index: number) => {
    const x = padding + index * stepX;
    const y = padding + graphHeight - ((val - minVal) / rangeY) * graphHeight;
    return { x, y };
  };

  let linePath = '';
  let areaPath = '';

  chartData.forEach((val, i) => {
    const p = getPoint(val, i);
    if (i === 0) {
      linePath += `M ${p.x},${p.y} `;
      areaPath += `M ${p.x},${p.y} `;
    } else {
      // Smooth curve using bezier or simple lines. Simple lines for now.
      linePath += `L ${p.x},${p.y} `;
      areaPath += `L ${p.x},${p.y} `;
    }
  });

  // Close area path
  const firstP = getPoint(chartData[0], 0);
  const lastP = getPoint(chartData[chartData.length - 1], chartData.length - 1);
  const bottomY = padding + graphHeight;
  
  areaPath += `L ${lastP.x},${bottomY} L ${firstP.x},${bottomY} Z`;

  const chartColor = type === 'income' ? colors.success : colors.error;

  return (
    <View style={styles.container} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={chartColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={chartColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#gradient)" />
        <Path d={linePath} fill="none" stroke={chartColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View style={styles.totalOverlay}>
        <Text style={[styles.totalLabel, { color: colors.outline }]}>Total {type === 'income' ? 'Income' : 'Expense'}</Text>
        <Text style={[styles.totalValue, { color: colors.onBackground }]}>
          ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    width: '100%',
    position: 'relative',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  totalOverlay: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
  }
});
