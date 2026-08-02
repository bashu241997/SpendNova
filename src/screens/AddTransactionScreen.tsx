import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Account, Category, Transaction } from '../utils/storage';
import { Numpad } from '../components/Numpad';
import { AccountModal } from '../components/AccountModal';
import { CategoryPickerModal } from '../components/CategoryPickerModal';
import { CalendarView } from '../components/CalendarView';

interface AddTransactionScreenProps {
  onBack: () => void;
  transactionToEdit?: Transaction;
}

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ 
  onBack,
  transactionToEdit 
}) => {
  const { 
    colors, 
    accounts, 
    categories, 
    transactions,
    addTransaction, 
    updateTransaction,
    deleteTransaction,
    addAccount,
    addCategory,
    currencySymbol
  } = useApp();

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>(
    transactionToEdit?.type || 'expense'
  );
  
  const [date, setDate] = useState(
    transactionToEdit?.date || new Date().toISOString().split('T')[0]
  );
  
  const [amountStr, setAmountStr] = useState(
    transactionToEdit?.amount ? transactionToEdit.amount.toString() : '0'
  );
  
  const [account, setAccount] = useState<Account | undefined>(() => {
    if (transactionToEdit) {
      return accounts.find(a => a.id === transactionToEdit.account || a.name === transactionToEdit.account) || accounts[0];
    }
    return accounts[0];
  });

  const [toAccount, setToAccount] = useState<Account | undefined>(() => {
    if (transactionToEdit?.toAccount) {
      return accounts.find(a => a.id === transactionToEdit.toAccount || a.name === transactionToEdit.toAccount) || accounts[1];
    }
    return accounts[1] || accounts[0];
  });

  const [category, setCategory] = useState<Category | undefined>(() => {
    if (transactionToEdit) {
      return categories.find(c => c.id === transactionToEdit.category || c.name === transactionToEdit.category) || categories[0];
    }
    return categories.find(c => c.type === 'expense') || categories[0];
  });

  // Auto-sync when accounts or categories finish loading from AsyncStorage
  React.useEffect(() => {
    if (!account && accounts.length > 0) {
      setAccount(accounts[0]);
    }
    if (!toAccount && accounts.length > 0) {
      setToAccount(accounts[1] || accounts[0]);
    }
    if (!category && categories.length > 0) {
      setCategory(categories.find(c => c.type === (type === 'transfer' ? 'expense' : type)) || categories[0]);
    }
  }, [accounts, categories]);

  const [subcategory, setSubcategory] = useState<string>(transactionToEdit?.subcategory || '');
  const [description, setDescription] = useState(transactionToEdit?.description || '');
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [toAccountModalVisible, setToAccountModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const activeAccount = account || accounts[0] || { id: 'acc_def', name: 'Cash', color: colors.primary, icon: 'account-balance-wallet', type: 'cash' };
  const activeToAccount = toAccount || accounts[1] || accounts[0] || { id: 'acc_def2', name: 'Bank', color: colors.secondary, icon: 'account-balance', type: 'savings' };
  const activeCategory = category || categories[0] || { id: 'cat_def', name: 'General', color: colors.primary, icon: 'label', type: 'expense' };

  const handleNumpadDone = async (finalAmount: number) => {
    if (finalAmount <= 0) {
      alert('Please enter an amount greater than 0');
      return;
    }

    const txData = {
      date,
      amount: finalAmount,
      type,
      account: activeAccount.id,
      toAccount: type === 'transfer' ? activeToAccount.id : undefined,
      category: type === 'transfer' ? 'Transfer' : activeCategory.id,
      description,
    };

    if (transactionToEdit) {
      await updateTransaction({
        ...transactionToEdit,
        ...txData,
      });
    } else {
      await addTransaction(txData);
    }

    onBack();
  };

  const handleDelete = () => {
    if (!transactionToEdit) return;
    deleteTransaction(transactionToEdit.id);
    onBack();
  };

  const handleDateChange = (daysOffset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + daysOffset);
    setDate(d.toISOString().split('T')[0]);
  };

  const dynamicColor = type === 'expense' ? colors.error : type === 'income' ? colors.success : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          {transactionToEdit ? 'Edit Transaction' : 'New Transaction'}
        </Text>
        {transactionToEdit ? (
          <TouchableOpacity onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant }]}>
          {(['expense', 'income', 'transfer'] as const).map(tab => {
            const active = type === tab;
            let tabBg = 'transparent';
            let tabText = colors.onSurfaceVariant;
            if (active) {
              if (tab === 'expense') {
                tabBg = colors.error;
                tabText = colors.onError;
              } else if (tab === 'income') {
                tabBg = colors.success;
                tabText = colors.onSuccess;
              } else {
                tabBg = colors.primary;
                tabText = colors.onPrimary;
              }
            }

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => {
                  setType(tab);
                  if (tab !== 'transfer') {
                    const matchedCat = categories.find(c => c.type === tab);
                    if (matchedCat) setCategory(matchedCat);
                  }
                }}
                style={[styles.tabItem, active && { backgroundColor: tabBg }]}
              >
                <Text style={[styles.tabLabel, { color: tabText }]}>
                  {tab === 'expense' ? 'EXPENSE' : tab === 'income' ? 'INCOME' : 'TRANSFER'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.amountContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.amountLabel, { color: colors.outline }]}>AMOUNT</Text>
          <View style={styles.amountValueWrapper}>
            <Text style={[styles.currencySign, { color: dynamicColor }]}>{currencySymbol}</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="numeric"
                style={[
                  styles.amountValueText, 
                  { 
                    color: dynamicColor, 
                    minWidth: 160, 
                    borderBottomWidth: 1.5, 
                    borderBottomColor: dynamicColor,
                    textAlign: 'center' 
                  }
                ]}
              />
            ) : (
              <Text 
                numberOfLines={1} 
                adjustsFontSizeToFit 
                style={[styles.amountValueText, { color: dynamicColor }]}
              >
                {amountStr}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.formRow}>
          <MaterialIcons name="event" size={24} color={colors.outline} style={styles.fieldIcon} />
          <View style={styles.dateSelector}>
            <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.dateArrow}>
              <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowCalendarModal(true)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}
            >
              <Text style={[styles.dateText, { color: colors.onBackground, textDecorationLine: 'underline' }]}>{date}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.dateArrow}>
              <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formRow}>
          <MaterialIcons name="account-balance-wallet" size={24} color={colors.outline} style={styles.fieldIcon} />
          <View style={styles.pickerWrapper}>
            <TouchableOpacity 
              onPress={() => setAccountModalVisible(true)} 
              style={[styles.pickerButton, { backgroundColor: colors.surfaceVariant }]}
            >
              <View style={[styles.selectedIndicator, { backgroundColor: activeAccount.color }]} />
              <Text style={[styles.pickerText, { color: colors.onSurfaceVariant }]}>
                {activeAccount.name}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            
            {type === 'transfer' && (
              <>
                <MaterialIcons name="trending-flat" size={24} color={colors.primary} style={{ marginHorizontal: 8 }} />
                <TouchableOpacity 
                  onPress={() => setToAccountModalVisible(true)} 
                  style={[styles.pickerButton, { backgroundColor: colors.surfaceVariant, flex: 1 }]}
                >
                  <View style={[styles.selectedIndicator, { backgroundColor: activeToAccount.color }]} />
                  <Text style={[styles.pickerText, { color: colors.onSurfaceVariant }]}>
                    {activeToAccount.name}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {type !== 'transfer' && (
          <View style={styles.formRow}>
            <MaterialIcons name="category" size={24} color={colors.outline} style={styles.fieldIcon} />
            <TouchableOpacity 
              onPress={() => setCategoryModalVisible(true)} 
              style={[styles.pickerButton, { backgroundColor: colors.surfaceVariant }]}
            >
              <View style={[styles.selectedIndicator, { backgroundColor: activeCategory.color }]} />
              <Text style={[styles.pickerText, { color: colors.onSurfaceVariant }]}>
                {activeCategory.name}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formRow}>
          <MaterialIcons name="description" size={24} color={colors.outline} style={styles.fieldIcon} />
          <TextInput
            placeholder="Description / Note"
            placeholderTextColor={colors.outline}
            value={description}
            onChangeText={setDescription}
            style={[styles.descriptionInput, { 
              color: colors.onBackground,
              borderColor: colors.surfaceVariant,
              backgroundColor: colors.surfaceVariant
            }]}
          />
        </View>

        {Platform.OS === 'web' && (
          <TouchableOpacity
            style={[styles.saveButtonWeb, { backgroundColor: colors.primary }]}
            onPress={() => {
              const numericVal = parseFloat(amountStr) || 0;
              handleNumpadDone(numericVal);
            }}
          >
            <Text style={[styles.saveButtonTextWeb, { color: colors.onPrimary }]}>
              Save Drop
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {Platform.OS !== 'web' && (
        <Numpad
          colors={colors}
          initialValue={amountStr}
          onValueChange={setAmountStr}
          onDone={handleNumpadDone}
        />
      )}

      <AccountModal
        visible={accountModalVisible}
        onClose={() => setAccountModalVisible(false)}
        colors={colors}
        accounts={accounts}
        onSelect={setAccount}
        onAddAccount={async (name, color, icon, type) => {
          await addAccount({ name, color, icon, type });
        }}
      />

      <AccountModal
        visible={toAccountModalVisible}
        onClose={() => setToAccountModalVisible(false)}
        colors={colors}
        accounts={accounts}
        onSelect={setToAccount}
        onAddAccount={async (name, color, icon, type) => {
          await addAccount({ name, color, icon, type });
        }}
      />

      <CategoryPickerModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        colors={colors}
        categories={categories}
        type={type === 'transfer' ? 'expense' : type}
        onSelect={(cat, sub) => {
          setCategory(cat);
          if (sub) {
            setSubcategory(sub);
          } else {
            setSubcategory('');
          }
        }}
      />

      <Modal 
        visible={showCalendarModal} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.surfaceVariant }]}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)} style={{ padding: 4 }}>
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <CalendarView
              transactions={transactions}
              colors={colors}
              selectedDate={date}
              onSelectDate={(newDate) => {
                setDate(newDate);
                setShowCalendarModal(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldIcon: {
    marginRight: 16,
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  dateArrow: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  selectedIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  descriptionInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  amountContainer: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountValueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySign: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 8,
  },
  amountValueText: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
  },
  saveButtonWeb: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonTextWeb: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});
