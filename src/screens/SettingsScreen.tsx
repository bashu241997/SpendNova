import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ColorTheme, ACCENT_OPTIONS, AccentTheme } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { exportDataToFile, importDataFromFile, exportSampleTemplate, CloudBackup } from '../utils/storage';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

interface SettingsScreenProps {
  onNavigate?: (screen: string) => void;
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onBack }) => {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 768;
  const {
    themeType,
    setThemeType,
    accentTheme,
    setAccentTheme,
    colors,
    transactions,
    accounts,
    categories,
    budgets,
    recurringTxs,
    goals,
    importBackupData,
    mergeBackupData,
    cloudBackups,
    backupToCloud,
    restoreBackupFromCloud,
    removeCloudBackup,
    addCategory,
    updateCategory,
    deleteCategory,
    country,
    setCountry,
    googleToken,
    googleUser,
    setGoogleAuth,
    refreshCloudBackups,
    currencySymbol
  } = useApp();

  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'about' | 'contact' | null>(null);

  const [activeView, setActiveView] = useState<'main' | 'data_sync' | 'legal' | 'danger'>('main');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const googleClientIds = {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  };
  const isGoogleConfigured = Boolean(
    Platform.OS === 'web' ? googleClientIds.webClientId :
      Platform.OS === 'ios' ? googleClientIds.iosClientId : googleClientIds.androidClientId
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    // The hook requires a client ID for the active platform even while the
    // settings UI is disabled. The button remains unavailable until a real
    // value is supplied through EXPO_PUBLIC_GOOGLE_*_CLIENT_ID.
    webClientId: googleClientIds.webClientId || 'disabled.apps.googleusercontent.com',
    iosClientId: googleClientIds.iosClientId || 'disabled.apps.googleusercontent.com',
    androidClientId: googleClientIds.androidClientId || 'disabled.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.file', 'profile', 'email'],
    ...(Platform.OS === 'web' ? {
      redirectUri: typeof window !== 'undefined' ? window.location.origin : 'https://spendnova-ledger.web.app'
    } : {})
  });

  React.useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      const fetchUserInfo = async (token: string) => {
        try {
          const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = await res.json();
          await setGoogleAuth(token, user);
        } catch (e) {
          console.error('Failed to fetch user info', e);
        }
      };
      fetchUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleSignOut = async () => {
    await setGoogleAuth(null, null);
    showAlert('Signed out and cleared Google session successfully.');
  };

  const handleCloudBackup = async () => {
    await backupToCloud();
  };

  const handleCloudRestore = async (backup: any) => {
    await restoreBackupFromCloud(backup.id);
  };

  const handleCloudDelete = async (backupId: string) => {
    await removeCloudBackup(backupId);
  };

  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
  };

  const handleExport = async () => {
    const success = await exportDataToFile({ transactions, accounts, categories, budgets, recurring: recurringTxs, goals });
    if (success) {
      showAlert('Data exported successfully!');
    }
  };

  const handleDownloadTemplate = async () => {
    const success = await exportSampleTemplate();
    if (success) {
      showAlert('Sample CSV template downloaded successfully!');
    }
  };

  const handleImport = async () => {
    const imported = await importDataFromFile();
    if (imported) {
      await importBackupData(imported);
      showAlert('Data imported successfully! Check your dashboard.');
    }
  };



  const performWipeData = async () => {
    setShowWipeConfirm(false);
    await importBackupData({
      transactions: [],
      accounts: [],
      categories: [],
      budgets: [],
      recurring: [],
      goals: [],
    });
    showAlert('Database wiped successfully! All local data cleared.');
  };

  const handleResetData = () => {
    setShowWipeConfirm(true);
  };

  const renderLegalContent = () => {
    switch (legalModalType) {
      case 'terms':
        return (
          <ScrollView style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>Terms of Service (India)</Text>
            <Text style={[styles.legalText, { color: colors.onBackground }]}>
              <Text style={{ fontWeight: '700' }}>1. Electronic Contract & Acceptance</Text>
              {"\n"}
              This document is an electronic record generated pursuant to the Information Technology Act, 2000 and rules thereunder as applicable, including the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. By downloading, accessing, or using SpendNova ("Application"), you ("User") enter into a legally binding contract under the Indian Contract Act, 1872 with the Developer.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>2. Nature of Software & Non-Financial Status</Text>
              {"\n"}
              The Application is an offline, local-first utility designed solely for personal ledger tracking and manual expense recording. The Application is NOT registered with the Securities and Exchange Board of India (SEBI), Reserve Bank of India (RBI), or any other regulatory body in India as a Non-Banking Financial Company (NBFC), financial adviser, or investment broker. Nothing contained herein constitutes financial advice, tax guidance, or banking services under Indian law.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>3. Absolute Disclaimer of Warranties</Text>
              {"\n"}
              The Application is provided strictly on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. To the fullest extent permissible under applicable Indian laws, the Developer disclaims all warranties, express or implied, including accuracy of automated currency conversions, budget statistics, or data durability.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>4. Total Limitation of Liability & Hold Harmless</Text>
              {"\n"}
              To the maximum extent permitted by Section 79 of the Information Technology Act, 2000 and general law:
              {"\n"}
              (a) The Developer, creators, and contributors shall have ZERO legal or financial liability for any direct, indirect, incidental, punitive, special, or consequential damages whatsoever (including data loss, device corruption, financial miscalculations, or business interruption).
              {"\n"}
              (b) You explicitly agree to indemnify, defend, and hold harmless the Developer against any claims, losses, lawsuits, proceedings, or demands brought by you or third parties.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>5. Dispute Resolution & Exclusive Jurisdiction</Text>
              {"\n"}
              Any dispute, controversy, or claim arising out of or relating to this Agreement shall be referred to and finally resolved by binding arbitration under the Indian Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Bengaluru, Karnataka, India. Subject to arbitration, courts in Bengaluru, Karnataka, India shall have exclusive jurisdiction over all legal matters.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>6. Intellectual Property & Anti-Reverse Engineering</Text>
              {"\n"}
              All intellectual property rights, trademarks, design rights, branding, code architecture, and source assets are owned exclusively by the Developer protected under the Copyright Act, 1957 and Trade Marks Act, 1999 of India. You shall not decompile, reverse engineer, disassemble, modify, or create derivative works of this Application.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>7. User Capacity & Competency to Contract</Text>
              {"\n"}
              By using this Application, you represent that you are at least 18 years of age or possess legal capacity to enter into a binding contract pursuant to Section 11 of the Indian Contract Act, 1872.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>8. Force Majeure & Severability</Text>
              {"\n"}
              The Developer shall not be held liable for failure to perform obligations due to acts of God, network outages, server failures, hardware breakdown, or statutory changes. If any provision of these Terms is deemed invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.
            </Text>
          </ScrollView>
        );
      case 'privacy':
        return (
          <ScrollView style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>Privacy Policy (India DPDP Act 2023)</Text>
            <Text style={[styles.legalText, { color: colors.onBackground }]}>
              <Text style={{ fontWeight: '700' }}>1. Local Data Fiduciary Disclosure</Text>
              {"\n"}
              Pursuant to the Digital Personal Data Protection (DPDP) Act, 2023 of India, SpendNova operates as a zero-telemetry, local-first application. You are the Data Principal and the sole controller of your personal data. 100% of your transaction entries, account balances, and budget categories are stored directly on your personal device's local database.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>2. No Central Server Transmission</Text>
              {"\n"}
              We do not operate central database servers, tracking cookies, analytics trackers, or user profiling algorithms. No financial metrics or personal identifiers are collected, transmitted, sold, or shared with third parties or government databases.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>3. Google Drive Cloud Sync Disclosures</Text>
              {"\n"}
              If you choose to enable Google Drive Cloud Backup, OAuth authentication occurs between your device and Google. SpendNova uploads a JSON backup directly to your selected Google Drive account; the app does not use a developer-operated backup server.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>4. Data Erasure & Export Rights</Text>
              {"\n"}
              You can export all records as a JSON backup or permanently erase local app data using the "Wipe Data" button in Settings.
              {"\n\n"}
              <Text style={{ fontWeight: '700' }}>5. Children's Data Protection</Text>
              {"\n"}
              In strict accordance with Section 9 of the DPDP Act 2023, the Application does not track, profile, or process personal data of minors. Minors may use the Application only under direct parental supervision.
            </Text>
          </ScrollView>
        );
      case 'about':
        return (
          <View style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>About App</Text>
            <Text style={[styles.legalText, { color: colors.onBackground, textAlign: 'center' }]}>
              SpendNova : Personal Expense Tracker
              {"\n"}
              Version 1.0.0 (Build 1)
              {"\n\n"}
              A high-performance, local-first multi-currency ledger compliant with Indian data privacy standards. Built for total data sovereignty.
            </Text>
          </View>
        );
      case 'contact':
        return (
          <View style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>Legal & Support Contact</Text>
            <Text style={[styles.legalText, { color: colors.onBackground, textAlign: 'center' }]}>
              Developer & Grievance Officer
              {"\n\n"}
              As required under the IT Intermediary Guidelines 2021:
              {"\n\n"}
              <Text style={{ fontWeight: '700', color: colors.primary }}>
                papisettybaswanth@gmail.com
              </Text>
              {"\n\n"}
              Bengaluru, Karnataka, India
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={[styles.contentPadding, isWideLayout && styles.desktopContent]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: Platform.OS === 'ios' ? 24 : 0 }}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.onBackground }}>Settings</Text>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Google Drive Sync</Text>

        {!isGoogleConfigured ? (
          <View style={styles.loaderBox}>
            <Text style={[styles.loaderText, { color: colors.onSurfaceVariant }]}>Google Drive sync is not configured. Add your OAuth client IDs in the local `.env` file to enable it.</Text>
          </View>
        ) : !request && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loaderText, { color: colors.onSurfaceVariant }]}>Connecting to Drive...</Text>
          </View>
        )}

        {!!request && isGoogleConfigured && !googleUser && (
          <View style={{ alignItems: 'center', paddingTop: 4 }}>
            <Text style={[styles.googleDesc, { color: colors.onSurfaceVariant }]}>
              Backup and sync manual transactions to other devices using your Google Drive space.
            </Text>
            <TouchableOpacity
              style={[styles.googleBtn, { backgroundColor: colors.primaryContainer }]}
              onPress={handleGoogleSignIn}
              disabled={!request}
            >
              <MaterialIcons name="login" size={18} color={colors.onPrimaryContainer} style={{ marginRight: 8 }} />
              <Text style={[styles.googleBtnText, { color: colors.onPrimaryContainer }]}>
                Link Google Account
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!!request && googleUser && (
          <View style={{ width: '100%' }}>
            <View style={styles.userInfoRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{googleUser.name.charAt(0)}</Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={[styles.userName, { color: colors.onSurface }]}>{googleUser.name}</Text>
                <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{googleUser.email}</Text>
              </View>
              <TouchableOpacity onPress={handleGoogleSignOut} style={styles.logoutBtn}>
                <MaterialIcons name="logout" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.backupInputRow}>
              <TouchableOpacity
                style={[styles.backupActionBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={() => backupToCloud()}
              >
                <MaterialIcons name="cloud-upload" size={18} color={colors.onPrimary} />
                <Text style={[styles.backupActionText, { color: colors.onPrimary }]}>Sync</Text>
              </TouchableOpacity>
            </View>

            {cloudBackups.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallTitle, { color: colors.onSurface }]}>Available Cloud Backups</Text>
                {cloudBackups.map(backup => (
                  <View key={backup.id} style={[styles.backupListItem, { borderBottomColor: colors.outline }]}>
                    <View>
                      <Text style={[styles.backupItemDevice, { color: colors.onSurface }]}>{backup.name}</Text>
                      <Text style={[styles.backupItemDate, { color: colors.onSurfaceVariant }]}>
                        {backup.modifiedTime ? new Date(backup.modifiedTime).toLocaleString() : ''}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => restoreBackupFromCloud(backup.id)} style={styles.actionIconBtn}>
                        <MaterialIcons name="cloud-download" size={18} color={colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeCloudBackup(backup.id)} style={[styles.actionIconBtn, { marginLeft: 8 }]}>
                        <MaterialIcons name="delete" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Active Currency / Region</Text>
        <Text style={[styles.googleDesc, { color: colors.onSurfaceVariant, marginBottom: 12 }]}>
          Select the currency symbol displayed throughout the app.
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {(['US', 'IN', 'EU', 'UK'] as const).map((cnt) => {
            const active = country === cnt;
            let symbol = '$';
            let label = 'US Dollars';
            if (cnt === 'IN') { symbol = '₹'; label = 'Rupees'; }
            if (cnt === 'EU') { symbol = '€'; label = 'Euros'; }
            if (cnt === 'UK') { symbol = '£'; label = 'Pound Sterling'; }

            return (
              <TouchableOpacity
                key={cnt}
                onPress={() => setCountry(cnt)}
                style={[
                  styles.currencyPill,
                  { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: 'transparent' },
                  active && { backgroundColor: colors.primaryContainer, borderColor: colors.outline }
                ]}
              >
                <Text style={[
                  styles.currencyPillSymbol,
                  { color: colors.onSurfaceVariant },
                  active && { color: colors.onPrimaryContainer, fontWeight: '800' }
                ]}>
                  {symbol}
                </Text>
                <Text style={[
                  styles.currencyPillLabel,
                  { color: colors.onSurfaceVariant },
                  active && { color: colors.onPrimaryContainer, fontWeight: '800' }
                ]}>
                  {cnt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Theme Palette & Visuals</Text>
        <Text style={[styles.googleDesc, { color: colors.onSurfaceVariant, marginBottom: 12 }]}>
          YouTube Dark & Light Theme styling with vibrant Green for Income and Red for Expenses.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: colors.surfaceVariant }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onSurface }}>YouTube Theme Active</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: `${colors.success}15` }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.success }}>Green Income</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: `${colors.error}15` }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error, marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.error }}>Red Expense</Text>
          </View>
        </View>
      </View>

      <View style={styles.bentoRow}>
        <View style={[styles.bentoSquareCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <MaterialIcons name="dark-mode" size={24} color={colors.primary} />
            <Switch
              value={themeType === 'dark'}
              onValueChange={(val) => setThemeType(val ? 'dark' : 'light')}
              thumbColor={themeType === 'dark' ? colors.primary : colors.onSurfaceVariant}
              trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
            />
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.bentoLabel, { color: colors.onSurface }]}>Dark Mode</Text>
            <Text style={[styles.bentoSubLabel, { color: colors.onSurfaceVariant }]}>Use a darker interface</Text>
          </View>
        </View>

        <View style={[styles.bentoSquareCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
            <MaterialIcons name="category" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.bentoLabel, { color: colors.onSurface }]}>Categories</Text>
          <TouchableOpacity
            style={[styles.smallPill, { backgroundColor: colors.primaryContainer, marginTop: 8 }]}
            onPress={() => onNavigate?.('categories')}
          >
            <Text style={[styles.smallPillText, { color: colors.primary }]}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Local Storage Ledger</Text>
        <Text style={[styles.googleDesc, { color: colors.onSurfaceVariant, marginBottom: 12 }]}>
          Export every SpendNova record as a CSV/JSON backup, download sample templates for data importing, or restore backups.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <TouchableOpacity
            style={[styles.flexButton, { backgroundColor: colors.primaryContainer }]}
            onPress={handleExport}
          >
            <MaterialIcons name="file-upload" size={18} color={colors.primary} />
            <Text style={[styles.flexButtonText, { color: colors.primary }]}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flexButton, { backgroundColor: colors.primaryContainer }]}
            onPress={handleImport}
          >
            <MaterialIcons name="file-download" size={18} color={colors.primary} />
            <Text style={[styles.flexButtonText, { color: colors.primary }]}>Import Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flexButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={handleDownloadTemplate}
          >
            <MaterialIcons name="download-for-offline" size={18} color={colors.onSurface} />
            <Text style={[styles.flexButtonText, { color: colors.onSurface }]}>CSV Template</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: colors.outline }}>
          <MaterialIcons name="security" size={16} color={colors.success} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>
            {Platform.OS === 'web' ? 'Web Crypto AES-256 Encrypted Local Storage Active' : 'Secure Hardware Encrypted Storage Active'}
          </Text>
        </View>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Legals & Legal Disclosures</Text>
        <View style={styles.badgeGrid}>
          <TouchableOpacity style={[styles.legalBadge, { backgroundColor: colors.surfaceVariant }]} onPress={() => setLegalModalType('terms')}>
            <Text style={[styles.legalBadgeText, { color: colors.onSurface }]}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.legalBadge, { backgroundColor: colors.surfaceVariant }]} onPress={() => setLegalModalType('privacy')}>
            <Text style={[styles.legalBadgeText, { color: colors.onSurface }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.legalBadge, { backgroundColor: colors.surfaceVariant }]} onPress={() => setLegalModalType('about')}>
            <Text style={[styles.legalBadgeText, { color: colors.onSurface }]}>About App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.legalBadge, { backgroundColor: colors.surfaceVariant }]} onPress={() => setLegalModalType('contact')}>
            <Text style={[styles.legalBadgeText, { color: colors.onSurface }]}>Support Channel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface, borderColor: colors.error, borderWidth: 0.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.bentoLabel, { color: colors.error }]}>Dangerous Actions</Text>
            <Text style={[styles.bentoSubLabel, { color: colors.onSurfaceVariant }]}>Permanently erase all local financial data</Text>
          </View>
          <TouchableOpacity
            style={[styles.dangerBtn, { backgroundColor: colors.error }]}
            onPress={handleResetData}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>WIPE DATA</Text>
          </TouchableOpacity>
        </View>
      </View>



      <Modal
        visible={legalModalType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLegalModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setLegalModalType(null)} style={styles.modalCloseBtn}>
                <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
              </TouchableOpacity>
              <Text style={[styles.modalHeaderTitle, { color: colors.onBackground }]}>Legal Document</Text>
              <View style={{ width: 24 }} />
            </View>

            {renderLegalContent()}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWipeConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWipeConfirm(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.outline }}>
            <MaterialIcons name="warning" size={44} color={colors.error} style={{ alignSelf: 'center', marginBottom: 14 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.onSurface, textAlign: 'center', marginBottom: 8 }}>
              Wipe All Local Data?
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 20, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }}>
              This action will permanently erase every transaction, account, category, budget, recurring payment, and savings goal. This action cannot be undone.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: colors.surfaceVariant, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={() => setShowWipeConfirm(false)}
              >
                <Text style={{ color: colors.onSurface, fontWeight: '700', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: colors.error, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={performWipeData}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Wipe Everything</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!alertMessage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAlertMessage('')}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: 20, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }}>
            <MaterialIcons name="info-outline" size={40} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.onSurface, textAlign: 'center', marginBottom: 24 }}>
              {alertMessage}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              onPress={() => setAlertMessage('')}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 16 }}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  container: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
    paddingBottom: 110,
  },
  desktopContent: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingTop: 28,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bentoSquareCard: {
    flex: 1,
    borderRadius: 18,
    padding: 20,
    minHeight: 112,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  bentoWideCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  bentoHeader: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  bentoLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  bentoSubLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  smallPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  flexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 14,
    gap: 6,
  },
  flexButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  legalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  legalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dangerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  googleDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
    width: '100%',
  },
  googleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loaderBox: {
    paddingVertical: 2,
    alignItems: 'flex-start',
  },
  loaderText: {
    fontSize: 13,
    marginTop: 0,
    fontWeight: '500',
    lineHeight: 19,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userMeta: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 11,
  },
  logoutBtn: {
    padding: 6,
  },
  backupInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  backupNameInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  backupActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  backupActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  smallTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  backupListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  backupItemDevice: {
    fontSize: 12,
    fontWeight: '600',
  },
  backupItemDate: {
    fontSize: 10,
    marginTop: 1,
  },
  actionIconBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  legalScroll: {
    padding: 24,
    flex: 1,
  },
  legalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 22,
  },
  currencyPill: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 6,
  },
  currencyPillSymbol: {
    fontSize: 16,
    fontWeight: '900',
  },
  currencyPillLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  wallpaperPill: {
    flex: 1,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
});
