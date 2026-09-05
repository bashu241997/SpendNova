import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
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
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({ 
  visible, 
  onClose, 
  colors, 
  categories, 
  type,
  onSelect,
}) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const filteredCategories = categories.filter(c => c.type === type);

  const handleSelect = (cat: Category, sub?: string) => {
    onSelect(cat, sub);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.dragHandle, { backgroundColor: colors.outline }]} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onBackground }]}>Select Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {filteredCategories.length === 0 ? (
              <Text style={[styles.empty, { color: colors.outline }]}>No categories found. Add them in Settings.</Text>
            ) : (
              filteredCategories.map(cat => (
                <View key={cat.id}>
                  <TouchableOpacity 
                    style={[styles.item, { borderBottomColor: colors.surfaceVariant }]}
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
                        <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
                      </View>
                      <Text style={[styles.itemName, { color: colors.onBackground }]}>{cat.name}</Text>
                    </View>
                    {(cat.subcategories && cat.subcategories.length > 0) ? (
                      <MaterialIcons 
                        name={expandedCat === cat.id ? 'expand-less' : 'expand-more'} 
                        size={24} 
                        color={colors.outline} 
                      />
                    ) : (
                      <TouchableOpacity 
                        style={[styles.selectBtn, { backgroundColor: `${colors.primary}20` }]}
                        onPress={() => handleSelect(cat)}
                      >
                        <Text style={[styles.selectBtnText, { color: colors.primary }]}>Select</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {/* Subcategories Expansion */}
                  {expandedCat === cat.id && (
                    <View style={[styles.subList, { backgroundColor: colors.surface }]}>
                      <TouchableOpacity 
                        style={[styles.subItem, { borderBottomColor: colors.surfaceVariant }]}
                        onPress={() => handleSelect(cat)}
                      >
                        <Text style={[styles.subItemText, { color: colors.onSurface }]}>Main Category Only</Text>
                      </TouchableOpacity>
                      {cat.subcategories?.map(subObj => {
                        // fallback for old string subcategories
                        const isObj = typeof subObj === 'object';
                        const sub = isObj ? subObj as any : { id: subObj, name: subObj, color: cat.color, icon: cat.icon };
                        
                        return (
                          <TouchableOpacity 
                            key={sub.id}
                            style={[styles.subItem, { borderBottomColor: colors.surfaceVariant }]}
                            onPress={() => handleSelect(cat, sub.id)}
                          >
                            <View style={[styles.subIconWrap, { backgroundColor: `${sub.color}20` }]}>
                              <MaterialIcons name={sub.icon} size={16} color={sub.color} />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
  },
  content: {
    ...(Platform.OS === 'web' ? {
      borderRadius: 24,
      width: '90%',
      maxWidth: 500,
    } : {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    }),
    minHeight: '50%',
    maxHeight: '85%',
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
  },
  scroll: {
    paddingHorizontal: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subList: {
    paddingLeft: 56,
    paddingRight: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subItemText: {
    fontSize: 15,
  },
});
