import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Polygon, G, Text as SvgText, Rect } from 'react-native-svg';
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 1. LAST 45 DAYS LINE COMPARISON DATA (Money Left, Expense, Income Data Points)
  // -------------------------------------------------------------
  const lineComparisonData = useMemo(() => {
    const numDays = 45;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysList: { date: Date; dateStr: string; label: string }[] = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (numDays - 1 - i));
      daysList.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    const dailyIncome = new Array(numDays).fill(0);
    const dailyExpense = new Array(numDays).fill(0);

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      const tStr = tDate.toISOString().split('T')[0];
      const dayIdx = daysList.findIndex(d => d.dateStr === tStr);
      if (dayIdx !== -1) {
        if (t.type === 'income') dailyIncome[dayIdx] += t.amount;
        if (t.type === 'expense') dailyExpense[dayIdx] += t.amount;
      }
    });

    const cumIncome: number[] = [];
    const cumExpense: number[] = [];
    let runIncome = 0;
    let runExpense = 0;

    for (let i = 0; i < numDays; i++) {
      runIncome += dailyIncome[i];
      runExpense += dailyExpense[i];
      cumIncome.push(runIncome);
      cumExpense.push(runExpense);
    }

    const totalIncome = runIncome;
    const totalExpense = runExpense;

    return { daysList, numDays, dailyIncome, dailyExpense, cumIncome, cumExpense, totalIncome, totalExpense };
  }, [transactions]);

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
  // RENDER MODE 1: LAST 45 DAYS LINE CHART COMPARISON
  // -------------------------------------------------------------
  if (mode === 'line_comparison' || mode === 'area') {
    const height = 230;
    const paddingX = 24;
    const paddingY = 24;

    const { daysList, numDays, dailyIncome, dailyExpense, cumIncome, cumExpense, totalIncome, totalExpense } = lineComparisonData;

    // Total Starting Money at the start of 45-day window
    const baseAccountStartingBalance = accounts.length > 0
      ? accounts.reduce((sum, a) => sum + (a.initialBalance || 0), 0)
      : 0;

    // Money Left per day curve = Base starting money + cumIncome[i] - cumExpense[i]
    const moneyLeftCurve = cumExpense.map((exp, i) => {
      return Math.max(0, baseAccountStartingBalance + cumIncome[i] - exp);
    });

    const currentMoneyLeft = moneyLeftCurve[moneyLeftCurve.length - 1] ?? Math.max(0, baseAccountStartingBalance + totalIncome - totalExpense);

    const maxVal = Math.max(...moneyLeftCurve, ...cumExpense, baseAccountStartingBalance + totalIncome, 100);
    const minVal = 0;
    const rangeY = maxVal - minVal || 1;

    const graphW = width - paddingX * 2;
    const graphH = height - paddingY * 2;
    const stepX = graphW / (numDays - 1 || 1);

    const getX = (idx: number) => paddingX + idx * stepX;
    const getY = (val: number) => paddingY + graphH - ((val - minVal) / rangeY) * graphH;

    let pathMoneyLeft = '';
    let areaMoneyLeft = '';
    let pathExpInc = '';
    let areaExpInc = '';

    moneyLeftCurve.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) {
        pathMoneyLeft += `M ${x},${y} `;
        areaMoneyLeft += `M ${x},${y} `;
      } else {
        pathMoneyLeft += `L ${x},${y} `;
        areaMoneyLeft += `L ${x},${y} `;
      }
    });

    cumExpense.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) {
        pathExpInc += `M ${x},${y} `;
        areaExpInc += `M ${x},${y} `;
      } else {
        pathExpInc += `L ${x},${y} `;
        areaExpInc += `L ${x},${y} `;
      }
    });

    const bottomY = getY(0);
    const firstX = getX(0);
    const lastX = getX(numDays - 1);

    areaMoneyLeft += `L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
    areaExpInc += `L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

    const moneyLeftColor = '#2563EB'; // Rich Vibrant Royal Blue
    const expenseColor = colors.error || '#EF4444';
    const incomeColor = colors.success || '#10B981';

    const activePoint = hoveredIdx !== null ? {
      dateLabel: daysList[hoveredIdx]?.label,
      moneyLeftVal: moneyLeftCurve[hoveredIdx],
      expenseVal: cumExpense[hoveredIdx],
      dailyIncomeVal: dailyIncome[hoveredIdx],
      dailyExpenseVal: dailyExpense[hoveredIdx],
      x: getX(hoveredIdx),
      yMoney: getY(moneyLeftCurve[hoveredIdx]),
      yExp: getY(cumExpense[hoveredIdx]),
    } : null;

    return (
      <View style={styles.container} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {/* STATS HEADER SUMMARY (Money Left in Blue, Money Spent in Red) */}
        <View style={styles.legendHeaderRow}>
          <View style={[styles.legendBox, { backgroundColor: `${moneyLeftColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: moneyLeftColor }]} />
            <View>
              <Text style={[styles.legendLabel, { color: colors.onSurfaceVariant }]}>Money Left (Last 45 Days)</Text>
              <Text style={[styles.legendValue, { color: moneyLeftColor }]}>
                {currencySymbol}{currentMoneyLeft.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          <View style={[styles.legendBox, { backgroundColor: `${expenseColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: expenseColor }]} />
            <View>
              <Text style={[styles.legendLabel, { color: colors.onSurfaceVariant }]}>Money Spent (45 Days)</Text>
              <Text style={[styles.legendValue, { color: expenseColor }]}>
                {currencySymbol}{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {/* 45-DAY DUAL LINE CHART SVG */}
        <View 
          style={{ height, width, position: 'relative' }}
          {...({
            onPointerMove: (e: any) => {
              if (e?.nativeEvent?.locationX !== undefined) {
                const mouseX = e.nativeEvent.locationX;
                const idx = Math.floor(((mouseX - paddingX) / graphW) * numDays);
                if (idx >= 0 && idx < numDays) setHoveredIdx(idx);
              }
            },
            onPointerLeave: () => setHoveredIdx(null)
          } as any)}
        >
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={moneyLeftColor} stopOpacity="0.25" />
                <Stop offset="1" stopColor={moneyLeftColor} stopOpacity="0.0" />
              </LinearGradient>
              <LinearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={expenseColor} stopOpacity="0.25" />
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
            <Path d={areaMoneyLeft} fill="url(#blueGrad)" />
            <Path d={areaExpInc} fill="url(#redGrad)" />

            {/* Line Strokes */}
            <Path d={pathMoneyLeft} fill="none" stroke={moneyLeftColor} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d={pathExpInc} fill="none" stroke={expenseColor} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Income Data Point Pulse Dots (Shows green dots on days income was credited) */}
            {dailyIncome.map((inc, idx) => {
              if (inc <= 0) return null;
              const ix = getX(idx);
              const iy = getY(moneyLeftCurve[idx]);
              return (
                <G key={`inc_dot_${idx}`}>
                  <Circle cx={ix} cy={iy} r={6} fill={incomeColor} stroke="#FFFFFF" strokeWidth={2} />
                </G>
              );
            })}

            {/* Hover Guide & Active Highlight Dots */}
            {activePoint && (
              <>
                <Line
                  x1={activePoint.x}
                  y1={paddingY}
                  x2={activePoint.x}
                  y2={height - paddingY}
                  stroke={colors.onSurfaceVariant}
                  strokeWidth={1.5}
                  strokeDasharray="4,4"
                />
                <Circle cx={activePoint.x} cy={activePoint.yMoney} r={7} fill={moneyLeftColor} stroke="#FFFFFF" strokeWidth={2} />
                <Circle cx={activePoint.x} cy={activePoint.yExp} r={7} fill={expenseColor} stroke="#FFFFFF" strokeWidth={2} />

                {/* IN-CHART SVG TOOLTIP POPOVER */}
                {(() => {
                  const hasIncome = activePoint.dailyIncomeVal > 0;
                  const tipWidth = 145;
                  const tipHeight = hasIncome ? 74 : 58;

                  let tipX = activePoint.x - tipWidth / 2;
                  if (tipX < paddingX) tipX = paddingX;
                  if (tipX + tipWidth > width - paddingX) tipX = width - paddingX - tipWidth;

                  let tipY = activePoint.yMoney - tipHeight - 10;
                  if (tipY < paddingY) {
                    tipY = activePoint.yMoney + 14;
                  }

                  return (
                    <G key="in_chart_tooltip">
                      <Rect
                        x={tipX}
                        y={tipY}
                        width={tipWidth}
                        height={tipHeight}
                        rx={10}
                        ry={10}
                        fill="#0F172A"
                        fillOpacity={0.94}
                        stroke={moneyLeftColor}
                        strokeWidth={1.5}
                      />
                      <SvgText
                        x={tipX + 10}
                        y={tipY + 16}
                        fill="#F8FAFC"
                        fontSize="11"
                        fontWeight="700"
                      >
                        📅 {activePoint.dateLabel}
                      </SvgText>
                      <SvgText
                        x={tipX + 10}
                        y={tipY + 32}
                        fill="#60A5FA"
                        fontSize="11"
                        fontWeight="600"
                      >
                        Left: {currencySymbol}{activePoint.moneyLeftVal.toLocaleString()}
                      </SvgText>
                      <SvgText
                        x={tipX + 10}
                        y={tipY + 48}
                        fill="#F87171"
                        fontSize="11"
                        fontWeight="600"
                      >
                        Spent: -{currencySymbol}{activePoint.dailyExpenseVal.toLocaleString()}
                      </SvgText>
                      {hasIncome && (
                        <SvgText
                          x={tipX + 10}
                          y={tipY + 64}
                          fill="#34D399"
                          fontSize="11"
                          fontWeight="700"
                        >
                          Income: +{currencySymbol}{activePoint.dailyIncomeVal.toLocaleString()}
                        </SvgText>
                      )}
                    </G>
                  );
                })()}
              </>
            )}

            {/* Touch / Hover Column Detectors for 45 Days */}
            {daysList.map((d, i) => {
              const colW = graphW / numDays;
              const cx = getX(i) - colW / 2;
              return (
                <Rect
                  key={i}
                  x={cx}
                  y={0}
                  width={colW}
                  height={height}
                  fill="transparent"
                  onPressIn={() => setHoveredIdx(i)}
                  onPress={() => setHoveredIdx(i)}
                />
              );
            })}
          </Svg>
        </View>

        {/* X-AXIS 45-DAY LABELS */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: paddingX, marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: colors.onSurfaceVariant }}>45 Days Ago ({daysList[0]?.label})</Text>
          <Text style={{ fontSize: 10, color: colors.onSurfaceVariant }}>{daysList[22]?.label}</Text>
          <Text style={{ fontSize: 10, color: colors.onSurfaceVariant }}>Today ({daysList[44]?.label})</Text>
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
    marginBottom: 12,
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
  tooltipCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  tooltipLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tooltipVal: {
    fontSize: 12,
    fontWeight: '800',
  },
});
