import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Category, SubCategory } from '../utils/storage';

interface CategoriesScreenProps {
  onBack: () => void;
}

const AVAILABLE_COLORS = [
  '#10B981', '#F59E0B', '#3B82F6', '#06B6D4',
  '#EC4899', '#8B5CF6', '#F43F5E', '#14B8A6',
  '#6366F1', '#EAB308', '#84CC16', '#A855F7',
  '#FF6B00', '#64748B'
];

const AVAILABLE_ICONS = [
  'restaurant', 'fastfood', 'local-cafe', 'local-bar', 
  'shopping-cart', 'shopping-bag', 'storefront', 'checkroom', 
  'directions-car', 'local-gas-station', 'flight', 'directions-bus', 
  'movie', 'sports-esports', 'headset', 'auto-awesome', 
  'home', 'electrical-services', 'wifi', 'phone-android', 
  'face', 'spa', 'medical-services', 'fitness-center', 
  'school', 'work', 'card-giftcard', 'monetization-on', 
  'pets', 'build', 'child-care', 'subscriptions', 
  'savings', 'shield', 'more-horiz'
];

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onBack }) => {
  const { colors, categories, addCategory, updateCategory, deleteCategory, transactions } = useApp();

  const [addCatVisible, setAddCatVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);

  // Subcategory prompt state
  const [addSubCatVisible, setAddSubCatVisible] = useState(false);
  const [targetCatId, setTargetCatId] = useState<string | null>(null);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [selectedSubColor, setSelectedSubColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedSubIcon, setSelectedSubIcon] = useState(AVAILABLE_ICONS[0]);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const normalizeSub = (sub: any, parentCat?: Category): SubCategory => {
    if (typeof sub === 'object' && sub !== null && sub.name) {
      return {
        id: sub.id || 'sub_' + Math.random().toString(36).substr(2, 9),
        name: sub.name,
        color: sub.color || parentCat?.color || '#64748B',
        icon: sub.icon || parentCat?.icon || 'label',
      };
    }
    const nameStr = String(sub || '');
    return {
      id: 'sub_' + nameStr.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: nameStr,
      color: parentCat?.color || '#64748B',
      icon: parentCat?.icon || 'label',
    };
  };

  const getTxCount = (catId: string) => {
    return transactions.filter(t => t.category === catId).length;
  };

  const openAddCategory = () => {
    setEditingCatId(null);
    setNewCatName('');
    setNewCatType('expense');
    setSelectedColor(AVAILABLE_COLORS[0]);
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setAddCatVisible(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatType(cat.type);
    setSelectedColor(cat.color);
    setSelectedIcon(cat.icon);
    setAddCatVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return;
    
    if (editingCatId) {
      const existing = categories.find(c => c.id === editingCatId);
      if (existing) {
        await updateCategory({
          ...existing,
          name: newCatName.trim(),
          type: newCatType,
          color: selectedColor,
          icon: selectedIcon,
        });
      }
    } else {
      await addCategory({
        name: newCatName.trim(),
        type: newCatType,
        color: selectedColor,
        icon: selectedIcon,
      });
    }
    
    setNewCatName('');
    setEditingCatId(null);
    setAddCatVisible(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    if (Platform.OS === 'web') {
      const ok = window.confirm(`Are you sure you want to delete "${cat.name}"?\n\nTransactions tied to this category will fallback to 'Other'.`);
      if (ok) {
        deleteCategory(cat.id);
      }
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? Transactions tied to this category will fallback to 'Other'.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(cat.id);
          }
        }
      ]
    );
  };

  const openSubCategoryPrompt = (cat: Category) => {
    setEditingSubId(null);
    setTargetCatId(cat.id);
    setNewSubCatName('');
    setSelectedSubColor(cat.color); // inherit parent color
    setSelectedSubIcon(cat.icon); // inherit parent icon
    setAddSubCatVisible(true);
  };

  const openEditSubCategory = (cat: Category, sub: SubCategory) => {
    setEditingSubId(sub.id);
    setTargetCatId(cat.id);
    setNewSubCatName(sub.name);
    setSelectedSubColor(sub.color);
    setSelectedSubIcon(sub.icon);
    setAddSubCatVisible(true);
  };

  const handleSaveSubCategory = async () => {
    if (!newSubCatName.trim() || !targetCatId) return;
    const cat = categories.find(c => c.id === targetCatId);
    if (!cat) return;

    const subs: SubCategory[] = (cat.subcategories || []).map(s => normalizeSub(s, cat));
    
    if (editingSubId) {
      const idx = subs.findIndex(s => s.id === editingSubId || s.name.toLowerCase() === editingSubId.toLowerCase());
      if (idx !== -1) {
        subs[idx] = {
          id: subs[idx].id,
          name: newSubCatName.trim(),
          color: selectedSubColor,
          icon: selectedSubIcon
        };
      }
    } else {
      const exists = subs.some(s => s.name.toLowerCase() === newSubCatName.trim().toLowerCase());
      if (!exists) {
        subs.push({
          id: 'sub_' + Math.random().toString(36).substr(2, 9),
          name: newSubCatName.trim(),
          color: selectedSubColor,
          icon: selectedSubIcon
        });
      }
    }

    await updateCategory({ ...cat, subcategories: subs });
    setEditingSubId(null);
    setAddSubCatVisible(false);
  };

  const handleDeleteSubCategory = async (cat: Category, sub: SubCategory) => {
    if (Platform.OS === 'web') {
      const ok = window.confirm(`Remove "${sub.name}" from ${cat.name}?`);
      if (ok) {
        const subs = (cat.subcategories || [])
          .map(s => normalizeSub(s, cat))
          .filter(s => s.id !== sub.id && s.name !== sub.name);
        await updateCategory({ ...cat, subcategories: subs });
      }
      return;
    }

    Alert.alert(
      'Delete Subcategory',
      `Remove "${sub.name}" from ${cat.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            const subs = (cat.subcategories || [])
              .map(s => normalizeSub(s, cat))
              .filter(s => s.id !== sub.id && s.name !== sub.name);
            await updateCategory({ ...cat, subcategories: subs });
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.surfaceVariant }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onBackground }]}>Categories</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={openAddCategory}>
          <MaterialIcons name="add" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => {
          const normSubs = (cat.subcategories || []).map(s => normalizeSub(s, cat));

          return (
            <View key={cat.id} style={[styles.catCard, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}>
              <View style={styles.catCardTop}>
                <TouchableOpacity style={styles.catLeft} onPress={() => openEditCategory(cat)} activeOpacity={0.7}>
                  <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}20` }]}>
                    <MaterialIcons name={cat.icon as any} size={28} color={cat.color} />
                  </View>
                  <View style={styles.catInfo}>
                    <Text style={[styles.catName, { color: colors.onSurface }]}>{cat.name}</Text>
                    <Text style={[styles.catSubtitle, { color: colors.onSurfaceVariant }]}>
                      {cat.type === 'expense' ? 'Expense' : 'Income'} • {getTxCount(cat.id)} transactions
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.catActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditCategory(cat)}>
                    <MaterialIcons name="edit" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteCategory(cat)}>
                    <MaterialIcons name="delete" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.subCatContainer}>
                {normSubs.map(sub => (
                  <TouchableOpacity 
                    key={sub.id} 
                    style={[styles.subPill, { borderColor: colors.outline, backgroundColor: `${sub.color}15` }]}
                    onPress={() => openEditSubCategory(cat, sub)}
                    onLongPress={() => handleDeleteSubCategory(cat, sub)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name={sub.icon as any} size={14} color={sub.color} style={{ marginRight: 6 }} />
                    <Text style={[styles.subPillText, { color: colors.onSurface }]}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={[styles.subPillAdd, { borderColor: colors.outline }]} 
                  onPress={() => openSubCategoryPrompt(cat)}
                >
                  <MaterialIcons name="add" size={16} color={colors.outline} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add / Edit Subcategory Modal - Bottom Sheet Style */}
      <Modal visible={addSubCatVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlayFlex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheetContent, { backgroundColor: colors.background }]}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setAddSubCatVisible(false)} style={styles.iconBtn}>
                <MaterialIcons name="close" size={24} color={colors.onBackground} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.onBackground }]}>{editingSubId ? 'Edit' : 'New'} Subcategory</Text>
              <TouchableOpacity onPress={handleSaveSubCategory} style={styles.iconBtn}>
                <MaterialIcons name="check" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetScroll}>
              <TextInput
                style={[styles.largeInput, { color: colors.onBackground, borderBottomColor: colors.surfaceVariant }]}
                value={newSubCatName}
                onChangeText={setNewSubCatName}
                placeholder="Subcategory Name"
                placeholderTextColor={colors.outline}
              />

              <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                {AVAILABLE_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }, selectedSubColor === c && { borderWidth: 3, borderColor: colors.onBackground }]}
                    onPress={() => setSelectedSubColor(c)}
                  >
                    {selectedSubColor === c && <MaterialIcons name="check" size={16} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>Icon</Text>
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map(i => {
                  const isSel = selectedSubIcon === i;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.iconSquare, isSel && { backgroundColor: `${colors.primary}20` }]}
                      onPress={() => setSelectedSubIcon(i)}
                    >
                      <MaterialIcons name={i as any} size={28} color={isSel ? colors.primary : colors.outline} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add / Edit Category Modal */}
      <Modal visible={addCatVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlayFlex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheetContent, { backgroundColor: colors.background }]}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setAddCatVisible(false)} style={styles.iconBtn}>
                <MaterialIcons name="close" size={24} color={colors.onBackground} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.onBackground }]}>{editingCatId ? 'Edit' : 'New'} Category</Text>
              <TouchableOpacity onPress={handleSaveCategory} style={styles.iconBtn}>
                <MaterialIcons name="check" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetScroll}>
              <View style={styles.typeSwitcher}>
                <TouchableOpacity 
                  style={[styles.typeBtn, newCatType === 'expense' && { backgroundColor: `${colors.error}20` }]}
                  onPress={() => setNewCatType('expense')}
                >
                  <Text style={[styles.typeText, { color: newCatType === 'expense' ? colors.error : colors.outline }]}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, newCatType === 'income' && { backgroundColor: `${colors.primary}20` }]}
                  onPress={() => setNewCatType('income')}
                >
                  <Text style={[styles.typeText, { color: newCatType === 'income' ? colors.primary : colors.outline }]}>Income</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.largeInput, { color: colors.onBackground, borderBottomColor: colors.surfaceVariant }]}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Category Name"
                placeholderTextColor={colors.outline}
              />

              <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                {AVAILABLE_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && { borderWidth: 3, borderColor: colors.onBackground }]}
                    onPress={() => setSelectedColor(c)}
                  >
                    {selectedColor === c && <MaterialIcons name="check" size={16} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>Icon</Text>
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map(i => {
                  const isSel = selectedIcon === i;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.iconSquare, isSel && { backgroundColor: `${colors.primary}20` }]}
                      onPress={() => setSelectedIcon(i)}
                    >
                      <MaterialIcons name={i as any} size={28} color={isSel ? colors.primary : colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 115,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 700,
  },
  catCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  catCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  catInfo: {
    flex: 1,
  },
  catName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  catSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  },
  subCatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
    marginLeft: 64,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subPillAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayFlex: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sheetScroll: {
    padding: 24,
    paddingBottom: 60,
  },
  typeSwitcher: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  largeInput: {
    fontSize: 24,
    fontWeight: '700',
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  pickerScroll: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconSquare: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
