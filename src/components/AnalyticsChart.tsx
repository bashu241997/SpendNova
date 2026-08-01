import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { ColorTheme } from '../theme/colors';
import { Transaction, Category } from '../utils/storage';

interface AnalyticsChartProps {
  transactions: Transaction[];
  categories: Category[];
  colors: ColorTheme;
  type: 'income' | 'expense';
}

interface ChartItem {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  transactions,
  categories,
  colors,
  type,
}) => {
  const filteredTxs = transactions.filter(t => t.type === type);
  const totalAmount = filteredTxs.reduce((sum, t) => sum + t.amount, 0);

  const grouped = filteredTxs.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData: ChartItem[] = Object.keys(grouped)
    .map(catId => {
      const cat = categories.find(c => c.id === catId || c.name === catId);
      const name = cat ? cat.name : catId;
      const color = cat ? cat.color : '#9E9E9E';
      const amount = grouped[catId];
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

      return {
        id: catId,
        name,
        amount,
        color,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const RADIUS = 70;
  const STROKE_WIDTH = 24;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  
  let accumulatedPercent = 0;

  return (
    <View style={styles.container}>
      {totalAmount === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.outline }]}>
            No data available for this selection
          </Text>
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <View style={styles.svgWrapper}>
            <Svg width={180} height={180} viewBox="0 0 180 180">
              <G rotation="-90" origin="90, 90">
                <Circle
                  cx="90"
                  cy="90"
                  r={RADIUS}
                  fill="transparent"
                  stroke={colors.surfaceVariant}
                  strokeWidth={STROKE_WIDTH}
                />
                {chartData.map((item) => {
                  const strokeDashoffset = CIRCUMFERENCE - (item.percentage / 100) * CIRCUMFERENCE;
                  const rotationAngle = (accumulatedPercent / 100) * 360;
                  accumulatedPercent += item.percentage;

                  return (
                    <Circle
                      key={item.id}
                      cx="90"
                      cy="90"
                      r={RADIUS}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={strokeDashoffset}
                      rotation={rotationAngle}
                      origin="90, 90"
                      strokeLinecap="round"
                    />
                  );
                })}
              </G>
            </Svg>
            <View style={styles.centerLabel}>
              <Text style={[styles.centerSub, { color: colors.outline }]}>Total</Text>
              <Text 
                numberOfLines={1} 
                adjustsFontSizeToFit 
                style={[styles.centerVal, { color: colors.onBackground }]}
              >
                ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <FlatList
            data={chartData}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            style={styles.legendList}
            renderItem={({ item }) => (
              <View style={styles.legendItem}>
                <View style={[styles.colorBadge, { backgroundColor: item.color }]} />
                <View style={styles.legendInfo}>
                  <Text style={[styles.legendName, { color: colors.onBackground }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.legendPct, { color: colors.outline }]}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
                <Text style={[styles.legendVal, { color: colors.onBackground }]}>
                  ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  svgWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  centerLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
  },
  centerSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  centerVal: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  legendList: {
    width: '100%',
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  legendPct: {
    fontSize: 12,
    marginLeft: 8,
  },
  legendVal: {
    fontSize: 14,
    fontWeight: '600',
  },
});
