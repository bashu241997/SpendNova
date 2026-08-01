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
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ColorTheme, ACCENT_OPTIONS, AccentTheme } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { exportDataToFile, importDataFromFile, CloudBackup } from '../utils/storage';
import { CategoryModal } from '../components/CategoryModal';
import { parseCashewCsv } from '../utils/csvParser';

export const SettingsScreen: React.FC = () => {
  const { 
    themeType, 
    setThemeType, 
    accentTheme,
    setAccentTheme,
    colors, 
    transactions, 
    accounts, 
    categories, 
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

  } = useApp();

  const [googleUser, setGoogleUser] = useState<{ email: string; name: string } | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [backupNameInput, setBackupNameInput] = useState('My Device');

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'about' | 'contact' | null>(null);

  const handleGoogleSignIn = () => {
    setLoadingGoogle(true);
    setTimeout(() => {
      setGoogleUser({
        email: 'baswanth.papisetty@gmail.com',
        name: 'Baswanth Papisetty',
      });
      setLoadingGoogle(false);
    }, 1500);
  };

  const handleGoogleSignOut = () => {
    setGoogleUser(null);
  };

  const handleExport = async () => {
    const success = await exportDataToFile({ transactions, accounts, categories });
    if (success) {
      alert('Data exported successfully!');
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'Import Backup',
      'This will OVERWRITE your current local data. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          onPress: async () => {
            const imported = await importDataFromFile();
            if (imported) {
              await importBackupData(imported);
              alert('Data imported successfully!');
            }
          }
        }
      ]
    );
  };

  const [isImporting, setIsImporting] = useState(false);

  const handleImportCashew = async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsImporting(false);
        return;
      }
      
      const asset = result.assets[0];
      let fileContent = '';

      if (Platform.OS === 'web') {
        if ((asset as any).file) {
          fileContent = await (asset as any).file.text();
        } else {
          const response = await fetch(asset.uri);
          fileContent = await response.text();
        }
      } else {
        fileContent = await FileSystem.readAsStringAsync(asset.uri);
      }
      
      const parsedData = parseCashewCsv(fileContent);
      setIsImporting(false);

      if (parsedData.transactions.length === 0 && parsedData.accounts.length === 0) {
        Alert.alert('Import Failed', 'No valid Cashew data found in this CSV.');
        return;
      }

      Alert.alert(
        'Cashew Migration',
        `Found ${parsedData.transactions.length} transactions, ${parsedData.accounts.length} accounts, ${parsedData.categories.length} categories. This will safely merge into your current database. Proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Merge', 
            onPress: async () => {
              setIsImporting(true);
              await mergeBackupData({
                transactions: parsedData.transactions,
                accounts: parsedData.accounts,
                categories: parsedData.categories
              });
              setIsImporting(false);
              alert('Cashew data migrated successfully! You can view them in Transactions and Accounts.');
            }
          }
        ]
      );
    } catch (error) {
       setIsImporting(false);
       console.error(error);
       alert('Failed to import Cashew CSV.');
    }
  };

  const handleCloudBackup = async () => {
    if (!backupNameInput.trim()) {
      alert('Please enter a name for this backup');
      return;
    }
    setLoadingGoogle(true);
    setTimeout(async () => {
      await backupToCloud(backupNameInput.trim());
      setLoadingGoogle(false);
      alert('Backup created successfully on Google Drive!');
    }, 1200);
  };

  const handleCloudRestore = (backup: CloudBackup) => {
    Alert.alert(
      'Restore Cloud Backup',
      `Restore data from backup "${backup.device}" created on ${new Date(backup.timestamp).toLocaleString()}? This will replace your local database.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          onPress: async () => {
            setLoadingGoogle(true);
            setTimeout(async () => {
              await restoreBackupFromCloud(backup.id);
              setLoadingGoogle(false);
              alert('Database restored successfully from Google Drive!');
            }, 1500);
          }
        }
      ]
    );
  };

  const handleCloudDelete = (backupId: string) => {
    Alert.alert(
      'Delete Backup',
      'Delete this backup from your Google Drive?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await removeCloudBackup(backupId);
          }
        }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'This will permanently delete all transactions, accounts, and categories, resetting the database to defaults. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Everything', 
          style: 'destructive',
          onPress: async () => {
            await importBackupData({
              transactions: [],
              accounts: [
                { id: 'acc_cash', name: 'Main Cash', icon: 'payments', color: '#4CAF50', type: 'cash' },
                { id: 'acc_savings', name: 'Chase Bank', icon: 'account-balance', color: '#2196F3', type: 'savings' },
                { id: 'acc_credit', name: 'Barclays Card', icon: 'credit-card', color: '#F44336', type: 'credit' }
              ],
              categories: [
                { id: 'cat_salary', name: 'Salary', type: 'income', icon: 'work', color: '#4CAF50' },
                { id: 'cat_allowance', name: 'Allowance', type: 'income', icon: 'card-giftcard', color: '#8BC34A' },
                { id: 'cat_bonus', name: 'Bonus', type: 'income', icon: 'monetization-on', color: '#009688' },
                { id: 'cat_other_inc', name: 'Other (Income)', type: 'income', icon: 'more-horiz', color: '#9E9E9E' },
                { id: 'cat_food', name: 'Food', type: 'expense', icon: 'restaurant', color: '#FF9800' },
                { id: 'cat_social', name: 'Social', type: 'expense', icon: 'groups', color: '#E91E63' },
                { id: 'cat_transport', name: 'Transport', type: 'expense', icon: 'directions-car', color: '#00BCD4' },
                { id: 'cat_culture', name: 'Culture', type: 'expense', icon: 'movie', color: '#3F51B5' },
                { id: 'cat_household', name: 'Household', type: 'expense', icon: 'home', color: '#FFEB3B' },
                { id: 'cat_apparel', name: 'Apparel', type: 'expense', icon: 'checkroom', color: '#9C27B0' },
                { id: 'cat_beauty', name: 'Beauty', type: 'expense', icon: 'face', color: '#F48FB1' },
                { id: 'cat_health', name: 'Health', type: 'expense', icon: 'medical-services', color: '#F44336' },
                { id: 'cat_education', name: 'Education', type: 'expense', icon: 'school', color: '#03A9F4' },
                { id: 'cat_other_exp', name: 'Other (Expense)', type: 'expense', icon: 'more-horiz', color: '#607D8B' }
              ]
            });
            alert('Database reset successfully!');
          }
        }
      ]
    );
  };

  const renderLegalContent = () => {
    switch (legalModalType) {
      case 'terms':
        return (
          <ScrollView style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>Terms & Conditions</Text>
            <Text style={[styles.legalText, { color: colors.onBackground }]}>
              BY INSTALLING, OPENING, OR USING THIS APPLICATION (LedgeIt), YOU AUTOMATICALLY AGREE TO THESE TERMS. IF YOU DO NOT AGREE, YOU MUST IMMEDIATELY UNINSTALL AND DISCONTINUE USE.
              {"\n\n"}
              1. PROPRIETARY OWNERSHIP
              {"\n"}
              All designs, layouts, codebase, architecture, and rights of LedgeIt belong exclusively to Baswanth Papisetty. All rights are reserved.
              {"\n\n"}
              2. AI DEVELOPED SOFTWARE & LIABILITY DISCLAIMER (NO-SUE AGREEMENT)
              {"\n"}
              LedgeIt has been developed with the assistance of paid premium AI services. No user, business, startup, enterprise, or third party can claim ownership, raise plagiarism flags, or sue the developer (Baswanth Papisetty) or the application under any circumstances. By using the app, you waive any right to bring legal action or lawsuits against the developer.
              {"\n\n"}
              3. PRIVACY & DATA SAFETY
              {"\n"}
              LedgeIt is for personal use only. We collect ZERO personal data on any server. All transactions and vaults balances are stored physically on your device's local storage (AsyncStorage). We do not collect, monitor, or sell your financial data. The Google login connection is strictly device-to-Google-Drive direct backup operations, and no third party has control or oversight.
              {"\n\n"}
              4. WIPE DATA
              {"\n"}
              Triggering the "Wipe Local Data" command inside settings will permanently and irreversibly erase all local entries, accounts, and categories from your device storage.
            </Text>
          </ScrollView>
        );
      case 'privacy':
        return (
          <ScrollView style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>Privacy Policy</Text>
            <Text style={[styles.legalText, { color: colors.onBackground }]}>
              Your privacy is our absolute priority.
              {"\n\n"}
              1. Zero Server-Side Collection
              {"\n"}
              We do not run remote data collection servers. All budgeting summaries, transaction notes, and financial balances remain entirely private on your device.
              {"\n\n"}
              2. Google Drive Permissions
              {"\n"}
              When using the Google Drive backup feature, the app connects directly to your own Google account. Backup file transfers are isolated entirely between your device and your personal cloud folder. We never access, retrieve, or transmit your credentials or financial metadata.
              {"\n\n"}
              3. Compliance
              {"\n"}
              This privacy system complies with standard local privacy protection guidelines for launching on Web, Android, and iOS store platforms.
            </Text>
          </ScrollView>
        );
      case 'about':
        return (
          <View style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>About App</Text>
            <Text style={[styles.legalText, { color: colors.onBackground, textAlign: 'center' }]}>
              LedgeIt: Private Net Worth
              {"\n"}
              Version 1.0.0 (Build 1)
              {"\n\n"}
              A beautiful, manual multi-currency expense ledger designed with responsive desktop sidebars, custom calculator numpads, and local backup files.
              {"\n\n"}
              Developed for secure cross-platform budgeting.
            </Text>
          </View>
        );
      case 'contact':
        return (
          <View style={styles.legalScroll}>
            <Text style={[styles.legalTitle, { color: colors.onBackground }]}>Contact & Support</Text>
            <Text style={[styles.legalText, { color: colors.onBackground, textAlign: 'center' }]}>
              Need assistance?
              {"\n\n"}
              For bugs, support requests, or data questions, contact:
              {"\n\n"}
              <Text style={{ fontWeight: '700', color: colors.primary }}>
                papisettybaswanth@gmail.com
              </Text>
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} contentContainerStyle={styles.contentPadding}>
      
      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Google Drive Sync</Text>
        
        {loadingGoogle && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loaderText, { color: colors.outline }]}>Connecting to Drive...</Text>
          </View>
        )}

        {!loadingGoogle && !googleUser && (
          <View style={{ alignItems: 'center', paddingTop: 4 }}>
            <Text style={[styles.googleDesc, { color: colors.outline }]}>
              Backup and sync manual transactions to other devices using your Google Drive space.
            </Text>
            <TouchableOpacity 
              style={[styles.googleBtn, { backgroundColor: colors.primaryContainer }]}
              onPress={handleGoogleSignIn}
            >
              <MaterialIcons name="login" size={18} color={colors.onPrimaryContainer} style={{ marginRight: 8 }} />
              <Text style={[styles.googleBtnText, { color: colors.onPrimaryContainer }]}>
                Link Google Account
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!loadingGoogle && googleUser && (
          <View style={{ width: '100%' }}>
            <View style={styles.userInfoRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{googleUser.name.charAt(0)}</Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={[styles.userName, { color: colors.onSurface }]}>{googleUser.name}</Text>
                <Text style={[styles.userEmail, { color: colors.outline }]} numberOfLines={1}>{googleUser.email}</Text>
              </View>
              <TouchableOpacity onPress={handleGoogleSignOut} style={styles.logoutBtn}>
                <MaterialIcons name="logout" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.backupInputRow}>
              <TextInput
                value={backupNameInput}
                onChangeText={setBackupNameInput}
                placeholder="e.g. Device Name"
                placeholderTextColor={colors.outline}
                style={[styles.backupNameInput, { 
                  borderColor: colors.outline, 
                  color: colors.onSurface,
                  backgroundColor: colors.surfaceVariant
                }]}
              />
              <TouchableOpacity 
                style={[styles.backupActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleCloudBackup}
              >
                <MaterialIcons name="cloud-upload" size={18} color={colors.onPrimary} />
                <Text style={[styles.backupActionText, { color: colors.onPrimary }]}>Sync</Text>
              </TouchableOpacity>
            </View>

            {cloudBackups.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallTitle, { color: colors.onSurface }]}>Available Cloud Backups</Text>
                {cloudBackups.slice(0, 2).map(backup => (
                  <View key={backup.id} style={[styles.backupListItem, { borderBottomColor: colors.surfaceVariant }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.backupItemDevice, { color: colors.onSurface }]} numberOfLines={1}>
                        {backup.device}
                      </Text>
                      <Text style={[styles.backupItemDate, { color: colors.outline }]}>
                        {new Date(backup.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => handleCloudRestore(backup)} style={styles.actionIconBtn}>
                        <MaterialIcons name="cloud-download" size={18} color={colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleCloudDelete(backup.id)} style={[styles.actionIconBtn, { marginLeft: 8 }]}>
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

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Active Currency / Region</Text>
        <Text style={[styles.googleDesc, { color: colors.outline, marginBottom: 12 }]}>
          Choose the cosmetic currency prefix symbol applied to your Vaults, Flow inputs, and Vibe analytics:
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
                  { backgroundColor: colors.surfaceVariant },
                  active && { backgroundColor: colors.primary }
                ]}
              >
                <Text style={[
                  styles.currencyPillSymbol,
                  { color: colors.onSurfaceVariant },
                  active && { color: colors.onPrimary }
                ]}>
                  {symbol}
                </Text>
                <Text style={[
                  styles.currencyPillLabel,
                  { color: colors.outline },
                  active && { color: colors.onPrimary, fontWeight: '700' }
                ]}>
                  {cnt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Theme Accent Palette</Text>
        <Text style={[styles.googleDesc, { color: colors.outline, marginBottom: 12 }]}>
          Select your preferred primary accent color palette:
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {ACCENT_OPTIONS.map((opt) => {
            const active = accentTheme === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setAccentTheme(opt.id)}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: active ? colors.primaryContainer : colors.surfaceVariant,
                    borderWidth: active ? 2 : 0,
                    borderColor: colors.primary,
                  }
                ]}
                activeOpacity={0.8}
              >
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: opt.color, marginRight: 8 }} />
                <Text style={[{ fontSize: 13, fontWeight: active ? '800' : '600', color: active ? colors.onPrimaryContainer : colors.onSurface }]}>
                  {opt.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.bentoRow}>
        <View style={[styles.bentoSquareCard, { backgroundColor: colors.surface }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <MaterialIcons name="dark-mode" size={24} color={colors.primary} />
            <Switch
              value={themeType === 'dark'}
              onValueChange={(val) => setThemeType(val ? 'dark' : 'light')}
              thumbColor={themeType === 'dark' ? colors.primary : colors.outline}
              trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
            />
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.bentoLabel, { color: colors.onSurface }]}>Dark Mode</Text>
            <Text style={[styles.bentoSubLabel, { color: colors.outline }]}>Toggle layout visuals</Text>
          </View>
        </View>

        <View style={[styles.bentoSquareCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="local-offer" size={24} color={colors.primary} style={{ marginBottom: 6 }} />
          <View>
            <Text style={[styles.bentoLabel, { color: colors.onSurface }]}>Categories</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <TouchableOpacity 
                style={[styles.smallPill, { backgroundColor: colors.primaryContainer }]}
                onPress={() => {
                  setCategoryType('expense');
                  setCategoryModalVisible(true);
                }}
              >
                <Text style={[styles.smallPillText, { color: colors.primary }]}>Burn</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.smallPill, { backgroundColor: colors.primaryContainer }]}
                onPress={() => {
                  setCategoryType('income');
                  setCategoryModalVisible(true);
                }}
              >
                <Text style={[styles.smallPillText, { color: colors.primary }]}>Earn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.bentoHeader, { color: colors.primary }]}>Local Storage Ledger</Text>
        <Text style={[styles.googleDesc, { color: colors.outline, marginBottom: 12 }]}>
          Export database logs as local files, or import an existing data file.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
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
        </View>
        <TouchableOpacity 
          style={[styles.flexButton, { backgroundColor: colors.secondaryContainer, marginTop: 8 }]}
          onPress={handleImportCashew}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <MaterialIcons name="move-to-inbox" size={18} color={colors.primary} />
              <Text style={[styles.flexButtonText, { color: colors.primary }]}>Migrate from Cashew (CSV)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.bentoWideCard, { backgroundColor: colors.surface }]}>
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
            <Text style={[styles.bentoSubLabel, { color: colors.outline }]}>Wipe database parameters</Text>
          </View>
          <TouchableOpacity 
            style={[styles.dangerBtn, { backgroundColor: colors.error }]}
            onPress={handleResetData}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>WIPE DATA</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        colors={colors}
        categories={categories}
        type={categoryType}
        onSelect={() => {}}
        onAddCategory={(name, type, color, icon) => addCategory({ name, type, color, icon })}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        manageMode={true}
      />

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
    paddingBottom: 110,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bentoSquareCard: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    minHeight: 130,
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  bentoWideCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  bentoHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  bentoLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  bentoSubLabel: {
    fontSize: 10,
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
    fontSize: 11,
    lineHeight: 16,
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
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
