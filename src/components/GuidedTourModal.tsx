import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface GuidedTourModalProps {
  visible: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    icon: 'verified-user',
    title: 'Welcome to SpendNova',
    badge: '100% Privacy Guaranteed',
    badgeColor: '#107516',
    description: 'SpendNova is your private financial ledger. All your income, expenses, and accounts are encrypted locally on your web browser using Web Crypto 256-bit AES-GCM. No servers, no tracking, zero middleman.',
    tip: 'Your data stays exclusively inside your browser local storage.'
  },
  {
    icon: 'insights',
    title: 'Visual Dashboard & Heatmap',
    badge: 'Real-Time Insights',
    badgeColor: '#3EA6FF',
    description: 'Track your last 18 weeks of activity on a GitHub-style heatmap. Monitor daily balances, monthly cashflow deltas, and live balances across all your bank accounts & credit cards.',
    tip: 'Tap on any heatmap square to filter transactions for that exact day.'
  },
  {
    icon: 'receipt-long',
    title: 'Transactions & CSV Imports',
    badge: 'Cashew Compatible',
    badgeColor: '#E1002D',
    description: 'Easily filter transactions by month, category, or account. Need to migrate? Import converted Cashew CSV files or export your full ledger as a standard SpendNova CSV anytime.',
    tip: 'SpendNova auto-detects and pairs transfers between accounts.'
  },
  {
    icon: 'savings',
    title: 'Smart Budgets & Savings Goals',
    badge: 'Financial Planning',
    badgeColor: '#107516',
    description: 'Set category spending limits to prevent overspending. Track real-time progress bars with instant status alerts, and save towards emergency funds, travel, or big purchases.',
    tip: 'Create custom categories and subcategories anytime in Settings.'
  },
  {
    icon: 'cloud-sync',
    title: 'Encrypted Storage & Drive Sync',
    badge: 'Zero-Knowledge Backups',
    badgeColor: '#3EA6FF',
    description: 'Your Web Crypto encryption keys persist safely in IndexedDB. Optionally link your personal Google Drive for private, 1-click cloud sync across all your phones, tablets, and laptops.',
    tip: 'Google Drive sync only accesses your private app storage space.'
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ visible, onClose }) => {
  const { colors } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={[styles.stepCounterPill, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
              <Text style={[styles.stepCounterText, { color: colors.onSurfaceVariant }]}>
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Main Icon & Content */}
          <View style={styles.body}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}>
              <MaterialIcons name={step.icon as any} size={36} color={colors.onPrimaryContainer} />
            </View>

            <View style={[styles.badgePill, { backgroundColor: `${step.badgeColor}15` }]}>
              <View style={[styles.badgeDot, { backgroundColor: step.badgeColor }]} />
              <Text style={[styles.badgeText, { color: step.badgeColor }]}>{step.badge}</Text>
            </View>

            <Text style={[styles.title, { color: colors.onSurface }]}>{step.title}</Text>
            <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{step.description}</Text>

            <View style={[styles.tipBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
              <MaterialIcons name="lightbulb" size={18} color={colors.onSurfaceVariant} style={{ marginRight: 8 }} />
              <Text style={[styles.tipText, { color: colors.onSurfaceVariant }]}>{step.tip}</Text>
            </View>
          </View>

          {/* Progress Indicator Dots */}
          <View style={styles.dotsRow}>
            {TOUR_STEPS.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCurrentStep(idx)}
                style={[
                  styles.dot,
                  { backgroundColor: colors.outline },
                  idx === currentStep && { width: 24, backgroundColor: colors.onSurface }
                ]}
              />
            ))}
          </View>

          {/* Footer Control Buttons */}
          <View style={styles.footer}>
            {!isFirst ? (
              <TouchableOpacity
                style={[styles.btnSecondary, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
                onPress={handlePrev}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={18} color={colors.onSurface} style={{ marginRight: 6 }} />
                <Text style={[styles.btnSecondaryText, { color: colors.onSurface }]}>Previous</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.btnSkip}
                onPress={onClose}
              >
                <Text style={[styles.btnSkipText, { color: colors.onSurfaceVariant }]}>Skip Tour</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.primaryContainer, borderColor: colors.outline }]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={[styles.btnPrimaryText, { color: colors.onPrimaryContainer }]}>
                {isLast ? 'Explore SpendNova' : 'Next Step'}
              </Text>
              {!isLast && <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimaryContainer} style={{ marginLeft: 6 }} />}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepCounterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    alignItems: 'center',
    textAlign: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    width: '100%',
  },
  tipText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnSkip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnSkipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
