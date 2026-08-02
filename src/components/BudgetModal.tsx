import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { Account, Category, Budget } from '../utils/storage';

const BUDGET_COLORS = [
  '#3B82F6', '#10B981', '#14B8A6', '#06B6D4', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
  '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#64748B'
];

interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ColorTheme;
  accounts: Account[];
  categories: Category[];
  budgetToEdit: Budget | null;
  onSave: (budget: Omit<Budget, 'id'>) => Promise<void>;
  onUpdate: (budget: Budget) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currencySymbol: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  visible,
  onClose,
  colors,
  accounts,
  categories,
  budgetToEdit,
  onSave,
  onUpdate,
  onDelete,
  currencySymbol
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [color, setColor] = useState(BUDGET_COLORS[0]);
  const [includedAccounts, setIncludedAccounts] = useState<string[]>([]);
  const [includedCategories, setIncludedCategories] = useState<string[]>([]);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [includedSubcategories, setIncludedSubcategories] = useState<string[]>([]);
  const [selectedCategoryForSubs, setSelectedCategoryForSubs] = useState<string | null>(null);

  useEffect(() => {
    if (budgetToEdit) {
      setName(budgetToEdit.name);
      setAmount(budgetToEdit.amount.toString());
      setColor(budgetToEdit.color);
      setIncludedAccounts(budgetToEdit.includedAccounts || []);
      setIncludedCategories(budgetToEdit.includedCategories || []);
      setExcludedCategories(budgetToEdit.excludedCategories || []);
      setIncludedSubcategories(budgetToEdit.includedSubcategories || []);
    } else {
      setName('');
      setAmount('');
      setColor(BUDGET_COLORS[0]);
      setIncludedAccounts([]);
      setIncludedCategories([]);
      setExcludedCategories([]);
      setIncludedSubcategories([]);
    }
  }, [budgetToEdit, visible]);

  const handleSave = async () => {
    if (!name.trim() || !amount) return;

    const b = {
      name: name.trim(),
      amount: parseFloat(amount),
      color,
      includedAccounts,
      includedCategories,
      excludedCategories,
      includedSubcategories
    };

    if (budgetToEdit) {
      await onUpdate({ ...b, id: budgetToEdit.id });
    } else {
      await onSave(b);
    }
    onClose();
  };

  const toggleAccount = (accId: string) => {
    setIncludedAccounts(prev => 
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
  };

  const toggleCategoryInclude = (catId: string) => {
    setIncludedCategories(prev => {
      if (prev.includes(catId)) {
        setSelectedCategoryForSubs(null);
        return prev.filter(id => id !== catId);
      } else {
        setSelectedCategoryForSubs(catId);
        return [...prev, catId];
      }
    });
    setExcludedCategories(prev => prev.filter(id => id !== catId));
  };

  const toggleCategoryExclude = (catId: string) => {
    setExcludedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
    setIncludedCategories(prev => prev.filter(id => id !== catId));
  };

  const toggleSubcategory = (sub: string) => {
    setIncludedSubcategories(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const activeSubs = selectedCategoryForSubs 
    ? categories.find(c => c.id === selectedCategoryForSubs)?.subcategories || [] 
    : [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          
          <View style={[styles.header, { borderBottomColor: colors.surfaceVariant }]}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.onBackground }]}>
              {budgetToEdit ? 'Edit Budget' : 'New Budget'}
            </Text>
            {budgetToEdit ? (
              <TouchableOpacity onPress={() => { onDelete(budgetToEdit.id); onClose(); }} style={styles.iconBtn}>
                <MaterialIcons name="delete-outline" size={24} color={colors.error} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.label}>Budget Name</Text>
              <TextInput
                style={[styles.input, { color: colors.onSurface, borderBottomColor: colors.surfaceVariant }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Groceries"
                placeholderTextColor={colors.outline}
              />
              <Text style={[styles.label, { marginTop: 16 }]}>Amount</Text>
              <View style={styles.amountRow}>
                <Text style={[styles.currency, { color: colors.onSurface }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.input, { flex: 1, color: colors.onSurface, borderBottomColor: colors.surfaceVariant }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={colors.outline}
                />
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={styles.label}>Set Category Spending Limits (Color)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                {BUDGET_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }, color === c && { borderWidth: 3, borderColor: colors.onSurface }]}
                    onPress={() => setColor(c)}
                  >
                    {color === c && <MaterialIcons name="check" size={16} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={styles.label}>Select Accounts</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                <TouchableOpacity
                  style={[styles.pill, includedAccounts.length === 0 ? { backgroundColor: `${colors.primary}20`, borderColor: colors.primary } : { borderColor: colors.outline }]}
                  onPress={() => setIncludedAccounts([])}
                >
                  <Text style={[styles.pillText, { color: includedAccounts.length === 0 ? colors.primary : colors.outline }]}>All Accounts</Text>
                </TouchableOpacity>
                {accounts.map(acc => {
                  const isSel = includedAccounts.includes(acc.id);
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      style={[styles.pill, isSel ? { backgroundColor: `${acc.color}20`, borderColor: acc.color } : { borderColor: colors.outline }]}
                      onPress={() => toggleAccount(acc.id)}
                    >
                      <Text style={[styles.pillText, { color: isSel ? acc.color : colors.outline }]}>{acc.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={styles.label}>Select Categories to Include</Text>
              <View style={styles.grid}>
                {categories.map(cat => {
                  const isSel = includedCategories.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catSquare, isSel && { backgroundColor: `${cat.color}15` }]}
                      onPress={() => toggleCategoryInclude(cat.id)}
                    >
                      <View style={[styles.catIconWrap, { backgroundColor: isSel ? cat.color : colors.surfaceVariant }]}>
                        <MaterialIcons name={cat.icon as any} size={24} color={isSel ? '#FFF' : colors.onSurfaceVariant} />
                      </View>
                      <Text style={[styles.catText, { color: colors.onSurfaceVariant }, isSel && { color: cat.color, fontWeight: '700' }]} numberOfLines={1}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {activeSubs.length > 0 && (
                <View style={styles.subContainer}>
                  <Text style={styles.subLabel}>Subcategories for {categories.find(c => c.id === selectedCategoryForSubs)?.name}</Text>
                  <View style={styles.subGrid}>
                    {activeSubs.map(subObj => {
                      const isObj = typeof subObj === 'object';
                      const subId = isObj ? (subObj as any).id : subObj;
                      const subName = isObj ? (subObj as any).name : subObj;
                      const isSel = includedSubcategories.includes(subId);
                      return (
                        <TouchableOpacity
                          key={subId}
                          style={[styles.pill, isSel ? { backgroundColor: `${colors.primary}20`, borderColor: colors.primary } : { borderColor: colors.outline }]}
                          onPress={() => toggleSubcategory(subId)}
                        >
                          <Text style={[styles.pillText, { color: isSel ? colors.primary : colors.outline }]}>{subName}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={styles.label}>Exclude Categories</Text>
              <View style={styles.grid}>
                {categories.map(cat => {
                  const isEx = excludedCategories.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={`ex_${cat.id}`}
                      style={[styles.catSquare, { opacity: isEx ? 1 : 0.5 }, isEx && { backgroundColor: `${colors.error}15` }]}
                      onPress={() => toggleCategoryExclude(cat.id)}
                    >
                      <View style={[styles.catIconWrap, { backgroundColor: isEx ? colors.error : colors.surfaceVariant }]}>
                        <MaterialIcons name={cat.icon as any} size={24} color={isEx ? '#FFF' : colors.onSurfaceVariant} />
                      </View>
                      <Text style={[styles.catText, { color: colors.onSurfaceVariant }, isEx && { color: colors.error, fontWeight: '700' }]} numberOfLines={1}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.surfaceVariant }]}>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={[styles.saveText, { color: colors.onPrimary }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  inputCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  colorScroll: {
    flexDirection: 'row',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillScroll: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catSquare: {
    width: 70,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catText: {
    fontSize: 10,
    textAlign: 'center',
  },
  subContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
  }
});
