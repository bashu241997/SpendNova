import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, ScrollView } from 'react-native';
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
    icon: 'verified-user',
    title: 'Your Personal Ledger,\nCompletely Private',
    description: 'SpendNova encrypts all your income, expenses, and bank records locally inside your browser using Web Crypto 256-bit AES-GCM. No servers, no tracking, zero middleman.',
    featurePoints: [
      'Web Crypto AES-256 encryption',
      'Data never leaves your browser',
      'No account registration required'
    ]
  },
  {
    badge: 'GITHUB-STYLE HEATMAP',
    badgeColor: '#3EA6FF',
    icon: 'insights',
    title: 'Visualize Spending Patterns\n& Live Balances',
    description: 'Monitor your spending habits across an 18-week activity heatmap. Keep track of daily cashflow deltas and live balances across all your checking, savings & credit card accounts.',
    featurePoints: [
      '18-week activity intensity grid',
      'Income vs expense breakdown',
      'Real-time account balances'
    ]
  },
  {
    badge: 'CATEGORY LIMITS & GOALS',
    badgeColor: '#E1002D',
    icon: 'savings',
    title: 'Stay On Target with Budgets\n& Savings Goals',
    description: 'Set monthly category budgets to prevent overspending, and link transactions directly to savings goals like emergency funds, travel, or major purchases.',
    featurePoints: [
      'Monthly category spending caps',
      'Link transactions to goals',
      'Auto-calculated goal progress'
    ]
  },
  {
    badge: 'ZERO-KNOWLEDGE BACKUPS',
    badgeColor: '#107516',
    icon: 'cloud-sync',
    title: '1-Click Cashew Imports\n& Private Drive Sync',
    description: 'Migrate your transaction history from Cashew CSV exports in seconds. Optionally link your personal Google Drive for private, 1-click encrypted cloud backups across device platforms.',
    featurePoints: [
      'Cashew CSV import & export',
      'Private Google Drive backups',
      'Transfer pairing detection'
    ]
  },
  {
    badge: 'FINAL STEP',
    badgeColor: '#3EA6FF',
    icon: 'rocket-launch',
    title: 'Ready to Take Control\nof Your Finances?',
    description: 'Review our privacy disclaimers and accept terms to launch your private SpendNova ledger.',
    featurePoints: [
      'Personal tracking tool disclaimer',
      'Local device storage consent',
      '100% free and open ledger'
    ]
  }
];

export const OnboardingSlideshow: React.FC<OnboardingSlideshowProps> = ({ onAcceptTerms }) => {
  const { colors } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hasAgreed, setHasAgreed] = useState(true);

  const slide = SLIDES[currentSlideIndex];
  const isFirst = currentSlideIndex === 0;
  const isLast = currentSlideIndex === SLIDES.length - 1;

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

  // Parallax offset shift calculation
  const parallaxOffset = (currentSlideIndex - (SLIDES.length - 1) / 2) * 40;

  return (
    <LinearGradient colors={colors.backgroundGradient as [string, string]} style={styles.container}>
      {/* Background Floating Parallax Orbs */}
      <View style={[styles.parallaxOrb1, { transform: [{ translateX: -parallaxOffset }, { translateY: parallaxOffset * 0.5 }] }]} />
      <View style={[styles.parallaxOrb2, { transform: [{ translateX: parallaxOffset * 0.8 }, { translateY: -parallaxOffset * 0.4 }] }]} />

      <View style={styles.contentWrapper}>
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.logoText, { color: colors.onSurface }]}>SpendNova</Text>
            <View style={[styles.versionPill, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
              <Text style={[styles.versionText, { color: colors.onSurfaceVariant }]}>v1.0</Text>
            </View>
          </View>

          {!isLast && (
            <TouchableOpacity onPress={() => setCurrentSlideIndex(SLIDES.length - 1)} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>Skip to Accept Terms</Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Main Parallax Slide Card */}
        <View style={[styles.slideCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          
          {/* Badge */}
          <View style={[styles.badgePill, { backgroundColor: `${slide.badgeColor}15` }]}>
            <View style={[styles.badgeDot, { backgroundColor: slide.badgeColor }]} />
            <Text style={[styles.badgeText, { color: slide.badgeColor }]}>{slide.badge}</Text>
          </View>

          {/* Animated Hero Icon */}
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}>
            <MaterialIcons name={slide.icon as any} size={42} color={colors.onPrimaryContainer} />
          </View>

          {/* Title & Description */}
          <Text style={[styles.title, { color: colors.onSurface }]}>{slide.title}</Text>
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{slide.description}</Text>

          {/* Bullet Points */}
          <View style={styles.pointsWrapper}>
            {slide.featurePoints.map((pt, idx) => (
              <View key={idx} style={styles.pointRow}>
                <MaterialIcons name="check-circle" size={18} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[styles.pointText, { color: colors.onSurface }]}>{pt}</Text>
              </View>
            ))}
          </View>

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

        </View>

        {/* Slide Progress Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setCurrentSlideIndex(idx)}
              style={[
                styles.dot,
                { backgroundColor: colors.outline },
                idx === currentSlideIndex && { width: 28, backgroundColor: colors.onSurface }
              ]}
            />
          ))}
        </View>

        {/* Navigation Footer Controls */}
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
          ) : <View style={{ width: 100 }} />}

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  parallaxOrb1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  parallaxOrb2: {
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 580,
    alignItems: 'center',
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  versionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
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
  slideCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 20,
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  pointsWrapper: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pointText: {
    fontSize: 13,
    fontWeight: '600',
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    width: '100%',
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerControls: {
    width: '100%',
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
