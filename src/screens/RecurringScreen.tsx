import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  useWindowDimensions,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RecurringTransaction } from '../utils/storage';

interface RecurringScreenProps {
  onBack?: () => void;
}

export const RecurringScreen: React.FC<RecurringScreenProps> = ({ onBack }) => {
  const { recurringTxs, accounts, categories, colors, currencySymbol, addRecurring, updateRecurring, deleteRecurring } = useApp();
  const { width } = useWindowDimensions();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [account, setAccount] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [icon, setIcon] = useState('repeat');

  const openAdd = () => {
    setEditingItem(null);
    setName('');
    setAmount('');
    setFrequency('monthly');
    const today = new Date();
    setNextDueDate(today.toISOString().split('T')[0]);
    setAccount(accounts[0]?.id || '');
    setCategory(categories[0]?.id || '');
    setColor('#6366F1');
    setIcon('repeat');
    setModalVisible(true);
  };

  const openEdit = (item: RecurringTransaction) => {
    setEditingItem(item);
    setName(item.name);
    setAmount(item.amount.toString());
    setFrequency(item.frequency);
    setNextDueDate(item.nextDueDate.split('T')[0]);
    setAccount(item.account);
    setCategory(item.category);
    setColor(item.color || '#6366F1');
    setIcon(item.icon || 'repeat');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !amount.trim()) return;
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    if (editingItem) {
      await updateRecurring({
        ...editingItem,
        name: name.trim(),
        amount: parsedAmt,
        frequency,
        nextDueDate,
        account: account || accounts[0]?.id || '',
        category: category || categories[0]?.id || '',
        color,
        icon,
      });
    } else {
      await addRecurring({
        name: name.trim(),
        amount: parsedAmt,
        type: 'expense',
        frequency,
        nextDueDate,
        account: account || accounts[0]?.id || '',
        category: category || categories[0]?.id || '',
        color,
        icon,
      });
    }

    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (editingItem) {
      await deleteRecurring(editingItem.id);
      setModalVisible(false);
    }
  };

  // Calculate total monthly commitment
  const totalMonthlyCommitment = recurringTxs.reduce((sum, item) => {
    if (item.frequency === 'monthly') return sum + item.amount;
    if (item.frequency === 'yearly') return sum + (item.amount / 12);
    if (item.frequency === 'weekly') return sum + (item.amount * 4.33);
    return sum + item.amount;
  }, 0);

  const getDueDateStatus = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Overdue', color: colors.error };
    if (diffDays <= 3) return { label: `Due in ${diffDays}d`, color: '#F59E0B' };
    return { label: `Due on ${due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, color: colors.onSurfaceVariant };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Subscriptions & EMIs</Text>
          <Text style={[styles.subTitle, { color: colors.onSurfaceVariant }]}>
            Monthly Commitment: {currencySymbol}{Math.round(totalMonthlyCommitment).toLocaleString('en-IN')}/mo
          </Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <MaterialIcons name="add" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {recurringTxs.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="event-repeat" size={48} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: colors.onBackground }]}>No recurring subscriptions or EMIs set up yet</Text>
            <Text style={[styles.emptySubText, { color: colors.onSurfaceVariant }]}>Tap + to track your monthly bills, Netflix, Rent, or Car Loan EMI</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {recurringTxs.map(item => {
              const status = getDueDateStatus(item.nextDueDate);
              const catObj = categories.find(c => c.id === item.category || c.name === item.category);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}
                  onPress={() => openEdit(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={[styles.iconCircle, { backgroundColor: `${item.color || colors.primary}20` }]}>
                        <MaterialIcons name={(item.icon || catObj?.icon || 'repeat') as any} size={22} color={item.color || colors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.itemName, { color: colors.onSurface }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.itemFreq, { color: colors.onSurfaceVariant }]}>{item.frequency.toUpperCase()} • {catObj?.name || 'Bill'}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.itemAmount, { color: colors.onSurface }]}>
                      {currencySymbol}{item.amount.toLocaleString('en-IN')}
                    </Text>
                    <MaterialIcons name="edit" size={18} color={colors.outline} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }, Platform.OS === 'web' && { width: '100%', maxWidth: 500, alignSelf: 'center' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                {editingItem ? 'Edit Recurring Payment' : 'New Subscription / EMI'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.onSurface }]}>Title (e.g. Netflix / Rent / Home EMI)</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={name}
              onChangeText={setName}
              placeholder="Title"
              placeholderTextColor={colors.outline}
            />

            <Text style={[styles.label, { color: colors.onSurface }]}>Amount</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor={colors.outline}
            />

            <Text style={[styles.label, { color: colors.onSurface }]}>Next Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={nextDueDate}
              onChangeText={setNextDueDate}
              placeholder="2026-08-10"
              placeholderTextColor={colors.outline}
            />

            <View style={styles.freqRow}>
              {(['monthly', 'yearly', 'weekly'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.freqPill, { backgroundColor: frequency === f ? colors.primary : colors.background }]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={[styles.freqText, { color: frequency === f ? colors.onPrimary : colors.onSurface }]}>
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              {editingItem && (
                <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: colors.error }]} onPress={handleDelete}>
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 50,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 115,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  grid: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemFreq: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  itemAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  freqPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  freqText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
});
