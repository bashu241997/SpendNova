import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

interface OnboardingSlideshowProps {
  onAcceptTerms: () => void;
}

const SLIDES = [
  {
    badge: '100% CLIENT-SIDE PRIVACY',
    badgeColor: '#107516',
    icon: 'security',
    title: 'Web Crypto AES-256 Encrypted Ledger',
    subtitle: 'Zero Servers. Zero Tracking. Complete Data Ownership.',
    description: 'Every record is encrypted directly in your browser using 256-bit AES-GCM cryptography. Your keys stay in IndexedDB — no third-party database ever sees your money.',
    floatingChip1: '🔒 AES-256 Active',
    floatingChip2: '⚡ IndexedDB Key',
    visualType: 'security_vault'
  },
  {
    badge: 'UPWARD GRAPH & HEATMAP',
    badgeColor: '#3EA6FF',
    icon: 'trending-up',
    title: 'Upward Cashflow Graph & Activity Grid',
    subtitle: 'Visualize Net Worth Growth & Spending Trends',
    description: 'Spot spending patterns instantly with an activity intensity grid, track net daily deltas, and watch your upward cashflow trajectory across all your bank accounts & cards.',
    floatingChip1: '📈 Upward Graph',
    floatingChip2: '₹25,506.02 Cashflow',
    visualType: 'upward_graph'
  },
  {
    badge: 'TRANSACTION ENTRY FLOW',
    badgeColor: '#E1002D',
    icon: 'post-add',
    title: 'Instant Transaction Entry & Budgeting',
    subtitle: 'Categorize Expenses, Transfers & Goals in Seconds',
    description: 'Quickly enter income, expenses, and transfers. Every transaction automatically feeds into its matching category budget and updates linked savings goals.',
    floatingChip1: '💳 Instant Entry',
    floatingChip2: '🍔 Dining ₹2,404',
    visualType: 'tx_entry_flow'
  },
  {
    badge: 'GOAL PROGRESS & SAVINGS',
    badgeColor: '#107516',
    icon: 'emoji-events',
    title: 'Animated Savings Goal Progress',
    subtitle: 'Track Emergency Funds & Target Milestones',
    description: 'Set spending limits per category to prevent overspending. Link transactions directly to savings goals and watch your goal progress bars fill up dynamically.',
    floatingChip1: '🎯 Emergency Fund 85%',
    floatingChip2: '💡 Budget Cap Alert',
    visualType: 'goal_progress'
  },
  {
    badge: 'READY TO LAUNCH',
    badgeColor: '#3EA6FF',
    icon: 'rocket-launch',
    title: 'Master Your Personal Finances',
    subtitle: 'Review Privacy Terms & Launch SpendNova',
    description: 'SpendNova is a personal tracking tool running 100% locally on this device. Accept disclaimers to launch your private ledger.',
    floatingChip1: '🛡️ Local Device Storage',
    floatingChip2: '🚀 Free & Private',
    visualType: 'launchpad'
  }
];

export const OnboardingSlideshow: React.FC<OnboardingSlideshowProps> = ({ onAcceptTerms }) => {
  const { colors } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hasAgreed, setHasAgreed] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for graph & elements
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  const slide = SLIDES[currentSlideIndex];
  const isFirst = currentSlideIndex === 0;
  const isLast = currentSlideIndex === SLIDES.length - 1;

  // Track mouse movement for 3D Apple Parallax tilt effect on web
  const handleMouseMove = (e: any) => {
    if (Platform.OS === 'web' && e) {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x: x * 15, y: y * 15 });
    }
  };

  const handleNext = () => {
    if (isLast) {
      onAcceptTerms();
    } else {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // Parallax offsets based on slide index and mouse position
  const slideParallaxX = (currentSlideIndex - (SLIDES.length - 1) / 2) * 35;
  const cardTiltStyle = Platform.OS === 'web' ? ({
    transform: `perspective(1000px) rotateY(${mousePos.x * 0.4}deg) rotateX(${-mousePos.y * 0.4}deg) translateX(${-slideParallaxX * 0.2}px)`,
    transition: 'transform 0.15s ease-out'
  } as any) : {};

  const foregroundParallaxStyle = Platform.OS === 'web' ? ({
    transform: `translateX(${slideParallaxX * 0.6 + mousePos.x * 0.8}px) translateY(${mousePos.y * 0.8}px)`,
    transition: 'transform 0.2s ease-out'
  } as any) : {};

  return (
    <View style={styles.outerContainer} {...(Platform.OS === 'web' ? { onMouseMove: handleMouseMove } as any : {})}>
      <LinearGradient colors={colors.backgroundGradient as [string, string]} style={styles.gradientContainer}>
        
        {/* Layer 1: Background Parallax Floating Mesh Orbs */}
        <View style={[styles.bgOrb1, { transform: [{ translateX: -slideParallaxX * 1.2 }, { translateY: slideParallaxX * 0.5 }] }]} />
        <View style={[styles.bgOrb2, { transform: [{ translateX: slideParallaxX * 1.5 }, { translateY: -slideParallaxX * 0.6 }] }]} />

        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[styles.logoText, { color: colors.onSurface }]}>SpendNova</Text>
            <View style={[styles.versionPill, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
              <Text style={[styles.versionText, { color: colors.onSurfaceVariant }]}>Encrypted Ledger</Text>
            </View>
          </View>

          {!isLast && (
            <TouchableOpacity onPress={() => setCurrentSlideIndex(SLIDES.length - 1)} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>Skip to Accept Terms</Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Main 2-Column Parallax Stage */}
        <View style={styles.stageContainer}>
          
          {/* Column 1: Apple 3D Interactive UI Illustration Card */}
          <View style={[styles.mockupColumn, cardTiltStyle]}>
            <View style={[styles.appFrameCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              
              {/* App Window Title Bar */}
              <View style={[styles.appFrameHeader, { borderBottomColor: colors.outline }]}>
                <View style={styles.windowControls}>
                  <View style={[styles.windowDot, { backgroundColor: '#FF5F56' }]} />
                  <View style={[styles.windowDot, { backgroundColor: '#FFBD2E' }]} />
                  <View style={[styles.windowDot, { backgroundColor: '#27C93F' }]} />
                </View>
                <Text style={[styles.appFrameTitle, { color: colors.onSurfaceVariant }]}>SpendNova Feature Reveal</Text>
              </View>

              {/* ILLUSTRATION CONTENT SLIDE CARDS */}
              <View style={styles.appFrameBody}>
                
                {/* SLIDE 1 ILLUSTRATION: SECURITY VAULT */}
                {slide.visualType === 'security_vault' && (
                  <View style={styles.uiMockupBox}>
                    <Animated.View style={[styles.securityBadgeCircle, { backgroundColor: `${colors.success}15`, borderColor: colors.success, transform: [{ scale: pulseAnim }] }]}>
                      <MaterialIcons name="security" size={48} color={colors.success} />
                    </Animated.View>
                    <Text style={[styles.mockupHeading, { color: colors.onSurface }]}>AES-256 Web Crypto Engine</Text>
                    <View style={[styles.vaultKeyPill, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                      <MaterialIcons name="vpn-key" size={16} color={colors.onSurfaceVariant} style={{ marginRight: 6 }} />
                      <Text style={[styles.vaultKeyText, { color: colors.onSurfaceVariant }]}>PBKDF2-HMAC-SHA256 Master Key</Text>
                    </View>
                    <View style={styles.mockupStatRow}>
                      <View style={[styles.mockupMiniCard, { backgroundColor: colors.primaryContainer }]}>
                        <Text style={[styles.miniCardLabel, { color: colors.onPrimaryContainer }]}>Client Encryption</Text>
                        <Text style={[styles.miniCardValue, { color: colors.onPrimaryContainer }]}>Active</Text>
                      </View>
                      <View style={[styles.mockupMiniCard, { backgroundColor: colors.surfaceVariant }]}>
                        <Text style={[styles.miniCardLabel, { color: colors.onSurfaceVariant }]}>Cloud Tracking</Text>
                        <Text style={[styles.miniCardValue, { color: colors.error }]}>Disabled</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* SLIDE 2 ILLUSTRATION: UPWARD GRAPH GOING UP & HEATMAP */}
                {slide.visualType === 'upward_graph' && (
                  <View style={styles.uiMockupBox}>
                    <View style={styles.graphHeaderRow}>
                      <View>
                        <Text style={[styles.mockupSubHeading, { color: colors.onSurface }]}>Net Worth & Cashflow</Text>
                        <Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>Last 18 Weeks Performance</Text>
                      </View>
                      <View style={[styles.growthTag, { backgroundColor: `${colors.success}15` }]}>
                        <MaterialIcons name="trending-up" size={16} color={colors.success} style={{ marginRight: 4 }} />
                        <Text style={[styles.growthTagText, { color: colors.success }]}>+₹25,506.02</Text>
                      </View>
                    </View>

                    {/* UPWARD GRAPH WAVE ILLUSTRATION */}
                    <View style={styles.graphWaveContainer}>
                      {/* Bars forming an upward trend */}
                      {[25, 38, 30, 52, 45, 68, 85, 78, 100].map((h, i) => (
                        <View key={i} style={styles.barCol}>
                          <Animated.View
                            style={[
                              styles.graphBarFill,
                              {
                                height: `${h}%`,
                                backgroundColor: i >= 6 ? colors.success : colors.primaryContainer,
                              }
                            ]}
                          />
                        </View>
                      ))}
                    </View>

                    {/* Heatmap Mini Grid */}
                    <View style={styles.simulatedGridRow}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant, marginRight: 8 }}>18-Wk Activity Grid:</Text>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {[...Array(12)].map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.simulatedSquare,
                              { backgroundColor: i % 3 === 0 ? colors.success : (i % 2 === 0 ? colors.outline : colors.surfaceVariant) }
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* SLIDE 3 ILLUSTRATION: ENTERING TRANSACTIONS FLOW */}
                {slide.visualType === 'tx_entry_flow' && (
                  <View style={styles.uiMockupBox}>
                    <View style={[styles.entryFormCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.onSurface }}>+ New Transaction</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: `${colors.error}15` }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.error }}>EXPENSE</Text>
                        </View>
                      </View>
                      
                      {/* Typing Amount Mock */}
                      <View style={[styles.inputMockRow, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant }}>AMOUNT:</Text>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: colors.error }}>₹ 2,404.00</Text>
                      </View>

                      {/* Category & Account Selectors */}
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <View style={[styles.pickerMockPill, { backgroundColor: colors.surface }]}>
                          <MaterialIcons name="restaurant" size={14} color={colors.onSurface} style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurface }}>🍔 Dining</Text>
                        </View>
                        <View style={[styles.pickerMockPill, { backgroundColor: colors.surface }]}>
                          <MaterialIcons name="account-balance" size={14} color={colors.onSurface} style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurface }}>Axis Bank</Text>
                        </View>
                      </View>

                      <View style={[styles.savedSuccessBadge, { backgroundColor: `${colors.success}15` }]}>
                        <MaterialIcons name="check-circle" size={14} color={colors.success} style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.success }}>Transaction Saved & Budget Updated!</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* SLIDE 4 ILLUSTRATION: SAVINGS GOAL PROGRESS & BUDGETS */}
                {slide.visualType === 'goal_progress' && (
                  <View style={styles.uiMockupBox}>
                    <Animated.View style={[styles.goalMockCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline, transform: [{ scale: pulseAnim }] }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialIcons name="emoji-events" size={18} color="#FFD700" style={{ marginRight: 6 }} />
                          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.onSurface }}>🎯 Emergency Fund</Text>
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: colors.success }}>85% Complete</Text>
                      </View>
                      <View style={[styles.progressBarTrack, { backgroundColor: colors.outline, height: 10 }]}>
                        <View style={[styles.progressBarFill, { width: '85%', backgroundColor: colors.success }]} />
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.onSurfaceVariant, marginTop: 6, textAlign: 'right' }}>
                        Saved: ₹85,000 / Target: ₹100,000
                      </Text>
                    </Animated.View>

                    <View style={[styles.goalMockCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline, marginTop: 12 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onSurface }}>💡 Monthly Groceries Cap</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: colors.error }}>₹2,404 / ₹5,000</Text>
                      </View>
                      <View style={[styles.progressBarTrack, { backgroundColor: colors.outline }]}>
                        <View style={[styles.progressBarFill, { width: '48%', backgroundColor: colors.error }]} />
                      </View>
                    </View>
                  </View>
                )}

                {/* SLIDE 5 ILLUSTRATION: LAUNCHPAD */}
                {slide.visualType === 'launchpad' && (
                  <View style={styles.uiMockupBox}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <MaterialIcons name="rocket-launch" size={54} color={colors.primary} style={{ marginBottom: 12 }} />
                    </Animated.View>
                    <Text style={[styles.mockupHeading, { color: colors.onSurface }]}>SpendNova Personal Ledger</Text>
                    <Text style={{ fontSize: 13, textAlign: 'center', color: colors.onSurfaceVariant, marginVertical: 8 }}>
                      Ready to launch your encrypted browser ledger.
                    </Text>
                  </View>
                )}

              </View>

            </View>

            {/* Layer 3: Floating Parallax Badges Overlay */}
            <View style={[styles.floatingChip, styles.floatingChipPos1, foregroundParallaxStyle, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
              <Text style={[styles.floatingChipText, { color: colors.onSurface }]}>{slide.floatingChip1}</Text>
            </View>
            <View style={[styles.floatingChip, styles.floatingChipPos2, foregroundParallaxStyle, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}>
              <Text style={[styles.floatingChipText, { color: colors.onPrimaryContainer }]}>{slide.floatingChip2}</Text>
            </View>
          </View>

          {/* Column 2: Presentation Text & Controls */}
          <View style={styles.textColumn}>
            
            <View style={[styles.badgePill, { backgroundColor: `${slide.badgeColor}15` }]}>
              <View style={[styles.badgeDot, { backgroundColor: slide.badgeColor }]} />
              <Text style={[styles.badgeText, { color: slide.badgeColor }]}>{slide.badge}</Text>
            </View>

            <Text style={[styles.mainTitle, { color: colors.onSurface }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{slide.subtitle}</Text>
            <Text style={[styles.descriptionText, { color: colors.onSurfaceVariant }]}>{slide.description}</Text>

            {/* Disclaimer Checkbox on Last Slide */}
            {isLast && (
              <TouchableOpacity
                style={[styles.termsBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
                onPress={() => setHasAgreed(!hasAgreed)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={hasAgreed ? "check-box" : "check-box-outline-blank"}
                  size={22}
                  color={hasAgreed ? colors.onSurface : colors.outline}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.termsText, { color: colors.onSurfaceVariant }]}>
                  Important Notice: SpendNova stores records locally in this browser. You agree that this is a personal tracking tool and does not constitute financial, tax, or investment advice.
                </Text>
              </TouchableOpacity>
            )}

            {/* Progress Dots */}
            <View style={styles.dotsRow}>
              {SLIDES.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setCurrentSlideIndex(idx)}
                  style={[
                    styles.dot,
                    { backgroundColor: colors.outline },
                    idx === currentSlideIndex && { width: 32, backgroundColor: colors.onSurface }
                  ]}
                />
              ))}
            </View>

            {/* Footer Navigation Buttons */}
            <View style={styles.footerControls}>
              {!isFirst ? (
                <TouchableOpacity
                  style={[styles.btnSecondary, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
                  onPress={handlePrev}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="arrow-back" size={18} color={colors.onSurface} style={{ marginRight: 6 }} />
                  <Text style={[styles.btnSecondaryText, { color: colors.onSurface }]}>Previous</Text>
                </TouchableOpacity>
              ) : <View style={{ width: 90 }} />}

              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  { backgroundColor: isLast ? colors.success : colors.primaryContainer, borderColor: colors.outline },
                  isLast && !hasAgreed && { opacity: 0.5 }
                ]}
                onPress={handleNext}
                disabled={isLast && !hasAgreed}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnPrimaryText, { color: isLast ? '#FFFFFF' : colors.onPrimaryContainer }]}>
                  {isLast ? 'Accept Terms & Launch App' : 'Next Feature'}
                </Text>
                {!isLast && <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimaryContainer} style={{ marginLeft: 8 }} />}
              </TouchableOpacity>
            </View>

          </View>

        </View>

      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '10%',
    right: '5%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  topHeader: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  versionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stageContainer: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: Platform.OS === 'web' && Dimensions.get('window').width > 800 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
  },
  mockupColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    position: 'relative',
  },
  appFrameCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  },
  appFrameHeader: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  windowControls: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 16,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  appFrameTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  appFrameBody: {
    padding: 28,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uiMockupBox: {
    width: '100%',
    alignItems: 'center',
  },
  securityBadgeCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mockupHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  vaultKeyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  vaultKeyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mockupStatRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  mockupMiniCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  miniCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  miniCardValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  graphHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  mockupSubHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  growthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  graphWaveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  graphBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  simulatedGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  simulatedSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  entryFormCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  inputMockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  pickerMockPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  savedSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  goalMockCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  floatingChip: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  floatingChipPos1: {
    top: -12,
    right: -12,
  },
  floatingChipPos2: {
    bottom: -12,
    left: -12,
  },
  floatingChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  textColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 16,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 20,
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
