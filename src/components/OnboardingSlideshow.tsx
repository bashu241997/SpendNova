import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

interface OnboardingSlideshowProps {
  onAcceptTerms: () => void;
}

export const OnboardingSlideshow: React.FC<OnboardingSlideshowProps> = ({ onAcceptTerms }) => {
  const { colors } = useApp();
  const { width, height } = useWindowDimensions();
  const [hasAgreed, setHasAgreed] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const isMobile = width < 768;

  // Parallax background translations
  const bgOrb1TranslateY = scrollY.interpolate({
    inputRange: [-200, 0, 1000],
    outputRange: [-80, 0, -350],
    extrapolate: 'clamp'
  });

  const bgOrb2TranslateY = scrollY.interpolate({
    inputRange: [-200, 0, 1000],
    outputRange: [50, 0, 280],
    extrapolate: 'clamp'
  });

  const heroCardTiltY = scrollY.interpolate({
    inputRange: [0, 500],
    outputRange: ['0deg', '-12deg'],
    extrapolate: 'clamp'
  });

  const heroCardScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.94],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.outerContainer}>
      <LinearGradient colors={colors.backgroundGradient as [string, string]} style={styles.gradientContainer}>
        
        {/* Layer 1: Parallax Floating Spatial Mesh Orbs */}
        <Animated.View style={[styles.bgOrb1, { transform: [{ translateY: bgOrb1TranslateY }] }]} />
        <Animated.View style={[styles.bgOrb2, { transform: [{ translateY: bgOrb2TranslateY }] }]} />

        {/* Floating Fixed Top Bar */}
        <View style={styles.topHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[styles.logoText, { color: colors.onSurface }]}>SpendNova</Text>
            <View style={[styles.versionPill, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
              <Text style={[styles.versionText, { color: colors.onSurfaceVariant }]}>3D Vertical Parallax</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.quickLaunchBtn, { backgroundColor: colors.success }]}
            onPress={() => onAcceptTerms()}
            activeOpacity={0.85}
          >
            <MaterialIcons name="rocket-launch" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.quickLaunchText}>Launch App</Text>
          </TouchableOpacity>
        </View>

        {/* Main 3D Parallax Vertical Scroll Canvas */}
        <Animated.ScrollView
          style={styles.scrollCanvas}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: Platform.OS !== 'web' }
          )}
        >
          {/* HERO SECTION */}
          <Animated.View
            style={[
              styles.heroSection,
              Platform.OS === 'web' && ({
                transform: `perspective(1000px) rotateX(${heroCardTiltY}) scale(${heroCardScale})`,
                transition: 'transform 0.1s ease-out'
              } as any)
            ]}
          >
            <View style={[styles.badgePill, { backgroundColor: `${colors.primary}18` }]}>
              <MaterialIcons name="auto-awesome" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>NEXT-GEN SPATIAL LEDGER</Text>
            </View>

            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>
              Master Personal Finances With Zero Servers
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.onSurfaceVariant }]}>
              Scroll down to explore the 3D local privacy engine & features built for complete money control.
            </Text>

            <View style={styles.scrollIndicatorRow}>
              <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.primary} />
              <Text style={[styles.scrollIndicatorText, { color: colors.onSurfaceVariant }]}>Scroll Down For Parallax Experience</Text>
            </View>
          </Animated.View>

          {/* PARALLAX SECTION 1: 100% CLIENT-SIDE ENCRYPTION */}
          <View style={styles.featureSection}>
            <View style={styles.featureTextCol}>
              <View style={[styles.sectionBadge, { backgroundColor: '#10751615' }]}>
                <MaterialIcons name="security" size={14} color="#107516" style={{ marginRight: 6 }} />
                <Text style={[styles.sectionBadgeText, { color: '#107516' }]}>AES-256 CLIENT PRIVACY</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Zero Servers. Zero Tracking.</Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant }]}>
                Every record is encrypted directly in your browser using 256-bit AES-GCM cryptography. Your keys stay in local IndexedDB — no third-party database ever sees your money.
              </Text>
              <View style={styles.chipsRow}>
                <View style={[styles.featureChip, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onSurface }]}>🔒 PBKDF2 Master Key</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onPrimaryContainer }]}>⚡ IndexedDB Local Store</Text>
                </View>
              </View>
            </View>

            <View style={[styles.visualCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              <View style={[styles.vaultIconCircle, { backgroundColor: '#10751615', borderColor: '#107516' }]}>
                <MaterialIcons name="vpn-key" size={42} color="#107516" />
              </View>
              <Text style={[styles.visualCardTitle, { color: colors.onSurface }]}>Client Web Crypto Active</Text>
              <View style={styles.visualStatGrid}>
                <View style={[styles.miniStat, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.miniStatLabel, { color: colors.onPrimaryContainer }]}>Cloud Tracking</Text>
                  <Text style={[styles.miniStatVal, { color: colors.error }]}>Disabled</Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[styles.miniStatLabel, { color: colors.onSurfaceVariant }]}>Data Storage</Text>
                  <Text style={[styles.miniStatVal, { color: colors.success }]}>100% Local</Text>
                </View>
              </View>
            </View>
          </View>

          {/* PARALLAX SECTION 2: UPWARD CASHFLOW & HEATMAP */}
          <View style={[styles.featureSection, styles.reverseSection]}>
            <View style={[styles.visualCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              <View style={styles.graphTopRow}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.onSurface }}>Net Cashflow Trajectory</Text>
                <Text style={{ fontSize: 14, fontWeight: '900', color: colors.success }}>+₹25,506.02</Text>
              </View>
              <View style={styles.graphBarRow}>
                {[25, 40, 32, 55, 48, 72, 88, 80, 100].map((h, idx) => (
                  <View key={idx} style={[styles.barColFill, { height: `${h}%`, backgroundColor: idx >= 6 ? colors.success : colors.primaryContainer }]} />
                ))}
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant, marginTop: 12, textAlign: 'center' }}>
                18-Week Intensity Heatmap Active
              </Text>
            </View>

            <View style={styles.featureTextCol}>
              <View style={[styles.sectionBadge, { backgroundColor: '#3EA6FF15' }]}>
                <MaterialIcons name="trending-up" size={14} color="#3EA6FF" style={{ marginRight: 6 }} />
                <Text style={[styles.sectionBadgeText, { color: '#3EA6FF' }]}>UPWARD CASHFLOW & HEATMAP</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Visualize Growth & Spending</Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant }]}>
                Spot spending patterns instantly with an activity intensity grid, track net daily deltas, and watch your upward cashflow trajectory across all your bank accounts & cards.
              </Text>
              <View style={styles.chipsRow}>
                <View style={[styles.featureChip, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onSurface }]}>📈 Activity Intensity Grid</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onPrimaryContainer }]}>💳 Multi-Account Sync</Text>
                </View>
              </View>
            </View>
          </View>

          {/* PARALLAX SECTION 3: INSTANT ENTRY & BUDGETING */}
          <View style={styles.featureSection}>
            <View style={styles.featureTextCol}>
              <View style={[styles.sectionBadge, { backgroundColor: '#E1002D15' }]}>
                <MaterialIcons name="post-add" size={14} color="#E1002D" style={{ marginRight: 6 }} />
                <Text style={[styles.sectionBadgeText, { color: '#E1002D' }]}>INSTANT ENTRY & BUDGETING</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Categorize Expenses in Seconds</Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant }]}>
                Quickly enter income, expenses, and transfers. Every transaction automatically feeds into its matching category budget and updates linked savings goals.
              </Text>
              <View style={styles.chipsRow}>
                <View style={[styles.featureChip, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onSurface }]}>🍔 Dining Budget Alert</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onPrimaryContainer }]}>⚡ Real-Time Cap Limits</Text>
                </View>
              </View>
            </View>

            <View style={[styles.visualCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, width: '100%' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.onSurface }}>Category Budget Cap</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.error }}>₹2,404 / ₹5,000</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
                <View style={[styles.progressFill, { width: '48%', backgroundColor: colors.error }]} />
              </View>
              <Text style={{ fontSize: 11, color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>
                48% Used — You have ₹2,596 remaining
              </Text>
            </View>
          </View>

          {/* PARALLAX SECTION 4: SAVINGS GOALS */}
          <View style={[styles.featureSection, styles.reverseSection]}>
            <View style={[styles.visualCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              <MaterialIcons name="emoji-events" size={48} color="#FFD700" style={{ marginBottom: 8 }} />
              <Text style={[styles.visualCardTitle, { color: colors.onSurface }]}>🎯 Emergency Fund</Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant, height: 10, width: '100%', marginVertical: 10 }]}>
                <View style={[styles.progressFill, { width: '85%', backgroundColor: colors.success }]} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>
                85% Saved (₹85,000 / ₹100,000)
              </Text>
            </View>

            <View style={styles.featureTextCol}>
              <View style={[styles.sectionBadge, { backgroundColor: '#10751615' }]}>
                <MaterialIcons name="emoji-events" size={14} color="#107516" style={{ marginRight: 6 }} />
                <Text style={[styles.sectionBadgeText, { color: '#107516' }]}>SAVINGS GOALS & MILESTONES</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Animated Savings Milestones</Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant }]}>
                Set spending limits per category to prevent overspending. Link transactions directly to savings goals and watch your goal progress bars fill up dynamically.
              </Text>
              <View style={styles.chipsRow}>
                <View style={[styles.featureChip, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onSurface }]}>🎯 Emergency Fund 85%</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}>
                  <Text style={[styles.chipText, { color: colors.onPrimaryContainer }]}>🚗 New Car Goal 40%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* FINAL LAUNCH SECTION */}
          <View style={[styles.launchCardSection, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            <MaterialIcons name="rocket-launch" size={54} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={[styles.launchTitle, { color: colors.onSurface }]}>Ready to Launch SpendNova?</Text>
            <Text style={[styles.launchSub, { color: colors.onSurfaceVariant }]}>
              SpendNova runs 100% locally on your browser with client-side AES encryption. No signups, no cloud tracking.
            </Text>

            <TouchableOpacity
              style={[styles.termsRow, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
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
                I accept that SpendNova is a personal tracking tool running locally on this device.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mainLaunchBtn,
                { backgroundColor: colors.success, borderColor: colors.outline },
                !hasAgreed && { opacity: 0.5 }
              ]}
              onPress={() => onAcceptTerms()}
              disabled={!hasAgreed}
              activeOpacity={0.85}
            >
              <MaterialIcons name="rocket-launch" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.mainLaunchBtnText}>Accept Terms & Launch App</Text>
            </TouchableOpacity>
          </View>

        </Animated.ScrollView>

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
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bgOrb2: {
    position: 'absolute',
    top: '40%',
    right: '5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  topHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 64,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 99,
  },
  logoText: {
    fontSize: 24,
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
  quickLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  quickLaunchText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollCanvas: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroSection: {
    width: '100%',
    maxWidth: 800,
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 40,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 600,
    marginBottom: 24,
  },
  scrollIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scrollIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  featureSection: {
    width: '100%',
    maxWidth: 900,
    flexDirection: Platform.OS === 'web' && Dimensions.get('window').width > 768 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    marginBottom: 50,
  },
  reverseSection: {
    flexDirection: Platform.OS === 'web' && Dimensions.get('window').width > 768 ? 'row-reverse' : 'column',
  },
  featureTextCol: {
    flex: 1,
    width: '100%',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  featureChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  visualCard: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  vaultIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  visualCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  visualStatGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  miniStat: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  miniStatVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  graphTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  graphBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    width: '100%',
    gap: 4,
  },
  barColFill: {
    flex: 1,
    borderRadius: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  launchCardSection: {
    width: '100%',
    maxWidth: 600,
    padding: 32,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  launchTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  launchSub: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  mainLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  mainLaunchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
