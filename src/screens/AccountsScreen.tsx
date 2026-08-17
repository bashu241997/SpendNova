import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Account } from '../utils/storage';
import { AccountModal } from '../components/AccountModal';
import { ParallaxCard } from '../components/ParallaxCard';

interface AccountsScreenProps {
  onBack?: () => void;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({ onBack }) => {
  const { 
    accounts, 
    transactions, 
    colors, 
    addAccount, 
    updateAccount,
    deleteAccount,
    currencySymbol
  } = useApp();

  const { width } = useWindowDimensions();
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

  const getTxCount = (accId: string) => {
    return transactions.filter(t => t.account === accId || t.toAccount === accId).length;
  };

  // 2 columns for web/tablet, 1 for small mobile
  const numColumns = width > 600 ? 2 : 1;
  const cardWidth = width > 600 ? '48%' : '100%';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: Platform.OS === 'ios' ? 24 : 12 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
              <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          )}
          <Text style={[styles.pageTitle, { color: colors.onBackground, marginBottom: 0, marginTop: 0, textAlign: 'left' }]}>Accounts</Text>
        </View>
        
        <View style={[styles.gridContainer, width <= 600 && { flexDirection: 'column' }]}>
          {accounts.map(acc => {
            const balance = getAccountBalance(acc.id);
            const txCount = getTxCount(acc.id);
            return (
              <ParallaxCard 
                key={acc.id} 
                style={[
                  styles.accountCard, 
                  { 
                    backgroundColor: colors.surface, 
                    borderLeftColor: acc.color || colors.primary,
                    width: cardWidth as any 
                  }
                ]}
                onPress={() => {
                  setEditingAccount(acc);
                  setAddModalVisible(true);
                }}
              >
                <View style={styles.cardTopRow}>
                  <Text style={[styles.accountName, { color: colors.onSurface }]}>
                    {acc.name}
                  </Text>
                  <Text style={styles.currencyText}>INR</Text>
                </View>
                
                <View style={styles.cardBottomRow}>
                  <Text style={styles.txCountText}>
                    {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
                  </Text>
                  
                  <View style={styles.balanceContainer}>
                    {balance > 0 && <MaterialIcons name="arrow-drop-up" size={20} color="#4CAF50" style={{ marginRight: -2 }} />}
                    {balance < 0 && <MaterialIcons name="arrow-drop-down" size={20} color="#F44336" style={{ marginRight: -2 }} />}
                    <Text style={[
                      styles.accountBalanceText, 
                      { color: balance === 0 ? colors.onSurface : (balance > 0 ? '#4CAF50' : '#F44336') }
                    ]}>
                      {balance !== 0 && currencySymbol}
                      {balance === 0 ? '₹0' : Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              </ParallaxCard>
            );
          })}

          <TouchableOpacity 
            style={[styles.addCard, { width: cardWidth as any }]}
            onPress={() => {
              setEditingAccount(null);
              setAddModalVisible(true);
            }}
          >
            <MaterialIcons name="add" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 115,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  accountCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 5,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
  },
  currencyText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  txCountText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountBalanceText: {
    fontSize: 20,
    fontWeight: '700',
  },
  addCard: {
    height: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'solid',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  }
});
