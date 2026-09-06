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
import { Account, getAccountBalance, getTotalNetWorth } from '../utils/storage';
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

  const getAccountStats = (acc: Account) => {
    const accId = acc.id;
    const initial = acc.initialBalance || 0;
    let incomeTotal = 0;
    let expenseTotal = 0;
    let transferOutTotal = 0;
    let transferInTotal = 0;
    let txCount = 0;

    transactions.forEach(t => {
      if (t.account === accId || t.account === acc.name) {
        txCount++;
        if (t.type === 'income') incomeTotal += t.amount;
        if (t.type === 'expense') expenseTotal += t.amount;
        if (t.type === 'transfer') transferOutTotal += t.amount;
      }
      if (t.type === 'transfer' && (t.toAccount === accId || t.toAccount === acc.name)) {
        txCount++;
        transferInTotal += t.amount;
      }
    });

    const netBalance = initial + incomeTotal - expenseTotal - transferOutTotal + transferInTotal;
    return {
      initial,
      incomeTotal,
      expenseTotal,
      transferOutTotal,
      transferInTotal,
      netBalance,
      txCount
    };
  };

  const totalCombinedBalance = React.useMemo(() => {
    return getTotalNetWorth(accounts, transactions);
  }, [accounts, transactions]);

  // 2 columns for web/tablet, 1 for small mobile
  const numColumns = width > 600 ? 2 : 1;
  const cardWidth = width > 600 ? '48%' : '100%';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: Platform.OS === 'ios' ? 24 : 12 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
              <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          )}
          <Text style={[styles.pageTitle, { color: colors.onBackground, marginBottom: 0, marginTop: 0, textAlign: 'left' }]}>Accounts</Text>
        </View>

        {/* TOTAL COMBINED NET WORTH BANNER */}
        <View style={{
          backgroundColor: colors.surface,
          padding: 20,
          borderRadius: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Total Money Available
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.onBackground }}>
              {currencySymbol}{totalCombinedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name="account-balance" size={26} color={colors.primary} />
          </View>
        </View>

        <View style={[styles.gridContainer, width <= 600 && { flexDirection: 'column' }]}>
          {accounts.map(acc => {
            const stats = getAccountStats(acc);
            const balance = stats.netBalance;
            const txCount = stats.txCount;
            return (
              <ParallaxCard 
                key={acc.id} 
                style={[
                  styles.accountCard, 
                  { 
                    backgroundColor: colors.surface, 
                    borderLeftColor: acc.color || colors.primary,
                    borderLeftWidth: 4,
                    width: cardWidth as any 
                  }
                ]}
                onPress={() => {
                  setEditingAccount(acc);
                  setAddModalVisible(true);
                }}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons name={(acc.icon || 'account-balance') as any} size={20} color={acc.color || colors.primary} />
                    <Text style={[styles.accountName, { color: colors.onSurface }]}>
                      {acc.name}
                    </Text>
                  </View>
                  <Text style={[styles.currencyText, { backgroundColor: colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, textTransform: 'uppercase' }]}>
                    {acc.type}
                  </Text>
                </View>

                <View style={{ marginVertical: 10 }}>
                  <Text style={{ fontSize: 11, color: colors.onSurfaceVariant, fontWeight: '600', marginBottom: 2 }}>Current Balance</Text>
                  <Text style={[
                    styles.accountBalanceText, 
                    { color: balance === 0 ? colors.onSurface : (balance > 0 ? colors.success : colors.error) }
                  ]}>
                    {currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                
                {/* FLOW BREAKDOWN ROW */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surfaceVariant, padding: 8, borderRadius: 12, marginVertical: 6 }}>
                  <View>
                    <Text style={{ fontSize: 10, color: colors.onSurfaceVariant, fontWeight: '600' }}>CREDITED (INCOME)</Text>
                    <Text style={{ fontSize: 12, color: colors.success, fontWeight: '700' }}>
                      +{currencySymbol}{stats.incomeTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: colors.outline, opacity: 0.3 }} />
                  <View>
                    <Text style={{ fontSize: 10, color: colors.onSurfaceVariant, fontWeight: '600' }}>REDUCTION (SPENT)</Text>
                    <Text style={{ fontSize: 12, color: colors.error, fontWeight: '700' }}>
                      -{currencySymbol}{stats.expenseTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.txCountText}>
                    {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
                  </Text>
                  {stats.initial > 0 && (
                    <Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>
                      Start: {currencySymbol}{stats.initial.toLocaleString()}
                    </Text>
                  )}
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
        onAddAccount={(name, color, icon, type, initialBalance) => addAccount({ name, color, icon, type, initialBalance })}
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
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
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
