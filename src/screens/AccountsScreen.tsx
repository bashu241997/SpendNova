import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Account } from '../utils/storage';
import { AccountModal } from '../components/AccountModal';

export const AccountsScreen: React.FC = () => {
  const { 
    accounts, 
    transactions, 
    colors, 
    addAccount, 
    updateAccount,
    deleteAccount,
    currencySymbol
  } = useApp();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const getAccountBalance = (accId: string) => {
    const accTxs = transactions.filter(t => t.account === accId || t.toAccount === accId);
    return accTxs.reduce((sum, t) => {
      if (t.type === 'income' && t.account === accId) return sum + t.amount;
      if (t.type === 'expense' && t.account === accId) return sum - t.amount;
      if (t.type === 'transfer') {
        if (t.account === accId) return sum - t.amount;
        if (t.toAccount === accId) return sum + t.amount;
      }
      return sum;
    }, 0);
  };

  const totalAssets = accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topCardContainer}>
        <View style={[styles.assetsCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.cardTitle, { color: colors.onPrimary, opacity: 0.8 }]}>Stack Assets</Text>
          <Text style={[styles.cardBalance, { color: colors.onPrimary }]}>
            {currencySymbol}{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>My Vaults</Text>
          <TouchableOpacity 
            onPress={() => {
              setEditingAccount(null);
              setAddModalVisible(true);
            }}
            style={[styles.addTextBtn, { backgroundColor: colors.primaryContainer }]}
          >
            <MaterialIcons name="add" size={16} color={colors.onPrimaryContainer} />
            <Text style={[styles.addText, { color: colors.onPrimaryContainer }]}>Create</Text>
          </TouchableOpacity>
        </View>

        {accounts.map(acc => {
          const balance = getAccountBalance(acc.id);

          return (
            <TouchableOpacity 
              key={acc.id} 
              style={[styles.accountCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                setEditingAccount(acc);
                setAddModalVisible(true);
              }}
            >
              <View style={[styles.iconWrapper, { backgroundColor: acc.color }]}>
                <MaterialIcons name={acc.icon as any} size={22} color="#FFF" />
              </View>
              
              <View style={styles.accountInfo}>
                <Text style={[styles.accountName, { color: colors.onBackground }]}>
                  {acc.name}
                </Text>
                <Text style={{ fontSize: 10, color: colors.outline, textTransform: 'uppercase', marginBottom: 2 }}>
                  {acc.type}
                </Text>
                <Text style={[styles.accountBalanceText, { color: balance >= 0 ? colors.onBackground : colors.error }]}>
                  {currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <MaterialIcons name="edit" size={18} color={colors.outline} style={{ padding: 8 }} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <AccountModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditingAccount(null);
        }}
        colors={colors}
        accounts={accounts}
        onSelect={() => {}}
        onAddAccount={(name, color, icon, type) => addAccount({ name, color, icon, type })}
        onUpdateAccount={updateAccount}
        onDeleteAccount={deleteAccount}
        accountToEdit={editingAccount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topCardContainer: {
    padding: 16,
  },
  assetsCard: {
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardBalance: {
    fontSize: 32,
    fontWeight: '800',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountBalanceText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
