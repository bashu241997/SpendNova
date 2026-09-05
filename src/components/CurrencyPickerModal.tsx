import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { COUNTRIES, CountryCurrency } from '../utils/currencies';

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ColorTheme;
  onSelect: (country: CountryCurrency) => void;
  selectedCountryCode?: string;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  onClose,
  colors,
  onSelect,
  selectedCountryCode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { width, height } = useWindowDimensions();

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    const lowerQ = searchQuery.toLowerCase();
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(lowerQ) ||
      c.currency.toLowerCase().includes(lowerQ) ||
      c.code.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery]);

  return (
    <Modal visible={visible} animationType={Platform.OS === 'web' ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent, 
          { backgroundColor: colors.background, maxHeight: height * 0.9 },
          Platform.OS === 'web' && { width: '100%', maxWidth: 500, alignSelf: 'center', height: '80%' }
        ]}>
          
          <View style={[styles.header, { borderBottomColor: colors.surfaceVariant }]}>
            <Text style={[styles.title, { color: colors.onBackground }]}>Select Currency Region</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface, backgroundColor: colors.surfaceVariant }]}
              placeholder="Search country or currency..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={item => item.code}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            renderItem={({ item }) => {
              const isSelected = item.code === selectedCountryCode;
              return (
                <TouchableOpacity
                  style={[
                    styles.itemRow,
                    { borderBottomColor: colors.surfaceVariant },
                    isSelected && { backgroundColor: colors.primaryContainer }
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.flagText}>{item.flag}</Text>
                    <View>
                      <Text style={[styles.countryName, { color: colors.onSurface }]}>{item.name}</Text>
                      <Text style={[styles.currencyCode, { color: colors.onSurfaceVariant }]}>{item.currency}</Text>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.currencySymbol, { color: colors.onSurface }]}>{item.symbol}</Text>
                    {isSelected && <MaterialIcons name="check" size={20} color={colors.primary} style={{ marginLeft: 12 }} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  modalContent: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...(Platform.OS === 'web' ? {
      borderRadius: 28,
      width: '90%',
      maxWidth: 500,
    } : {
      width: '100%',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 28,
    marginRight: 16,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 13,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
  }
});
