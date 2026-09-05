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
import { Goal } from '../utils/storage';
import { ParallaxCard } from '../components/ParallaxCard';

interface GoalsScreenProps {
  onBack?: () => void;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ onBack }) => {
  const { goals, colors, currencySymbol, addGoal, updateGoal, deleteGoal, depositToGoal } = useApp();
  const { width } = useWindowDimensions();

  const [modalVisible, setModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('savings');

  const [depositAmount, setDepositAmount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    setTargetDate(future.toISOString().split('T')[0]);
    setColor('#10B981');
    setIcon('savings');
    setModalVisible(true);
  };

  const openEdit = (g: Goal) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(g.targetAmount.toString());
    setCurrentAmount(g.currentAmount.toString());
    setTargetDate(g.targetDate.split('T')[0]);
    setColor(g.color || '#10B981');
    setIcon(g.icon || 'savings');
    setModalVisible(true);
  };

  const openDeposit = (g: Goal) => {
    setSelectedGoalId(g.id);
    setDepositAmount('');
    setDepositModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !targetAmount.trim()) return;
    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount) || 0;
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;

    if (editingGoal) {
      await updateGoal({
        ...editingGoal,
        name: name.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        color,
        icon,
      });
    } else {
      await addGoal({
        name: name.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        color,
        icon,
      });
    }

    setModalVisible(false);
  };

  const handleDepositSubmit = async () => {
    if (!selectedGoalId || !depositAmount.trim()) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    await depositToGoal(selectedGoalId, amt);
    setDepositModalVisible(false);
  };

  const handleDelete = async () => {
    if (editingGoal) {
      await deleteGoal(editingGoal.id);
      setModalVisible(false);
    }
  };

  const totalTargetSum = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedSum = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Savings Goals</Text>
          <Text style={[styles.subTitle, { color: colors.onSurfaceVariant }]}>
            Total Saved: {currencySymbol}{totalSavedSum.toLocaleString('en-IN')} of {currencySymbol}{totalTargetSum.toLocaleString('en-IN')}
          </Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <MaterialIcons name="add" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {goals.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="emoji-events" size={48} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: colors.onBackground }]}>No savings goals created yet</Text>
            <Text style={[styles.emptySubText, { color: colors.onSurfaceVariant }]}>Create goals like "Emergency Fund", "New Car", or "Vacation" to track progress</Text>
          </View>
        ) : (
          <View style={[styles.grid, { flexDirection: width > 700 ? 'row' : 'column', flexWrap: 'wrap', justifyContent: 'space-between' }]}>
            {goals.map(g => {
              const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
              const remaining = Math.max(g.targetAmount - g.currentAmount, 0);
              const cardWidth = width > 700 ? '48%' : '100%';
              return (
                <ParallaxCard key={g.id} style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant, width: cardWidth }]}>
                  <View style={styles.cardTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={[styles.iconCircle, { backgroundColor: `${g.color || colors.primary}20` }]}>
                        <MaterialIcons name={(g.icon || 'savings') as any} size={22} color={g.color || colors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.goalName, { color: colors.onSurface }]} numberOfLines={1}>{g.name}</Text>
                        <Text style={[styles.goalTargetDate, { color: colors.onSurfaceVariant }]}>Target: {g.targetDate.split('T')[0]}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => openEdit(g)} style={{ padding: 4 }}>
                      <MaterialIcons name="more-vert" size={20} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.amountRow}>
                    <Text style={[styles.currentAmt, { color: colors.onSurface }]}>
                      {currencySymbol}{g.currentAmount.toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.targetAmt, { color: colors.onSurfaceVariant }]}>
                      of {currencySymbol}{g.targetAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.progressRow}>
                    <Text style={[styles.progText, { color: colors.onSurfaceVariant }]}>{Math.round(pct)}% Completed</Text>
                    <Text style={[styles.progText, { color: colors.onSurfaceVariant }]}>{currencySymbol}{remaining.toLocaleString('en-IN')} left</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: `${g.color || colors.primary}20` }]}>
                    <View style={[styles.progressFill, { backgroundColor: g.color || colors.primary, width: `${pct}%` }]} />
                  </View>

                  <TouchableOpacity style={[styles.depositBtn, { backgroundColor: `${g.color || colors.primary}15` }]} onPress={() => openDeposit(g)}>
                    <MaterialIcons name="add-circle-outline" size={18} color={g.color || colors.primary} />
                    <Text style={[styles.depositBtnText, { color: g.color || colors.primary }]}>Deposit / Add Savings</Text>
                  </TouchableOpacity>
                </ParallaxCard>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Create / Edit Goal Modal */}
      <Modal visible={modalVisible} animationType={Platform.OS === 'web' ? 'fade' : 'slide'} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }, Platform.OS === 'web' && { width: '100%', maxWidth: 500, alignSelf: 'center' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                {editingGoal ? 'Edit Savings Goal' : 'New Savings Goal'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.onSurface }]}>Goal Name (e.g. Emergency Fund)</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Vacation to Goa"
              placeholderTextColor={colors.outline}
            />

            <Text style={[styles.label, { color: colors.onSurface }]}>Target Amount ({currencySymbol})</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              placeholder="50000"
              placeholderTextColor={colors.outline}
            />

            <Text style={[styles.label, { color: colors.onSurface }]}>Initial Saved Amount ({currencySymbol})</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.outline}
            />

            <Text style={[styles.label, { color: colors.onSurface }]}>Target Completion Date</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="2026-12-31"
              placeholderTextColor={colors.outline}
            />

            <View style={styles.modalActions}>
              {editingGoal && (
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

      {/* Deposit Modal */}
      <Modal visible={depositModalVisible} animationType={Platform.OS === 'web' ? 'fade' : 'slide'} transparent={true} onRequestClose={() => setDepositModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }, Platform.OS === 'web' && { width: '100%', maxWidth: 500, alignSelf: 'center' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Add Savings Deposit</Text>
              <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.onSurface }]}>Deposit Amount</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              placeholder="Amount to add"
              placeholderTextColor={colors.outline}
              autoFocus
            />

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.success, marginTop: 20 }]} onPress={handleDepositSubmit}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Confirm Deposit</Text>
            </TouchableOpacity>
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
    gap: 16,
  },
  goalCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
  },
  cardTop: {
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
  goalName: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalTargetDate: {
    fontSize: 12,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
    marginBottom: 8,
  },
  currentAmt: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 6,
  },
  targetAmt: {
    fontSize: 14,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  depositBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: Platform.OS !== 'web' ? 'flex-end' : 'center',
    alignItems: Platform.OS !== 'web' ? 'stretch' : 'center',
  },
  modalContent: {
    padding: 24,
    elevation: 10,
    ...(Platform.OS !== 'web' ? {
      width: '100%',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    } : {
      borderRadius: 28,
      width: '90%',
      maxWidth: 500,
    }),
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
