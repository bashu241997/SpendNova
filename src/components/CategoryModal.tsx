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
import { Category } from '../utils/storage';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ColorTheme;
  categories: Category[];
  type: 'income' | 'expense';
  onSelect: (category: Category) => void;
  onAddCategory: (name: string, type: 'income' | 'expense', color: string, icon: string) => Promise<void>;
  onUpdateCategory?: (category: Category) => Promise<void>;
  onDeleteCategory?: (id: string) => Promise<void>;
  manageMode?: boolean;
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

export const CategoryModal: React.FC<CategoryModalProps> = ({ 
  visible, 
  onClose, 
  colors, 
  categories, 
  type,
  onSelect,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  manageMode = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (visible) {
      setNewCatName('');
      setSelectedColor(AVAILABLE_COLORS[0]);
      setSelectedIcon(AVAILABLE_ICONS[0]);
      setEditingCategory(null);
      setShowAddForm(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!newCatName.trim()) return;

    if (editingCategory) {
      await onUpdateCategory?.({
        ...editingCategory,
        name: newCatName.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
    } else {
      await onAddCategory(newCatName.trim(), type, selectedColor, selectedIcon);
    }

    setNewCatName('');
    setEditingCategory(null);
    setShowAddForm(false);
    if (!manageMode) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (!editingCategory) return;

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${editingCategory.name}"? Transactions tied to this category will fallback to default 'Other'.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await onDeleteCategory?.(editingCategory.id);
            setNewCatName('');
            setEditingCategory(null);
            setShowAddForm(false);
          }
        }
      ]
    );
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
            <View>
              <Text style={[styles.subTitle, { color: colors.onSurfaceVariant }]}>
                {type.toUpperCase()} CATEGORIES
              </Text>
              <Text style={[styles.title, { color: colors.onBackground }]}>
                {editingCategory ? 'Edit Category' : (showAddForm ? 'Create Category' : 'Select Category')}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                if (editingCategory) {
                  setEditingCategory(null);
                  setNewCatName('');
                  setShowAddForm(false);
                } else {
                  setShowAddForm(!showAddForm);
                }
              }}
              style={[styles.addBtn, { backgroundColor: colors.primaryContainer }]}
            >
              <MaterialIcons 
                name={showAddForm ? 'list' : 'add'} 
                size={20} 
                color={colors.onPrimaryContainer} 
              />
              <Text style={[styles.addBtnText, { color: colors.onPrimaryContainer }]}>
                {showAddForm ? 'View List' : '+ New'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAddForm ? (
            <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.onBackground }]}>Category Name</Text>
              <TextInput
                placeholder="e.g. Subscriptions, Groceries"
                placeholderTextColor={colors.outline}
                value={newCatName}
                onChangeText={setNewCatName}
                style={[styles.input, { 
                  borderColor: colors.outline, 
                  color: colors.onBackground,
                  backgroundColor: colors.surfaceVariant
                }]}
              />

              <Text style={[styles.label, { color: colors.onBackground }]}>Category Icon</Text>
              <View style={styles.itemGrid}>
                {AVAILABLE_ICONS.map(ico => (
                  <TouchableOpacity
                    key={ico}
                    onPress={() => setSelectedIcon(ico)}
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.surfaceVariant },
                      selectedIcon === ico && { borderColor: selectedColor, borderWidth: 3, backgroundColor: selectedColor + '20' }
                    ]}
                  >
                    <MaterialIcons 
                      name={ico as any} 
                      size={22} 
                      color={selectedIcon === ico ? selectedColor : colors.onSurfaceVariant} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.onBackground }]}>Category Accent Color</Text>
              <View style={styles.itemGrid}>
                {AVAILABLE_COLORS.map(col => (
                  <TouchableOpacity
                    key={col}
                    onPress={() => setSelectedColor(col)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: col },
                      selectedColor === col && { borderColor: colors.onBackground, borderWidth: 3, transform: [{ scale: 1.1 }] }
                    ]}
                  />
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 24 }}>
                {editingCategory && (
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
                  disabled={!newCatName.trim()}
                  style={[
                    styles.submitBtn,
                    { 
                      backgroundColor: newCatName.trim() ? colors.primary : colors.surfaceVariant,
                      flex: 1 
                    }
                  ]}
                >
                  <Text style={[
                    styles.submitBtnText,
                    { color: newCatName.trim() ? colors.onPrimary : colors.outline }
                  ]}>
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <FlatList
              data={filteredCategories}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.gridCard, 
                    { 
                      backgroundColor: item.color + '15',
                      borderColor: item.color + '40'
                    }
                  ]}
                  onPress={() => {
                    if (manageMode) {
                      setEditingCategory(item);
                      setNewCatName(item.name);
                      setSelectedColor(item.color);
                      setSelectedIcon(item.icon);
                      setShowAddForm(true);
                    } else {
                      onSelect(item);
                      onClose();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.color }]}>
                    <MaterialIcons name={item.icon as any} size={22} color="#FFFFFF" />
                  </View>

                  <Text 
                    style={[styles.categoryName, { color: colors.onBackground }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  {item.budget && item.budget > 0 ? (
                    <View style={[styles.budgetChip, { backgroundColor: item.color + '30' }]}>
                      <Text style={[styles.budgetChipText, { color: item.color }]}>
                        ₹{item.budget}
                      </Text>
                    </View>
                  ) : null}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  dragHandle: {
    width: 40,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  gridCard: {
    flex: 1/3,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  budgetChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  budgetChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 100,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
