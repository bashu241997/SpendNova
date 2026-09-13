import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { Category } from '../utils/storage';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ColorTheme;
  categories: Category[];
  type: 'income' | 'expense';
  onSelect: (category: Category, subcategory?: string) => void;
  onAddCategory?: (category: Omit<Category, 'id'>) => Promise<Category | void>;
  onAddSubcategory?: (categoryId: string, subcategoryName: string) => Promise<void>;
}

const PRESET_ICONS = [
  'shopping-cart', 'restaurant', 'directions-car', 'home', 'local-hospital',
  'build', 'flash-on', 'flight', 'sports-esports', 'school',
  'attach-money', 'work', 'card-giftcard', 'trending-up', 'pets'
];

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  onClose,
  colors,
  categories,
  type,
  onSelect,
  onAddCategory,
  onAddSubcategory,
}) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  
  // Creation States
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState(PRESET_ICONS[0]);
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  const [addingSubForCatId, setAddingSubForCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSelect = (cat: Category, sub?: string) => {
    onSelect(cat, sub);
    onClose();
  };

  const handleSaveCategory = async () => {
    if (!newCatName.trim() || !onAddCategory) return;
    const createdCat = await onAddCategory({
      name: newCatName.trim(),
      type,
      icon: newCatIcon,
      color: newCatColor,
      subcategories: [],
    });
    setNewCatName('');
    setShowAddCategoryForm(false);
    if (createdCat) {
      handleSelect(createdCat);
    }
  };

  const handleSaveSubcategory = async (cat: Category) => {
    if (!newSubName.trim() || !onAddSubcategory) return;
    await onAddSubcategory(cat.id, newSubName.trim());
    const subName = newSubName.trim();
    setNewSubName('');
    setAddingSubForCatId(null);
    handleSelect(cat, subName);
  };

  return (
    <Modal visible={visible} animationType={Platform.OS === 'web' ? 'fade' : 'slide'} transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={[styles.dragHandle, { backgroundColor: colors.surfaceVariant }]} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.onBackground }]}>Select Category</Text>
              <Text style={{ fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 }}>
                Tap a category to select or expand subcategories
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          </View>

          {/* Create New Category Bar */}
          <TouchableOpacity
            style={[styles.addCatBanner, { backgroundColor: colors.primaryContainer }]}
            onPress={() => setShowAddCategoryForm(!showAddCategoryForm)}
          >
            <MaterialIcons name={showAddCategoryForm ? 'remove-circle-outline' : 'add-circle-outline'} size={20} color={colors.onPrimaryContainer} />
            <Text style={[styles.addCatBannerText, { color: colors.onPrimaryContainer }]}>
              {showAddCategoryForm ? 'Cancel Creating Category' : '+ Create New Category'}
            </Text>
          </TouchableOpacity>

          {/* Form to Add New Main Category */}
          {showAddCategoryForm && (
            <View style={[styles.inlineForm, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onSurface, marginBottom: 8 }}>
                NEW CATEGORY NAME
              </Text>
              <TextInput
                placeholder="e.g. Shopping, Utilities, Medical"
                placeholderTextColor={colors.outline}
                value={newCatName}
                onChangeText={setNewCatName}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
              />

              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant, marginTop: 10, marginBottom: 6 }}>
                CHOOSE ICON
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {PRESET_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setNewCatIcon(icon)}
                    style={[
                      styles.iconCircle,
                      { backgroundColor: newCatIcon === icon ? colors.primary : colors.surface }
                    ]}
                  >
                    <MaterialIcons name={icon as any} size={20} color={newCatIcon === icon ? '#FFF' : colors.onSurfaceVariant} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant, marginTop: 10, marginBottom: 6 }}>
                CHOOSE COLOR
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {PRESET_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setNewCatColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color, opacity: newCatColor === color ? 1 : 0.6 }
                    ]}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveInlineBtn, { backgroundColor: colors.primary, opacity: newCatName.trim() ? 1 : 0.5 }]}
                disabled={!newCatName.trim()}
                onPress={handleSaveCategory}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Save & Select Category</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.scroll}>
            {filteredCategories.length === 0 ? (
              <Text style={[styles.empty, { color: colors.outline }]}>No categories found. Create one above!</Text>
            ) : (
              filteredCategories.map(cat => (
                <View key={cat.id} style={{ marginBottom: 6 }}>
                  <TouchableOpacity
                    style={[styles.item, { backgroundColor: colors.surfaceVariant, borderRadius: 16 }]}
                    onPress={() => {
                      if (cat.subcategories && cat.subcategories.length > 0) {
                        setExpandedCat(expandedCat === cat.id ? null : cat.id);
                      } else {
                        handleSelect(cat);
                      }
                    }}
                  >
                    <View style={styles.itemLeft}>
                      <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }]}>
                        <MaterialIcons name={cat.icon as any} size={22} color={cat.color} />
                      </View>
                      <View>
                        <Text style={[styles.itemName, { color: colors.onBackground }]}>{cat.name}</Text>
                        <Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>
                          {cat.subcategories?.length ? `${cat.subcategories.length} subcategories` : 'Tap to select'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {/* Button to add subcategory directly */}
                      <TouchableOpacity
                        style={[styles.addSubBtn, { backgroundColor: `${colors.primary}15` }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          setAddingSubForCatId(addingSubForCatId === cat.id ? null : cat.id);
                          setExpandedCat(cat.id);
                        }}
                      >
                        <MaterialIcons name="add" size={16} color={colors.primary} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Sub</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.selectBtn, { backgroundColor: colors.primary }]}
                        onPress={() => handleSelect(cat)}
                      >
                        <Text style={[styles.selectBtnText, { color: '#FFF' }]}>Select</Text>
                      </TouchableOpacity>

                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <MaterialIcons
                          name={expandedCat === cat.id ? 'expand-less' : 'expand-more'}
                          size={24}
                          color={colors.outline}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Form to add subcategory under this category */}
                  {addingSubForCatId === cat.id && (
                    <View style={[styles.subInlineForm, { backgroundColor: colors.surfaceVariant }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginBottom: 6 }}>
                        ADD SUBCATEGORY TO "{cat.name.toUpperCase()}"
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput
                          placeholder="Subcategory Name (e.g. Milk, Petrol)"
                          placeholderTextColor={colors.outline}
                          value={newSubName}
                          onChangeText={setNewSubName}
                          style={[styles.input, { flex: 1, height: 40, backgroundColor: colors.surface, color: colors.onSurface }]}
                        />
                        <TouchableOpacity
                          style={[styles.saveInlineBtn, { height: 40, paddingHorizontal: 16, backgroundColor: colors.primary, marginTop: 0 }]}
                          onPress={() => handleSaveSubcategory(cat)}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>Add & Select</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Subcategories List */}
                  {expandedCat === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                    <View style={[styles.subList, { backgroundColor: `${colors.surfaceVariant}60` }]}>
                      <TouchableOpacity
                        style={styles.subItem}
                        onPress={() => handleSelect(cat)}
                      >
                        <MaterialIcons name="folder" size={16} color={cat.color} style={{ marginRight: 8 }} />
                        <Text style={[styles.subItemText, { color: colors.onSurface, fontWeight: '700' }]}>Main Category ({cat.name})</Text>
                      </TouchableOpacity>
                      {cat.subcategories.map(subObj => {
                        const isObj = typeof subObj === 'object';
                        const sub = isObj ? subObj as any : { id: subObj, name: subObj, color: cat.color, icon: cat.icon };

                        return (
                          <TouchableOpacity
                            key={sub.id}
                            style={styles.subItem}
                            onPress={() => handleSelect(cat, sub.name)}
                          >
                            <View style={[styles.subIconWrap, { backgroundColor: `${sub.color}20` }]}>
                              <MaterialIcons name={sub.icon || cat.icon} size={14} color={sub.color || cat.color} />
                            </View>
                            <Text style={[styles.subItemText, { color: colors.onSurface }]}>{sub.name}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  } as any,
  backdrop: {
    ...StyleSheet.absoluteFill as any,
  },
  content: {
    ...(Platform.OS === 'web' ? {
      borderRadius: 24,
      width: '92%',
      maxWidth: 520,
    } : {
      width: '100%',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }),
    minHeight: '60%',
    maxHeight: '90%',
    paddingTop: 14,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  addCatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  addCatBannerText: {
    fontSize: 13,
    fontWeight: '800',
  },
  inlineForm: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
  },
  subInlineForm: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
  },
  input: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 0,
    outlineStyle: 'none',
  } as any,
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  saveInlineBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  scroll: {
    paddingHorizontal: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  addSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 2,
  },
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subList: {
    paddingLeft: 32,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 4,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  subIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  subItemText: {
    fontSize: 14,
  },
});
