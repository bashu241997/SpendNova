import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallBannerProps {
  colors: any;
}

export function PWAInstallBanner({ colors }: PWAInstallBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [installHelpVisible, setInstallHelpVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android'>('android');
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const slideAnim = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(userAgent);

    // This prompt is intentionally only for phone/tablet browsers. Desktop keeps
    // its normal web experience, while installed PWAs do not need a prompt.
    if (!isIOS && !isAndroid) return;
    setPlatform(isIOS ? 'ios' : 'android');

    // Already installed as PWA — don't show.
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // A dismissal only applies to this browser session. The banner should be
    // available again when the person returns, rather than being hidden for
    // days after one accidental dismissal.
    localStorage.removeItem('spendnova_pwa_dismissed');
    if (sessionStorage.getItem('spendnova_pwa_dismissed') === 'true') return;

    const revealBanner = () => {
      setShowBanner(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    };

    // iOS does not expose beforeinstallprompt. Show the banner there with the
    // native Add to Home Screen instructions. Android uses the browser prompt
    // when it is available and has a useful manual fallback when it is not.
    if (isIOS) revealBanner();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      revealBanner();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    // Some Android browsers do not dispatch beforeinstallprompt. Still offer
    // a clear route to the browser's Install app menu item.
    if (isAndroid) {
      const fallbackTimer = window.setTimeout(revealBanner, 1200);
      return () => {
        window.clearTimeout(fallbackTimer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (installHelpVisible) {
      handleDismiss();
      return;
    }

    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      await deferredPrompt.current.userChoice;
      deferredPrompt.current = null;
      handleDismiss();
      return;
    }

    // Safari must be installed from its share menu; other browsers without the
    // prompt expose the same action through their overflow menu.
    setInstallHelpVisible(true);
  };

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -140,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowBanner(false);
      if (Platform.OS === 'web') {
        sessionStorage.setItem('spendnova_pwa_dismissed', 'true');
      }
    });
  };

  if (!showBanner || Platform.OS !== 'web') return null;

  const title = installHelpVisible
    ? platform === 'ios' ? 'Add SpendNova to your Home Screen' : 'Install SpendNova from your browser menu'
    : 'Use SpendNova like an app';
  const subtitle = installHelpVisible
    ? platform === 'ios' ? 'Tap Share, then “Add to Home Screen”.' : 'Tap ⋮, then choose “Install app” or “Add to Home screen”.'
    : 'Save it to your phone for a full-screen, app-like experience.';

  return (
    <>
      <Animated.View
        style={[
          styles.banner,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.outline,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
      <View style={styles.bannerContent}>
        <View style={styles.bannerLeft}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.primaryContainer || 'rgba(59,130,246,0.15)' }]}>
            <MaterialIcons name="install-mobile" size={22} color={colors.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: colors.onSurface }]}>
              {title}
            </Text>
            <Text style={[styles.bannerSubtitle, { color: colors.onSurfaceVariant }]}>
              {subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.bannerActions}>
          <TouchableOpacity
            onPress={handleInstall}
            style={[styles.installButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.installButtonText}>
              {deferredPrompt.current ? 'Install' : installHelpVisible ? 'Got it' : 'Add'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>
      </Animated.View>

    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
    opacity: 0.8,
    lineHeight: 17,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  installButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  installButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dismissButton: {
    padding: 6,
    borderRadius: 20,
  },
});
