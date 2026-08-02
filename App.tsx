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
  useWindowDimensions
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

import { Transaction } from './src/utils/storage';

type MainTab = 'home' | 'transactions' | 'budgets' | 'stats' | 'accounts' | 'settings' | 'categories' | 'more' | 'recurring' | 'goals';

function MainAppContent() {
  const { colors, themeType, loading, hasAcceptedTerms, acceptTerms } = useApp();
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isAddMode, setIsAddMode] = useState(false);
  const { width } = useWindowDimensions();

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
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', padding: 24 }]}>
        <View style={{ backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1, borderRadius: 20, padding: 24, gap: 16 }}>
          <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>SpendNova</Text>
          <Text style={{ color: colors.onSurface, fontSize: 22, fontWeight: '700' }}>Before you begin</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 15, lineHeight: 22 }}>
            SpendNova stores financial records on this device. It is a personal tracking tool, not financial, tax, or investment advice. Please review the Terms and Privacy Policy in Settings after continuing.
          </Text>
          <TouchableOpacity
            onPress={() => void acceptTerms()}
            style={{ backgroundColor: colors.primary, alignItems: 'center', borderRadius: 12, paddingVertical: 14 }}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>Accept and continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
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
        return <StatsScreen onEditTransaction={handleEditTransaction} />;
      case 'accounts':
        return <AccountsScreen />;
      case 'settings':
        return <SettingsScreen onNavigate={(t) => setActiveTab(t as any)} />;
      case 'categories':
        return <CategoriesScreen onBack={() => setActiveTab('settings')} />;
      case 'more':
        return <MoreScreen onNavigate={(t) => setActiveTab(t as any)} />;
      case 'recurring':
        return <RecurringScreen />;
      case 'goals':
        return <GoalsScreen />;
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
    Platform.OS === 'web' && { alignItems: 'center', justifyContent: 'center' }
  ] as any;

  const containerStyle = [
    styles.rootContainer,
    { backgroundColor: 'transparent' },
    Platform.OS === 'web' && { borderColor: colors.surfaceVariant }
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
      <LinearGradient colors={colors.backgroundGradient as [string, string]} style={{ flex: 1, flexDirection: 'row' }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent', flexDirection: 'row', flex: 1 }]}>
          <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />


        <View style={glassSidebarStyle}>
          <Text style={[styles.sidebarLogo, { color: colors.primary }]}>SpendNova</Text>

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
                    active && { backgroundColor: colors.primaryContainer }
                  ]}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={icon as any}
                    size={22}
                    color={active ? colors.primary : colors.onSurfaceVariant}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[
                    styles.sidebarMenuItemText,
                    { color: active ? colors.primary : colors.onSurface },
                    active && { fontWeight: '700' }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.sidebarAddBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsAddMode(true)}
          >
            <MaterialIcons name="add" size={20} color={colors.onPrimary} style={{ marginRight: 8 }} />
            <Text style={[styles.sidebarAddText, { color: colors.onPrimary }]}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.desktopMain, { backgroundColor: 'transparent' }]}>
          <View style={[styles.mainHeader, { borderBottomColor: colors.outline, backgroundColor: colors.surface }]}>
            <Text style={[styles.mainHeaderTitle, { color: colors.onSurface }]}>
              {getHeaderTitle()}
            </Text>
          </View>

          <View style={[{ flex: 1 }, Platform.OS === 'web' && { maxWidth: 1350, width: '100%', alignSelf: 'center' }]}>
            {renderActiveScreen()}
          </View>
        </View>

        {isAddMode && (
          <View style={styles.desktopModalOverlay}>
            <View style={[styles.desktopModalContainer, { backgroundColor: colors.background, shadowColor: '#000', borderColor: colors.surfaceVariant }]}>
              <AddTransactionScreen
                onBack={handleCloseAddMode}
                transactionToEdit={editingTransaction}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

  if (isAddMode) {
    return (
      <LinearGradient colors={colors.backgroundGradient as [string, string]} style={{ flex: 1 }}>
        <SafeAreaView style={safeAreaStyle}>
          <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />

          <View style={containerStyle}>
            <AddTransactionScreen
              onBack={handleCloseAddMode}
              transactionToEdit={editingTransaction}
            />
          </View>
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
                activeTab === 'home' && { backgroundColor: colors.primaryContainer }
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
                activeTab === 'home' && { fontWeight: '700' }
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
                activeTab === 'transactions' && { backgroundColor: colors.primaryContainer }
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
                activeTab === 'transactions' && { fontWeight: '700' }
              ]}>
                Transaction
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsAddMode(true)}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[styles.centerAddCircle, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="add" size={24} color={colors.onPrimary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('budgets')}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabPill,
                activeTab === 'budgets' && { backgroundColor: colors.primaryContainer }
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
                activeTab === 'budgets' && { fontWeight: '700' }
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
                ['more', 'stats', 'accounts', 'settings', 'categories'].includes(activeTab) && { backgroundColor: colors.primaryContainer }
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
                ['more', 'stats', 'accounts', 'settings', 'categories'].includes(activeTab) && { fontWeight: '700' }
              ]}>
                More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderLeftWidth: 1,
        borderRightWidth: 1,
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
    fontWeight: '600',
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
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewport: {
    flex: 1,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
  },
  tabPill: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabLabelText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.25,
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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
    fontWeight: '900',
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
    fontWeight: '900',
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
    fontWeight: '700',
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  }
});
