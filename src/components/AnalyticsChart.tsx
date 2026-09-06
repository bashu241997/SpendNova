import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Polygon, G, Text as SvgText } from 'react-native-svg';
import { ColorTheme } from '../theme/colors';
import { Transaction, Category, Account } from '../utils/storage';

export interface AnalyticsChartProps {
  transactions: Transaction[];
  categories?: Category[];
  accounts?: Account[];
  colors: ColorTheme;
  type?: 'income' | 'expense';
  mode?: 'line_comparison' | 'donut' | 'radar' | 'area';
  currencySymbol?: string;
  onSelectCategory?: (catId: string) => void;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  transactions,
  categories = [],
  accounts = [],
  colors,
  type = 'expense',
  mode = 'line_comparison',
  currencySymbol = '₹',
  onSelectCategory
}) => {
  const [width, setWidth] = useState(Dimensions.get('window').width - 48);

  // Filter transactions for current period
  const sampleDate = useMemo(() => {
    if (transactions.length > 0) return new Date(transactions[0].date);
    return new Date();
  }, [transactions]);

  const year = sampleDate.getFullYear();
  const month = sampleDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // -------------------------------------------------------------
  // 1. LINE COMPARISON DATA (Income vs Spending over days)
  // -------------------------------------------------------------
  const lineComparisonData = useMemo(() => {
    const dailyIncome = new Array(daysInMonth).fill(0);
    const dailyExpense = new Array(daysInMonth).fill(0);

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const dayIdx = d.getDate() - 1;
        if (t.type === 'income') dailyIncome[dayIdx] += t.amount;
        if (t.type === 'expense') dailyExpense[dayIdx] += t.amount;
      }
    });

    const cumIncome: number[] = [];
    const cumExpense: number[] = [];
    let runIncome = 0;
    let runExpense = 0;

    for (let i = 0; i < daysInMonth; i++) {
      runIncome += dailyIncome[i];
      runExpense += dailyExpense[i];
      cumIncome.push(runIncome);
      cumExpense.push(runExpense);
    }

    const totalIncome = runIncome;
    const totalExpense = runExpense;

    return { cumIncome, cumExpense, dailyIncome, dailyExpense, totalIncome, totalExpense };
  }, [transactions, month, year, daysInMonth]);

  // -------------------------------------------------------------
  // 2. CATEGORY BREAKDOWN DATA (For Donut & Radar Charts)
  // -------------------------------------------------------------
  const categoryBreakdown = useMemo(() => {
    const targetTxs = transactions.filter(t => t.type === type);
    const totalAmt = targetTxs.reduce((sum, t) => sum + t.amount, 0);
    const map = new Map<string, number>();

    targetTxs.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });

    const slices: { id: string; name: string; amount: number; percentage: number; color: string; icon: string }[] = [];
    
    map.forEach((amount, catId) => {
      const cat = categories.find(c => c.id === catId || c.name === catId);
      const name = cat ? cat.name : catId;
      const color = cat ? cat.color : '#64748B';
      const icon = cat ? cat.icon : 'label';
      const percentage = totalAmt > 0 ? (amount / totalAmt) * 100 : 0;
      slices.push({ id: catId, name, amount, percentage, color, icon });
    });

    slices.sort((a, b) => b.amount - a.amount);
    return { slices, totalAmt };
  }, [transactions, categories, type]);

  // -------------------------------------------------------------
  // RENDER MODE 1: DUAL / TRIPLE LINE CHART COMPARISON (Income vs Spending vs Money Left)
  // -------------------------------------------------------------
  if (mode === 'line_comparison' || mode === 'area') {
    const height = 220;
    const paddingX = 24;
    const paddingY = 24;

    const { cumIncome, cumExpense, totalIncome, totalExpense } = lineComparisonData;
    const moneyLeft = totalIncome - totalExpense;

    const cumNet = cumIncome.map((inc, i) => inc - cumExpense[i]);

    const maxVal = Math.max(...cumIncome, ...cumExpense, ...cumNet, 100);
    const minVal = Math.min(0, ...cumNet);
    const rangeY = maxVal - minVal || 1;

    const graphW = width - paddingX * 2;
    const graphH = height - paddingY * 2;
    const stepX = graphW / (daysInMonth - 1 || 1);

    const getX = (idx: number) => paddingX + idx * stepX;
    const getY = (val: number) => paddingY + graphH - ((val - minVal) / rangeY) * graphH;

    let pathInc = '';
    let areaInc = '';
    let pathExp = '';
    let areaExp = '';
    let pathNet = '';

    cumIncome.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) {
        pathInc += `M ${x},${y} `;
        areaInc += `M ${x},${y} `;
      } else {
        pathInc += `L ${x},${y} `;
        areaInc += `L ${x},${y} `;
      }
    });

    cumExpense.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) {
        pathExp += `M ${x},${y} `;
        areaExp += `M ${x},${y} `;
      } else {
        pathExp += `L ${x},${y} `;
        areaExp += `L ${x},${y} `;
      }
    });

    cumNet.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) {
        pathNet += `M ${x},${y} `;
      } else {
        pathNet += `L ${x},${y} `;
      }
    });

    const bottomY = getY(minVal);
    const firstX = getX(0);
    const lastX = getX(daysInMonth - 1);

    areaInc += `L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
    areaExp += `L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

    const incomeColor = colors.success || '#10B981';
    const expenseColor = colors.error || '#EF4444';
    const netColor = colors.primary || '#3B82F6';

    return (
      <View style={styles.container} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {/* STATS HEADER SUMMARY (Money Left, Money Spent, Income Credited) */}
        <View style={styles.legendHeaderRow}>
          <View style={[styles.legendBox, { backgroundColor: `${netColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: netColor }]} />
            <View>
              <Text style={[styles.legendLabel, { color: colors.onSurfaceVariant }]}>Money Left</Text>
              <Text style={[styles.legendValue, { color: moneyLeft >= 0 ? netColor : colors.error }]}>
                {currencySymbol}{moneyLeft.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          <View style={[styles.legendBox, { backgroundColor: `${expenseColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: expenseColor }]} />
            <View>
              <Text style={[styles.legendLabel, { color: colors.onSurfaceVariant }]}>Money Spent</Text>
              <Text style={[styles.legendValue, { color: expenseColor }]}>
                -{currencySymbol}{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          <View style={[styles.legendBox, { backgroundColor: `${incomeColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: incomeColor }]} />
            <View>
              <Text style={[styles.legendLabel, { color: colors.onSurfaceVariant }]}>Income</Text>
              <Text style={[styles.legendValue, { color: incomeColor }]}>
                +{currencySymbol}{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {/* DUAL / TRIPLE LINE CHART SVG */}
        <View style={{ height, width, position: 'relative' }}>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={incomeColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={incomeColor} stopOpacity="0.0" />
              </LinearGradient>
              <LinearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={expenseColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={expenseColor} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, idx) => {
              const gy = paddingY + graphH * (1 - ratio);
              return (
                <Line
                  key={idx}
                  x1={paddingX}
                  y1={gy}
                  x2={width - paddingX}
                  y2={gy}
                  stroke={colors.surfaceVariant}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Area Fills */}
            <Path d={areaInc} fill="url(#incGrad)" />
            <Path d={areaExp} fill="url(#expGrad)" />

            {/* Line Strokes */}
            <Path d={pathInc} fill="none" stroke={incomeColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d={pathExp} fill="none" stroke={expenseColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d={pathNet} fill="none" stroke={netColor} strokeWidth={3} strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" />

            {/* End Point Markers */}
            {cumIncome.length > 0 && (
              <Circle
                cx={getX(daysInMonth - 1)}
                cy={getY(cumIncome[daysInMonth - 1])}
                r={4}
                fill={incomeColor}
              />
            )}
            {cumExpense.length > 0 && (
              <Circle
                cx={getX(daysInMonth - 1)}
                cy={getY(cumExpense[daysInMonth - 1])}
                r={4}
                fill={expenseColor}
              />
            )}
            {cumNet.length > 0 && (
              <Circle
                cx={getX(daysInMonth - 1)}
                cy={getY(cumNet[daysInMonth - 1])}
                r={5}
                fill={netColor}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            )}
          </Svg>
        </View>

        {/* X-AXIS DAY LABELS */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: paddingX, marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: colors.onSurfaceVariant }}>Day 1</Text>
          <Text style={{ fontSize: 10, color: colors.onSurfaceVariant }}>Day {Math.floor(daysInMonth / 2)}</Text>
          <Text style={{ fontSize: 10, color: colors.onSurfaceVariant }}>Day {daysInMonth}</Text>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // RENDER MODE 2: DONUT CHART (Category / Accounts)
  // -------------------------------------------------------------
  if (mode === 'donut') {
    const { slices, totalAmt } = categoryBreakdown;
    const size = Math.min(width, 260);
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 20;
    const innerR = outerR - 26;

    let cumulativeAngle = -Math.PI / 2;

    const arcPaths = slices.map(slice => {
      const angle = (slice.percentage / 100) * (Math.PI * 2);
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      const x1 = cx + outerR * Math.cos(startAngle);
      const y1 = cy + outerR * Math.sin(startAngle);
      const x2 = cx + outerR * Math.cos(endAngle);
      const y2 = cy + outerR * Math.sin(endAngle);

      const x3 = cx + innerR * Math.cos(endAngle);
      const y3 = cy + innerR * Math.sin(endAngle);
      const x4 = cx + innerR * Math.cos(startAngle);
      const y4 = cy + innerR * Math.sin(startAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      return { ...slice, pathData };
    });

    return (
      <View style={styles.container} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 12 }}>
          <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
              {arcPaths.length === 0 ? (
                <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={colors.surfaceVariant} strokeWidth={26} />
              ) : (
                arcPaths.map(arc => (
                  <Path
                    key={arc.id}
                    d={arc.pathData}
                    fill={arc.color}
                    onPress={() => onSelectCategory?.(arc.id)}
                  />
                ))
              )}
            </Svg>

            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.onSurfaceVariant, textTransform: 'uppercase' }}>
                Total {type === 'expense' ? 'Spending' : 'Income'}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.onBackground }}>
                {currencySymbol}{totalAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {/* DONUT LEGEND LIST */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center' }}>
          {slices.slice(0, 6).map(slice => (
            <TouchableOpacity
              key={slice.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surfaceVariant,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 14,
              }}
              onPress={() => onSelectCategory?.(slice.id)}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: slice.color, marginRight: 6 }} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.onSurface, marginRight: 4 }}>
                {slice.name}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant }}>
                {slice.percentage.toFixed(0)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // RENDER MODE 3: RADAR / SPIDER CHART
  // -------------------------------------------------------------
  if (mode === 'radar') {
    const { slices } = categoryBreakdown;
    const topSlices = slices.slice(0, 6);
    const numAxes = Math.max(topSlices.length, 3);
    const size = Math.min(width, 260);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 35;

    const angleStep = (Math.PI * 2) / numAxes;

    // Grid polygons at 25%, 50%, 75%, 100%
    const levels = [0.25, 0.5, 0.75, 1.0];
    const gridPolygons = levels.map(level => {
      const points = [];
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + radius * level * Math.cos(angle);
        const y = cy + radius * level * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      return points.join(' ');
    });

    // Data polygon
    const maxPct = Math.max(...topSlices.map(s => s.percentage), 1);
    const dataPoints = [];
    for (let i = 0; i < numAxes; i++) {
      const pct = topSlices[i] ? topSlices[i].percentage / maxPct : 0.1;
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.max(pct, 0.1) * Math.cos(angle);
      const y = cy + radius * Math.max(pct, 0.1) * Math.sin(angle);
      dataPoints.push(`${x},${y}`);
    }
    const dataPolygonStr = dataPoints.join(' ');

    const primaryColor = colors.primary || '#3B82F6';

    return (
      <View style={styles.container} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 12 }}>
          <Svg width={size} height={size}>
            {/* Concentric Web Lines */}
            {gridPolygons.map((pts, idx) => (
              <Polygon
                key={idx}
                points={pts}
                fill="none"
                stroke={colors.surfaceVariant}
                strokeWidth={1.5}
              />
            ))}

            {/* Spokes */}
            {Array.from({ length: numAxes }).map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x = cx + radius * Math.cos(angle);
              const y = cy + radius * Math.sin(angle);
              return (
                <Line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={colors.surfaceVariant}
                  strokeWidth={1}
                />
              );
            })}

            {/* Data Polygon Fill & Stroke */}
            <Polygon
              points={dataPolygonStr}
              fill={`${primaryColor}40`}
              stroke={primaryColor}
              strokeWidth={3.5}
              strokeLinejoin="round"
            />

            {/* Axis Label Vertices */}
            {topSlices.map((slice, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelR = radius + 18;
              const lx = cx + labelR * Math.cos(angle);
              const ly = cy + labelR * Math.sin(angle);
              return (
                <G key={slice.id}>
                  <Circle
                    cx={cx + radius * (slice.percentage / maxPct) * Math.cos(angle)}
                    cy={cy + radius * (slice.percentage / maxPct) * Math.sin(angle)}
                    r={4}
                    fill={slice.color}
                  />
                  <SvgText
                    x={lx}
                    y={ly + 4}
                    fill={colors.onSurface}
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {slice.name.substring(0, 8)}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    width: '100%',
    position: 'relative',
  },
  legendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    gap: 12,
  },
  legendBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  legendValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
