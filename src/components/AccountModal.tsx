import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { Account, AccountType } from '../utils/storage';

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ColorTheme;
  accounts: Account[];
  onSelect: (account: Account) => void;
  onAddAccount: (
    name: string, 
    color: string, 
    icon: string, 
    type: AccountType
  ) => Promise<void>;
  onUpdateAccount?: (account: Account) => Promise<void>;
  onDeleteAccount?: (id: string) => Promise<void>;
  accountToEdit?: Account | null;
}

const AVAILABLE_COLORS = [
  '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', 
  '#E91E63', '#00BCD4', '#FFEB3B', '#F44336'
];

const AVAILABLE_ICONS = [
  'payments', 'credit-card', 'account-balance', 'wallet',
  'savings', 'star', 'attach-money', 'local-atm',
  'trending-up', 'business', 'lock', 'update',
  'directions-car', 'home', 'laptop', 'smartphone',
  'shopping-cart', 'store', 'monetization-on', 'euro'
];

const ACCOUNT_TYPES: { type: AccountType; label: string }[] = [
  { type: 'savings', label: 'Savings' },
  { type: 'credit', label: 'Credit' },
  { type: 'cash', label: 'Cash' },
  { type: 'custom', label: 'Custom' },
];

export const AccountModal: React.FC<AccountModalProps> = ({ 
  visible, 
  onClose, 
  colors, 
  accounts, 
  onSelect,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  accountToEdit
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedType, setSelectedType] = useState<AccountType>('savings');

  useEffect(() => {
    if (accountToEdit) {
      setNewAccName(accountToEdit.name);
      setSelectedColor(accountToEdit.color);
      setSelectedIcon(accountToEdit.icon);
      setSelectedType(accountToEdit.type);
      setShowAddForm(true);
    } else {
      setNewAccName('');
      setSelectedColor(AVAILABLE_COLORS[0]);
      setSelectedIcon(AVAILABLE_ICONS[0]);
      setSelectedType('savings');
      setShowAddForm(false);
    }
  }, [accountToEdit, visible]);

  const handleSave = async () => {
    if (!newAccName.trim()) return;

    if (accountToEdit) {
      await onUpdateAccount?.({
        ...accountToEdit,
        name: newAccName.trim(),
        color: selectedColor,
        icon: selectedIcon,
        type: selectedType,
      });
    } else {
      await onAddAccount(
        newAccName.trim(), 
        selectedColor, 
        selectedIcon, 
        selectedType
      );
    }
    
    setNewAccName('');
    onClose();
  };

  const handleDelete = async () => {
    if (!accountToEdit) return;
    if (accounts.length <= 1) {
      if (Platform.OS === 'web') alert('You must keep at least one account');
      else Alert.alert('Error', 'You must keep at least one account');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${accountToEdit.name}"? Transactions will fallback to your primary active account.`);
      if (confirmed) {
        await onDeleteAccount?.(accountToEdit.id);
        onClose();
      }
    } else {
      Alert.alert(
        'Delete Account',
        `Are you sure you want to delete "${accountToEdit.name}"? Transactions will fallback to another active account.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              await onDeleteAccount?.(accountToEdit.id);
              onClose();
            }
          }
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.dragHandle, { backgroundColor: colors.outline }]} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onBackground }]}>
              {accountToEdit ? 'Edit Account' : (showAddForm ? 'New Account' : 'Select Account')}
            </Text>
            {!accountToEdit && (
              <TouchableOpacity 
                onPress={() => setShowAddForm(!showAddForm)}
                style={[styles.addBtn, { backgroundColor: colors.primaryContainer }]}
              >
                <MaterialIcons 
                  name={showAddForm ? 'list' : 'add'} 
                  size={20} 
                  color={colors.onPrimaryContainer} 
                />
                <Text style={[styles.addBtnText, { color: colors.onPrimaryContainer }]}>
                  {showAddForm ? 'List' : 'Add New'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showAddForm ? (
            <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
              <Text style={[styles.label, { color: colors.onBackground }]}>Account Name</Text>
              <TextInput
                placeholder="e.g. Savings Card, Pocket Cash"
                placeholderTextColor={colors.outline}
                value={newAccName}
                onChangeText={setNewAccName}
                style={[styles.input, { 
                  borderColor: colors.outline, 
                  color: colors.onBackground,
                  backgroundColor: colors.surfaceVariant
                }]}
              />

              <Text style={[styles.label, { color: colors.onBackground }]}>Account Type</Text>
              <View style={styles.badgeContainer}>
                {ACCOUNT_TYPES.map(item => {
                  const isSelected = selectedType === item.type;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      onPress={() => setSelectedType(item.type)}
                      style={[
                        styles.badge,
                        { backgroundColor: isSelected ? colors.primary : colors.surfaceVariant }
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: isSelected ? colors.onPrimary : colors.onSurfaceVariant }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: colors.onBackground }]}>Select Icon</Text>
              <View style={styles.itemGrid}>
                {AVAILABLE_ICONS.map(ico => (
                  <TouchableOpacity
                    key={ico}
                    onPress={() => setSelectedIcon(ico)}
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.surfaceVariant },
                      selectedIcon === ico && { borderColor: colors.primary, borderWidth: 2 }
                    ]}
                  >
                    <MaterialIcons name={ico as any} size={24} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.onBackground }]}>Select Color</Text>
              <View style={styles.itemGrid}>
                {AVAILABLE_COLORS.map(col => (
                  <TouchableOpacity
                    key={col}
                    onPress={() => setSelectedColor(col)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: col },
                      selectedColor === col && { borderColor: colors.onBackground, borderWidth: 3 }
                    ]}
                  />
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 16 }}>
                {accountToEdit && (
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={[styles.deleteBtn, { backgroundColor: colors.error }]}
                  >
                    <Text style={[styles.submitBtnText, { color: colors.onError }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!newAccName.trim()}
                  style={[
                    styles.submitBtn,
                    { 
                      backgroundColor: newAccName.trim() ? colors.primary : colors.surfaceVariant,
                      flex: 1 
                    }
                  ]}
                >
                  <Text style={[
                    styles.submitBtnText,
                    { color: newAccName.trim() ? colors.onPrimary : colors.outline }
                  ]}>
                    {accountToEdit ? 'Save Changes' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <FlatList
              data={accounts}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.accountItem,
                    { borderBottomColor: colors.surfaceVariant }
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.color }]}>
                    <MaterialIcons name={item.icon as any} size={24} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accountName, { color: colors.onBackground }]}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.outline, textTransform: 'uppercase' }}>
                      {item.type}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 100,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
