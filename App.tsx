import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  useWindowDimensions,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { BudgetsScreen } from './src/screens/BudgetsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { AccountsScreen } from './src/screens/AccountsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddTransactionScreen } from './src/screens/AddTransactionScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { RecurringScreen } from './src/screens/RecurringScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { LinearGradient } from 'expo-linear-gradient';

import { OnboardingSlideshow } from './src/components/OnboardingSlideshow';
import { GuidedTourModal } from './src/components/GuidedTourModal';
import { SecureStorage } from './src/utils/secureStorage';
import { Transaction } from './src/utils/storage';
import { CurrencyPickerModal } from './src/components/CurrencyPickerModal';
import { getCountryDetails } from './src/utils/currencies';

type MainTab = 'home' | 'transactions' | 'budgets' | 'stats' | 'accounts' | 'settings' | 'categories' | 'more' | 'recurring' | 'goals';

function MainAppContent() {
  const { colors, themeType, loading, hasAcceptedTerms, acceptTerms, country, setCountry } = useApp();
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!loading && hasAcceptedTerms) {
      SecureStorage.getItem('spendnova_tour_completed').then(completed => {
        if (!completed) {
          setIsTourOpen(true);
        }
      });
    }
  }, [loading, hasAcceptedTerms]);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    SecureStorage.setItem('spendnova_tour_completed', 'true');
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleId = 'custom-web-scrollbar';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      const thumbColor = themeType === 'dark' ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.4)';
      const thumbHover = themeType === 'dark' ? 'rgba(148, 163, 184, 0.8)' : 'rgba(71, 85, 105, 0.8)';
      const trackColor = 'transparent';

      document.title = 'SpendNova : Personal Expense Tracker';
      styleEl.innerHTML = `
        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        ::-webkit-scrollbar-track {
          background: ${trackColor};
        }
        ::-webkit-scrollbar-thumb {
          background: ${thumbColor};
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${thumbHover};
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: ${thumbColor} ${trackColor};
        }
        *:focus {
          outline: none !important;
        }
      `;
    }
  }, [themeType, colors]);

  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#0D0E12' }]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={[styles.loadingText, { color: '#B0B8C8' }]}>Loading database...</Text>
      </View>
    );
  }
  if (!hasAcceptedTerms) {
    return <OnboardingSlideshow onAcceptTerms={() => void acceptTerms()} />;
  }

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddMode(true);
  };

  const handleCloseAddMode = () => {
    setIsAddMode(false);
    setEditingTransaction(undefined);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onAddTransaction={() => setIsAddMode(true)}
            onEditTransaction={handleEditTransaction}
            onNavigateTab={(tab) => setActiveTab(tab as MainTab)}
          />
        );
      case 'transactions':
        return (
          <TransactionsScreen
            onAddTransaction={() => setIsAddMode(true)}
            onEditTransaction={handleEditTransaction}
          />
        );
      case 'budgets':
        return <BudgetsScreen />;
      case 'stats':
        return <StatsScreen onEditTransaction={handleEditTransaction} onBack={() => setActiveTab('more')} />;
      case 'accounts':
        return <AccountsScreen onBack={() => setActiveTab('more')} />;
      case 'settings':
        return <SettingsScreen onNavigate={(t) => setActiveTab(t as any)} onBack={() => setActiveTab('more')} />;
      case 'categories':
        return <CategoriesScreen onBack={() => setActiveTab('settings')} />;
      case 'more':
        return <MoreScreen onNavigate={(t) => setActiveTab(t as any)} />;
      case 'recurring':
        return <RecurringScreen onBack={() => setActiveTab('more')} />;
      case 'goals':
        return <GoalsScreen onBack={() => setActiveTab('more')} />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home': return 'Home';
      case 'transactions': return 'Transactions';
      case 'budgets': return 'Budgets';
      case 'stats': return 'Analytics';
      case 'accounts': return 'Accounts';
      case 'settings': return 'Settings';
      case 'categories': return 'Categories';
      case 'more': return 'More';
      case 'recurring': return 'Subscriptions & EMIs';
      case 'goals': return 'Savings Goals';
    }
  };

  const safeAreaStyle = [
    styles.safeArea,
    { backgroundColor: 'transparent' },
    Platform.OS === 'web' && isDesktop && { alignItems: 'center', justifyContent: 'center' }
  ] as any;

  const containerStyle = [
    styles.rootContainer,
    { backgroundColor: 'transparent' },
    Platform.OS === 'web' && isDesktop && { borderColor: colors.surfaceVariant }
  ] as any;

  const glassSidebarStyle = [
    styles.sidebar,
    {
      backgroundColor: colors.surface,
      borderRightColor: colors.outline
    }
  ];

  const glassBottomTabStyle = [
    styles.bottomTabBar,
    {
      backgroundColor: colors.surface,
      borderColor: colors.outline
    }
  ];

  if (isDesktop) {
    return (
      <LinearGradient colors={colors.backgroundGradient as [string, string]} style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, flexDirection: 'row', flex: 1, width: '100%', height: '100%' }]}>
          <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />

          <View style={glassSidebarStyle}>
            <Text style={[styles.sidebarLogo, { color: colors.primary, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 }]}>SpendNova</Text>

            <View style={styles.sidebarMenu}>
              {(['home', 'transactions', 'accounts', 'budgets', 'goals', 'recurring', 'stats', 'settings'] as MainTab[]).map(tab => {
                const active = activeTab === tab;
                let icon = 'dashboard';
                let label = 'Home';

                if (tab === 'home') {
                  icon = 'dashboard';
                  label = 'Home';
                } else if (tab === 'transactions') {
                  icon = 'receipt';
                  label = 'Transactions';
                } else if (tab === 'accounts') {
                  icon = 'account-balance-wallet';
                  label = 'Accounts';
                } else if (tab === 'budgets') {
                  icon = 'pie-chart';
                  label = 'Budgets';
                } else if (tab === 'goals') {
                  icon = 'emoji-events';
                  label = 'Savings Goals';
                } else if (tab === 'recurring') {
                  icon = 'event-repeat';
                  label = 'Subscriptions & EMIs';
                } else if (tab === 'stats') {
                  icon = 'bar-chart';
                  label = 'Analytics';
                } else if (tab === 'settings') {
                  icon = 'settings';
                  label = 'Settings';
                }

                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      styles.sidebarMenuItem,
                      active && { backgroundColor: 'transparent' }
                    ]}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={22}
                      color={active ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[
                      styles.sidebarMenuItemText,
                      { color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant },
                      active && { fontWeight: '600' }
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.sidebarAddBtn, { backgroundColor: 'rgba(24, 24, 27, 0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }]}
              onPress={() => setIsAddMode(true)}
            >
              <MaterialIcons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Add Entry</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.desktopMain, { backgroundColor: 'transparent' }]}>
            <View style={[styles.mainHeader, { borderBottomColor: colors.outline, backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outline }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.onSurfaceVariant }}>Vault: Encrypted</Text>
                </View>

                {Platform.OS === 'web' && (
                  <TouchableOpacity 
                    onPress={() => setIsCurrencyModalOpen(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outline }}
                  >
                    <Text style={{ fontSize: 14 }}>{getCountryDetails(country).flag}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant }}>
                      {country} {getCountryDetails(country).symbol}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={14} color={colors.onSurfaceVariant} style={{ marginLeft: -2 }} />
                  </TouchableOpacity>
                )}

                <Text style={[styles.mainHeaderTitle, { color: colors.onSurface, marginLeft: 8 }]}>
                  {getHeaderTitle()}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => setIsTourOpen(true)}
                style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outline }]}
                activeOpacity={0.8}
              >
                <MaterialIcons name="explore" size={18} color={colors.onPrimaryContainer} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimaryContainer }}>Take App Tour</Text>
              </TouchableOpacity>
            </View>

            <View style={[{ flex: 1 }, Platform.OS === 'web' && { width: '100%', alignSelf: 'center' }]}>
              {renderActiveScreen()}
            </View>
          </View>

          {isAddMode && (
            <View style={styles.desktopModalOverlay}>
              <View style={[styles.desktopModalContainer, { backgroundColor: colors.surface, borderWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 20 }]}>
                <AddTransactionScreen
                  onBack={handleCloseAddMode}
                  transactionToEdit={editingTransaction}
                />
              </View>
            </View>
          )}

          <GuidedTourModal
            visible={isTourOpen}
            onClose={handleCloseTour}
          />

          <CurrencyPickerModal
            visible={isCurrencyModalOpen}
            onClose={() => setIsCurrencyModalOpen(false)}
            colors={colors}
            selectedCountryCode={country}
            onSelect={(c) => setCountry(c.code)}
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }


  return (
    <LinearGradient colors={colors.backgroundGradient as [string, string]} style={{ flex: 1 }}>
      <SafeAreaView style={safeAreaStyle}>
        <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
        <View style={containerStyle}>
          <View style={styles.viewport}>
            {renderActiveScreen()}
          </View>

          <View style={glassBottomTabStyle}>
            <TouchableOpacity
              onPress={() => setActiveTab('home')}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabPill,
                activeTab === 'home' && { backgroundColor: 'transparent' }
              ]}>
                <MaterialIcons
                  name="dashboard"
                  size={22}
                  color={activeTab === 'home' ? colors.primary : colors.onSurfaceVariant}
                />
              </View>
              <Text style={[
                styles.tabLabelText,
                { color: activeTab === 'home' ? colors.onBackground : colors.onSurfaceVariant },
                activeTab === 'home' && { fontWeight: '600' }
              ]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('transactions')}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabPill,
                activeTab === 'transactions' && { backgroundColor: 'transparent' }
              ]}>
                <MaterialIcons
                  name="receipt"
                  size={22}
                  color={activeTab === 'transactions' ? colors.primary : colors.onSurfaceVariant}
                />
              </View>
              <Text style={[
                styles.tabLabelText,
                { color: activeTab === 'transactions' ? colors.onBackground : colors.onSurfaceVariant },
                activeTab === 'transactions' && { fontWeight: '600' }
              ]}>
                Transaction
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsAddMode(true)}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[styles.centerAddCircle, { backgroundColor: 'rgba(24, 24, 27, 0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }]}>
                <MaterialIcons name="add" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('budgets')}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabPill,
                activeTab === 'budgets' && { backgroundColor: 'transparent' }
              ]}>
                <MaterialIcons
                  name="pie-chart"
                  size={22}
                  color={activeTab === 'budgets' ? colors.primary : colors.onSurfaceVariant}
                />
              </View>
              <Text style={[
                styles.tabLabelText,
                { color: activeTab === 'budgets' ? colors.onBackground : colors.onSurfaceVariant },
                activeTab === 'budgets' && { fontWeight: '600' }
              ]}>
                Budgets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('more')}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabPill,
                ['more', 'stats', 'accounts', 'settings', 'categories'].includes(activeTab) && { backgroundColor: 'transparent' }
              ]}>
                <MaterialIcons
                  name="menu"
                  size={22}
                  color={['more', 'stats', 'accounts', 'settings', 'categories'].includes(activeTab) ? colors.primary : colors.onSurfaceVariant}
                />
              </View>
              <Text style={[
                styles.tabLabelText,
                { color: ['more', 'stats', 'accounts', 'settings', 'categories'].includes(activeTab) ? colors.onBackground : colors.onSurfaceVariant },
                ['more', 'stats', 'accounts', 'settings', 'categories'].includes(activeTab) && { fontWeight: '600' }
              ]}>
                More
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={isAddMode} animationType="fade" transparent={true} onRequestClose={handleCloseAddMode}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '92%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 24 }}>
              <AddTransactionScreen
                onBack={handleCloseAddMode}
                transactionToEdit={editingTransaction}
              />
            </View>
          </View>
        </Modal>

        <GuidedTourModal
          visible={isTourOpen}
          onClose={handleCloseTour}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    width: '100%',
  },
  rootContainer: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      default: {},
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '500',
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  mainHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewport: {
    flex: 1,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    elevation: 24,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
  },
  tabPill: {
    padding: 4,
    alignItems: 'center',
  },
  tabLabelText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  headerAddBtn: {
    padding: 4,
  },
  centerAddCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  fabButton: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 99,
  },
  centerTabButton: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAddPill: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  centerAddText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sidebar: {
    width: 260,
    height: '100%',
    padding: 24,
    borderRightWidth: 1,
    justifyContent: 'space-between',
  },
  sidebarLogo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  sidebarMenu: {
    flex: 1,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  sidebarMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sidebarAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    marginTop: 16,
  },
  sidebarAddText: {
    fontSize: 14,
    fontWeight: '600',
  },
  desktopMain: {
    flex: 1,
    height: '100%',
  },
  addTabBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  desktopModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  desktopModalContainer: {
    width: 480,
    height: 700,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  }
});
