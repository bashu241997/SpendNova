import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Account, Category, SubCategory, AccountType } from '../utils/storage';
import { COUNTRIES, CountryCurrency } from '../utils/currencies';

interface InitialSetupWizardModalProps {
  visible: boolean;
  onClose: () => void;
  isMandatory?: boolean;
  onCompleteSetup: (
    countryCode: string,
    accounts: Account[],
    categories: Category[]
  ) => Promise<void>;
}

// Pre-configured Default Account Presets
const DEFAULT_ACCOUNT_PRESETS: Omit<Account, 'id'>[] = [
  {
    name: 'Primary Bank Account',
    type: 'savings',
    icon: 'account-balance',
    color: '#3B82F6',
    initialBalance: 0
  },
  {
    name: 'Cash Wallet',
    type: 'cash',
    icon: 'payments',
    color: '#10B981',
    initialBalance: 0
  },
  {
    name: 'Credit Card',
    type: 'credit',
    icon: 'credit-card',
    color: '#EC4899',
    initialBalance: 0
  },
  {
    name: 'Savings Fund',
    type: 'savings',
    icon: 'savings',
    color: '#8B5CF6',
    initialBalance: 0
  }
];

// Pre-configured Category Presets with Subcategories
const DEFAULT_CATEGORY_PRESETS: Omit<Category, 'id'>[] = [];

const AVAILABLE_COLORS = [
  '#10B981', '#F59E0B', '#3B82F6', '#06B6D4',
  '#EC4899', '#8B5CF6', '#F43F5E', '#14B8A6',
  '#6366F1', '#EAB308', '#84CC16', '#A855F7'
];

const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  savings: 'account-balance',
  credit: 'credit-card',
  cash: 'payments',
  custom: 'account-balance-wallet'
};

export const InitialSetupWizardModal: React.FC<InitialSetupWizardModalProps> = ({
  visible,
  onClose,
  isMandatory = false,
  onCompleteSetup
}) => {
  const { colors, country: currentCountry, setCountry } = useApp();
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Currency selection
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(currentCountry || 'US');
  const [countrySearch, setCountrySearch] = useState<string>('');

  // Step 2: Accounts state
  const [selectedAccounts, setSelectedAccounts] = useState<Account[]>(() => {
    return DEFAULT_ACCOUNT_PRESETS.map((acc, index) => ({
      ...acc,
      id: `acc_preset_${index + 1}_${Date.now()}`
    }));
  });

  const [customAccName, setCustomAccName] = useState('');
  const [customAccType, setCustomAccType] = useState<AccountType>('savings');
  const [customAccBalance, setCustomAccBalance] = useState('');
  const [customAccColor, setCustomAccColor] = useState(AVAILABLE_COLORS[0]);
  const [showAddAccForm, setShowAddAccForm] = useState(false);

  // Step 3: Categories & Subcategories state
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(() => {
    return DEFAULT_CATEGORY_PRESETS.map((cat, index) => ({
      ...cat,
      id: `cat_preset_${index + 1}_${Date.now()}`
    }));
  });

  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  // Inline subcategory addition inside step 3
  const [newSubName, setNewSubName] = useState('');
  const [addingSubForCatId, setAddingSubForCatId] = useState<string | null>(null);

  // Custom Category form state
  const [showAddCatForm, setShowAddCatForm] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [customCatType, setCustomCatType] = useState<'expense' | 'income'>('expense');
  const [customCatColor, setCustomCatColor] = useState(AVAILABLE_COLORS[1]);
  const [customCatIcon, setCustomCatIcon] = useState('category');

  // Saving indicator
  const [isSaving, setIsSaving] = useState(false);

  const selectedCountryObj = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.symbol.includes(countrySearch)
  );

  // Account Helpers
  const handleToggleAccountPreset = (preset: Omit<Account, 'id'>) => {
    const existingIndex = selectedAccounts.findIndex(a => a.name.toLowerCase() === preset.name.toLowerCase());
    if (existingIndex >= 0) {
      setSelectedAccounts(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      setSelectedAccounts(prev => [
        ...prev,
        {
          ...preset,
          id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }
      ]);
    }
  };

  const handleUpdateAccountBalance = (id: string, balanceStr: string) => {
    const num = parseFloat(balanceStr) || 0;
    setSelectedAccounts(prev => prev.map(a => a.id === id ? { ...a, initialBalance: num } : a));
  };

  const handleRemoveAccount = (id: string) => {
    setSelectedAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleAddCustomAccount = () => {
    if (!customAccName.trim()) return;
    const newAcc: Account = {
      id: `acc_custom_${Date.now()}`,
      name: customAccName.trim(),
      type: customAccType,
      color: customAccColor,
      icon: ACCOUNT_TYPE_ICONS[customAccType] || 'account-balance-wallet',
      initialBalance: parseFloat(customAccBalance) || 0
    };
    setSelectedAccounts(prev => [...prev, newAcc]);
    setCustomAccName('');
    setCustomAccBalance('');
    setShowAddAccForm(false);
  };

  // Category Helpers
  const handleToggleCategoryPreset = (preset: Omit<Category, 'id'>) => {
    const existingIndex = selectedCategories.findIndex(c => c.name.toLowerCase() === preset.name.toLowerCase());
    if (existingIndex >= 0) {
      setSelectedCategories(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      setSelectedCategories(prev => [
        ...prev,
        {
          ...preset,
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }
      ]);
    }
  };

  const handleRemoveCategory = (id: string) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleAddSubcategory = (catId: string) => {
    if (!newSubName.trim()) return;
    const subName = newSubName.trim();
    setSelectedCategories(prev => prev.map(c => {
      if (c.id === catId) {
        const subs = c.subcategories || [];
        const newSub: SubCategory = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: subName,
          color: c.color,
          icon: 'label'
        };
        return { ...c, subcategories: [...subs, newSub] };
      }
      return c;
    }));
    setNewSubName('');
    setAddingSubForCatId(null);
  };

  const handleRemoveSubcategory = (catId: string, subId: string) => {
    setSelectedCategories(prev => prev.map(c => {
      if (c.id === catId && c.subcategories) {
        return {
          ...c,
          subcategories: c.subcategories.filter(s => s.id !== subId)
        };
      }
      return c;
    }));
  };

  const handleAddCustomCategory = () => {
    if (!customCatName.trim()) return;
    const newCat: Category = {
      id: `cat_custom_${Date.now()}`,
      name: customCatName.trim(),
      type: customCatType,
      color: customCatColor,
      icon: customCatIcon,
      subcategories: []
    };
    setSelectedCategories(prev => [...prev, newCat]);
    setCustomCatName('');
    setShowAddCatForm(false);
  };

  const handleFinishSetup = async () => {
    setIsSaving(true);
    try {
      await onCompleteSetup(selectedCountryCode, selectedAccounts, selectedCategories);
    } catch (e) {
      console.error('Failed to complete setup wizard', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
      onRequestClose={() => {
        if (!isMandatory) onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>

          {/* Header & Step Bar */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <MaterialIcons name="auto-awesome" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.wizardTitle, { color: colors.onSurface }]}>SpendNova Quick Setup</Text>
              </View>
              <Text style={[styles.wizardSub, { color: colors.onSurfaceVariant }]}>
                {currentStep === 1 && 'Step 1: Choose Currency & Region'}
                {currentStep === 2 && 'Step 2: Setup Accounts & Balances'}
                {currentStep === 3 && 'Step 3: Setup Categories & Subcategories'}
                {currentStep === 4 && 'Step 4: Review & Complete Setup'}
              </Text>
            </View>

            {!isMandatory && (
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>

          {/* Stepper Progress Bar */}
          <View style={styles.stepperTrack}>
            {[1, 2, 3, 4].map(stepNum => (
              <TouchableOpacity
                key={stepNum}
                onPress={() => setCurrentStep(stepNum)}
                style={[
                  styles.stepperItem,
                  stepNum <= currentStep && { backgroundColor: colors.primary }
                ]}
              />
            ))}
          </View>

          {/* MAIN WIZARD BODY */}
          <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

            {/* STEP 1: CURRENCY & COUNTRY */}
            {currentStep === 1 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>
                  Select Your Base Currency
                </Text>
                <Text style={[styles.sectionSub, { color: colors.onSurfaceVariant }]}>
                  All totals and reports will be denominated in your chosen currency symbol ({selectedCountryObj.symbol}).
                </Text>

                {/* Popular Currencies Grid */}
                <Text style={[styles.miniLabel, { color: colors.onSurfaceVariant }]}>POPULAR CURRENCIES</Text>
                <View style={styles.popularRow}>
                  {['US', 'IN', 'EU', 'GB', 'CA', 'AU'].map(code => {
                    const cObj = COUNTRIES.find(c => c.code === code);
                    if (!cObj) return null;
                    const isSelected = selectedCountryCode === cObj.code;
                    return (
                      <TouchableOpacity
                        key={cObj.code}
                        style={[
                          styles.popularCard,
                          { backgroundColor: colors.surfaceVariant, borderColor: colors.outline },
                          isSelected && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                        ]}
                        onPress={() => {
                          setSelectedCountryCode(cObj.code);
                          setCountry(cObj.code);
                        }}
                      >
                        <Text style={{ fontSize: 24, marginBottom: 4 }}>{cObj.flag}</Text>
                        <Text style={[styles.popSymbol, { color: isSelected ? colors.onPrimaryContainer : colors.onSurface }]}>
                          {cObj.symbol}
                        </Text>
                        <Text style={[styles.popCode, { color: isSelected ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>
                          {cObj.currency}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Search Country Input */}
                <Text style={[styles.miniLabel, { color: colors.onSurfaceVariant, marginTop: 16 }]}>
                  ALL COUNTRIES ({COUNTRIES.length})
                </Text>
                <View style={[styles.searchBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                  <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.onSurface }]}
                    placeholder="Search currency or country..."
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                  />
                </View>

                {/* Country List */}
                <View style={[styles.countryListContainer, { borderColor: colors.outline }]}>
                  {filteredCountries.slice(0, 15).map(cObj => {
                    const isSelected = selectedCountryCode === cObj.code;
                    return (
                      <TouchableOpacity
                        key={cObj.code}
                        style={[
                          styles.countryRow,
                          { borderColor: colors.outline },
                          isSelected && { backgroundColor: `${colors.primary}18` }
                        ]}
                        onPress={() => {
                          setSelectedCountryCode(cObj.code);
                          setCountry(cObj.code);
                        }}
                      >
                        <Text style={{ fontSize: 22, marginRight: 12 }}>{cObj.flag}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.countryName, { color: colors.onSurface }]}>{cObj.name}</Text>
                          <Text style={[styles.countrySub, { color: colors.onSurfaceVariant }]}>
                            {cObj.currency} ({cObj.symbol})
                          </Text>
                        </View>
                        {isSelected && (
                          <MaterialIcons name="check-circle" size={22} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* STEP 2: ACCOUNTS */}
            {currentStep === 2 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>
                  Setup Accounts & Initial Balances
                </Text>
                <Text style={[styles.sectionSub, { color: colors.onSurfaceVariant }]}>
                  Add bank accounts, cash wallets, or cards to track your spending accurately.
                </Text>

                {/* Account Presets Toggles */}
                <Text style={[styles.miniLabel, { color: colors.onSurfaceVariant }]}>QUICK PRESETS (TAP TO TOGGLE)</Text>
                <View style={styles.presetsGrid}>
                  {DEFAULT_ACCOUNT_PRESETS.map((preset, idx) => {
                    const isSelected = selectedAccounts.some(a => a.name.toLowerCase() === preset.name.toLowerCase());
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.presetChip,
                          { backgroundColor: colors.surfaceVariant, borderColor: colors.outline },
                          isSelected && { backgroundColor: `${preset.color}25`, borderColor: preset.color }
                        ]}
                        onPress={() => handleToggleAccountPreset(preset)}
                      >
                        <MaterialIcons
                          name={preset.icon as any}
                          size={18}
                          color={isSelected ? preset.color : colors.onSurfaceVariant}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[
                          styles.presetChipText,
                          { color: isSelected ? colors.onSurface : colors.onSurfaceVariant }
                        ]}>
                          {preset.name}
                        </Text>
                        <MaterialIcons
                          name={isSelected ? "check" : "add"}
                          size={16}
                          color={isSelected ? preset.color : colors.onSurfaceVariant}
                          style={{ marginLeft: 6 }}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Configured Accounts List */}
                <Text style={[styles.miniLabel, { color: colors.onSurfaceVariant, marginTop: 16 }]}>
                  ACTIVE ACCOUNTS ({selectedAccounts.length})
                </Text>
                {selectedAccounts.map(acc => (
                  <View
                    key={acc.id}
                    style={[styles.accountCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
                  >
                    <View style={[styles.accIconBox, { backgroundColor: `${acc.color}25` }]}>
                      <MaterialIcons name={acc.icon as any} size={22} color={acc.color} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text style={[styles.accCardTitle, { color: colors.onSurface }]}>{acc.name}</Text>
                      <Text style={[styles.accCardSub, { color: colors.onSurfaceVariant }]}>
                        Type: {acc.type.toUpperCase()}
                      </Text>
                    </View>

                    {/* Initial Balance Input */}
                    <View style={styles.balanceInputBox}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onSurfaceVariant, marginRight: 4 }}>
                        {selectedCountryObj.symbol}
                      </Text>
                      <TextInput
                        style={[styles.balanceInput, { color: colors.onSurface }]}
                        placeholder="0"
                        placeholderTextColor={colors.onSurfaceVariant}
                        keyboardType="numeric"
                        value={acc.initialBalance ? String(acc.initialBalance) : ''}
                        onChangeText={(txt) => handleUpdateAccountBalance(acc.id, txt)}
                      />
                    </View>

                    <TouchableOpacity onPress={() => handleRemoveAccount(acc.id)} style={{ padding: 6, marginLeft: 6 }}>
                      <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Custom Account Form Button */}
                {!showAddAccForm ? (
                  <TouchableOpacity
                    style={[styles.addCustomBtn, { borderColor: colors.primary }]}
                    onPress={() => setShowAddAccForm(true)}
                  >
                    <MaterialIcons name="add" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.addCustomBtnText, { color: colors.primary }]}>+ Add Custom Account</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.customFormBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                    <Text style={[styles.customFormTitle, { color: colors.onSurface }]}>Add Custom Account</Text>

                    <TextInput
                      style={[styles.formInput, { color: colors.onSurface, borderColor: colors.outline }]}
                      placeholder="Account Name (e.g., HDFC Salary Bank)"
                      placeholderTextColor={colors.onSurfaceVariant}
                      value={customAccName}
                      onChangeText={setCustomAccName}
                    />

                    {/* Type selector */}
                    <View style={styles.typeRow}>
                      {(['savings', 'cash', 'credit', 'custom'] as AccountType[]).map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeChip,
                            { backgroundColor: colors.surface, borderColor: colors.outline },
                            customAccType === type && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                          ]}
                          onPress={() => setCustomAccType(type)}
                        >
                          <Text style={[
                            styles.typeChipText,
                            { color: customAccType === type ? colors.onPrimaryContainer : colors.onSurfaceVariant }
                          ]}>
                            {type.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Initial Balance */}
                    <TextInput
                      style={[styles.formInput, { color: colors.onSurface, borderColor: colors.outline, marginTop: 8 }]}
                      placeholder={`Initial Balance (${selectedCountryObj.symbol})`}
                      placeholderTextColor={colors.onSurfaceVariant}
                      keyboardType="numeric"
                      value={customAccBalance}
                      onChangeText={setCustomAccBalance}
                    />

                    <View style={styles.formActionsRow}>
                      <TouchableOpacity
                        style={[styles.btnCancel, { backgroundColor: colors.surface }]}
                        onPress={() => setShowAddAccForm(false)}
                      >
                        <Text style={{ color: colors.onSurfaceVariant, fontWeight: '700' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnSave, { backgroundColor: colors.primary }]}
                        onPress={handleAddCustomAccount}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Add Account</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* STEP 3: CATEGORIES & SUBCATEGORIES */}
            {currentStep === 3 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>
                  Categories & Subcategories Setup
                </Text>
                <Text style={[styles.sectionSub, { color: colors.onSurfaceVariant }]}>
                  Organize expenses and income into categories. Expand any category to customize subcategories!
                </Text>

                {/* Category Presets Toggles */}
                <Text style={[styles.miniLabel, { color: colors.onSurfaceVariant }]}>CURATED CATEGORY PACKS</Text>
                <View style={styles.presetsGrid}>
                  {DEFAULT_CATEGORY_PRESETS.map((catPreset, idx) => {
                    const isSelected = selectedCategories.some(c => c.name.toLowerCase() === catPreset.name.toLowerCase());
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.presetChip,
                          { backgroundColor: colors.surfaceVariant, borderColor: colors.outline },
                          isSelected && { backgroundColor: `${catPreset.color}25`, borderColor: catPreset.color }
                        ]}
                        onPress={() => handleToggleCategoryPreset(catPreset)}
                      >
                        <MaterialIcons
                          name={catPreset.icon as any}
                          size={18}
                          color={isSelected ? catPreset.color : colors.onSurfaceVariant}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[
                          styles.presetChipText,
                          { color: isSelected ? colors.onSurface : colors.onSurfaceVariant }
                        ]}>
                          {catPreset.name}
                        </Text>
                        <MaterialIcons
                          name={isSelected ? "check" : "add"}
                          size={16}
                          color={isSelected ? catPreset.color : colors.onSurfaceVariant}
                          style={{ marginLeft: 6 }}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Categories Accordion Tree */}
                <Text style={[styles.miniLabel, { color: colors.onSurfaceVariant, marginTop: 16 }]}>
                  CONFIGURED CATEGORIES ({selectedCategories.length})
                </Text>

                {selectedCategories.map(cat => {
                  const isExpanded = expandedCatId === cat.id;
                  const subsCount = cat.subcategories?.length || 0;

                  return (
                    <View
                      key={cat.id}
                      style={[styles.catAccordionCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
                    >
                      {/* Main Category Header Row */}
                      <TouchableOpacity
                        style={styles.catHeaderRow}
                        onPress={() => setExpandedCatId(isExpanded ? null : cat.id)}
                      >
                        <View style={[styles.catIconBox, { backgroundColor: `${cat.color}25` }]}>
                          <MaterialIcons name={cat.icon as any} size={20} color={cat.color} />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 10 }}>
                          <Text style={[styles.catTitle, { color: colors.onSurface }]}>{cat.name}</Text>
                          <Text style={[styles.catSubText, { color: colors.onSurfaceVariant }]}>
                            {cat.type.toUpperCase()} • {subsCount} Subcategories
                          </Text>
                        </View>

                        <MaterialIcons
                          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                          size={24}
                          color={colors.onSurfaceVariant}
                          style={{ marginRight: 8 }}
                        />

                        <TouchableOpacity onPress={() => handleRemoveCategory(cat.id)} style={{ padding: 4 }}>
                          <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </TouchableOpacity>

                      {/* Expanded Subcategories Tree */}
                      {isExpanded && (
                        <View style={[styles.subTreeContainer, { borderColor: colors.outline }]}>
                          <Text style={[styles.subTreeHeader, { color: colors.onSurfaceVariant }]}>
                            Subcategories under {cat.name}:
                          </Text>

                          {cat.subcategories && cat.subcategories.length > 0 ? (
                            cat.subcategories.map(sub => (
                              <View key={sub.id} style={styles.subItemRow}>
                                <View style={styles.subBullet} />
                                <Text style={[styles.subItemName, { color: colors.onSurface }]}>{sub.name}</Text>
                                <TouchableOpacity
                                  onPress={() => handleRemoveSubcategory(cat.id, sub.id)}
                                  style={{ padding: 4 }}
                                >
                                  <MaterialIcons name="close" size={16} color={colors.onSurfaceVariant} />
                                </TouchableOpacity>
                              </View>
                            ))
                          ) : (
                            <Text style={{ fontSize: 12, color: colors.onSurfaceVariant, fontStyle: 'italic', marginVertical: 4 }}>
                              No subcategories added yet.
                            </Text>
                          )}

                          {/* Quick Add Subcategory Row */}
                          {addingSubForCatId === cat.id ? (
                            <View style={styles.addSubInputRow}>
                              <TextInput
                                style={[styles.subInput, { color: colors.onSurface, borderColor: colors.outline }]}
                                placeholder="Subcategory name (e.g. Groceries)..."
                                placeholderTextColor={colors.onSurfaceVariant}
                                value={newSubName}
                                onChangeText={setNewSubName}
                                autoFocus
                              />
                              <TouchableOpacity
                                style={[styles.btnSubAdd, { backgroundColor: colors.primary }]}
                                onPress={() => handleAddSubcategory(cat.id)}
                              >
                                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Add</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{ padding: 6 }}
                                onPress={() => {
                                  setAddingSubForCatId(null);
                                  setNewSubName('');
                                }}
                              >
                                <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.btnAddSubTrigger}
                              onPress={() => setAddingSubForCatId(cat.id)}
                            >
                              <MaterialIcons name="add" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                              <Text style={[styles.btnAddSubTriggerText, { color: colors.primary }]}>
                                + Add Subcategory to {cat.name}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* Add Custom Category Form Button */}
                {!showAddCatForm ? (
                  <TouchableOpacity
                    style={[styles.addCustomBtn, { borderColor: colors.primary, marginTop: 12 }]}
                    onPress={() => setShowAddCatForm(true)}
                  >
                    <MaterialIcons name="add" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.addCustomBtnText, { color: colors.primary }]}>+ Add Custom Category</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.customFormBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                    <Text style={[styles.customFormTitle, { color: colors.onSurface }]}>Add Custom Category</Text>

                    <TextInput
                      style={[styles.formInput, { color: colors.onSurface, borderColor: colors.outline }]}
                      placeholder="Category Name (e.g., Freelance Project)"
                      placeholderTextColor={colors.onSurfaceVariant}
                      value={customCatName}
                      onChangeText={setCustomCatName}
                    />

                    {/* Type selector */}
                    <View style={styles.typeRow}>
                      <TouchableOpacity
                        style={[
                          styles.typeChip,
                          { backgroundColor: colors.surface, borderColor: colors.outline },
                          customCatType === 'expense' && { backgroundColor: `${colors.error}25`, borderColor: colors.error }
                        ]}
                        onPress={() => setCustomCatType('expense')}
                      >
                        <Text style={[
                          styles.typeChipText,
                          { color: customCatType === 'expense' ? colors.error : colors.onSurfaceVariant }
                        ]}>
                          EXPENSE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.typeChip,
                          { backgroundColor: colors.surface, borderColor: colors.outline },
                          customCatType === 'income' && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                        ]}
                        onPress={() => setCustomCatType('income')}
                      >
                        <Text style={[
                          styles.typeChipText,
                          { color: customCatType === 'income' ? colors.onPrimaryContainer : colors.onSurfaceVariant }
                        ]}>
                          INCOME
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formActionsRow}>
                      <TouchableOpacity
                        style={[styles.btnCancel, { backgroundColor: colors.surface }]}
                        onPress={() => setShowAddCatForm(false)}
                      >
                        <Text style={{ color: colors.onSurfaceVariant, fontWeight: '700' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnSave, { backgroundColor: colors.primary }]}
                        onPress={handleAddCustomCategory}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Add Category</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* STEP 4: REVIEW & FINISH */}
            {currentStep === 4 && (
              <View style={styles.stepContainer}>
                <View style={styles.finishHeaderBox}>
                  <MaterialIcons name="task-alt" size={54} color={colors.primary} style={{ marginBottom: 12 }} />
                  <Text style={[styles.finishTitle, { color: colors.onSurface }]}>Setup Summary & Review</Text>
                  <Text style={[styles.finishSub, { color: colors.onSurfaceVariant }]}>
                    Everything is ready! Review your initial ledger setup below before launching.
                  </Text>
                </View>

                {/* Summary Stat Grid */}
                <View style={styles.summaryGrid}>
                  <View style={[styles.summaryCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                    <Text style={[styles.summaryVal, { color: colors.primary }]}>{selectedCountryObj.flag} {selectedCountryObj.currency}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Base Currency</Text>
                  </View>

                  <View style={[styles.summaryCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                    <Text style={[styles.summaryVal, { color: colors.success }]}>{selectedAccounts.length}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Accounts Configured</Text>
                  </View>

                  <View style={[styles.summaryCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                    <Text style={[styles.summaryVal, { color: colors.onSurface }]}>{selectedCategories.length}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Categories Configured</Text>
                  </View>

                  <View style={[styles.summaryCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                    <Text style={[styles.summaryVal, { color: colors.onSurface }]}>
                      {selectedCategories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Subcategories Configured</Text>
                  </View>
                </View>

                {/* Final Launch Action */}
                <TouchableOpacity
                  style={[styles.launchAppBtn, { backgroundColor: colors.success }]}
                  onPress={handleFinishSetup}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="rocket-launch" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.launchAppBtnText}>
                    {isSaving ? 'Saving Ledger Setup...' : 'Save & Launch SpendNova'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>

          {/* FOOTER CONTROLS */}
          <View style={[styles.footer, { borderColor: colors.outline }]}>
            {currentStep > 1 ? (
              <TouchableOpacity
                style={[styles.btnSecondary, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
                onPress={() => setCurrentStep(prev => prev - 1)}
              >
                <MaterialIcons name="arrow-back" size={18} color={colors.onSurface} style={{ marginRight: 6 }} />
                <Text style={[styles.btnSecondaryText, { color: colors.onSurface }]}>Previous</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {currentStep < 4 && (() => {
              const isStepBlocked = (currentStep === 2 && selectedAccounts.length === 0) || (currentStep === 3 && selectedCategories.length === 0);
              return (
                <TouchableOpacity
                  style={[
                    styles.btnPrimary,
                    { backgroundColor: colors.primary },
                    isStepBlocked && { opacity: 0.4 }
                  ]}
                  disabled={isStepBlocked}
                  onPress={() => {
                    if (!isStepBlocked) {
                      setCurrentStep(prev => prev + 1);
                    }
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Continue to Step {currentStep + 1}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              );
            })()}
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wizardTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  wizardSub: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTrack: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 2,
    gap: 4,
  },
  stepperItem: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 2,
  },
  bodyContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepContainer: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 18,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  popularRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  popularCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  popSymbol: {
    fontSize: 16,
    fontWeight: '800',
  },
  popCode: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    borderWidth: 0,
    outlineStyle: 'none',
  } as any,
  countryListContainer: {
    maxHeight: 220,
    borderRadius: 14,
    overflow: 'hidden',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '700',
  },
  countrySub: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Account Step
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  accIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  accCardSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  balanceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 8,
  },
  balanceInput: {
    width: 60,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    borderWidth: 0,
    outlineStyle: 'none',
  } as any,
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  addCustomBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  customFormBox: {
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  customFormTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  formInput: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 8,
    borderWidth: 0,
    outlineStyle: 'none',
  } as any,
  typeRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  formActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  btnCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnSave: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  // Category Step
  catAccordionCard: {
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  catSubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subTreeContainer: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  subTreeHeader: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  subBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginRight: 8,
  },
  subItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  btnAddSubTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  btnAddSubTriggerText: {
    fontSize: 12,
    fontWeight: '800',
  },
  addSubInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  subInput: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    borderWidth: 0,
    outlineStyle: 'none',
  } as any,
  btnSubAdd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  // Review & Finish Step
  finishHeaderBox: {
    alignItems: 'center',
    marginVertical: 12,
    textAlign: 'center',
  },
  finishTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  finishSub: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 16,
  },
  summaryCard: {
    width: '47%',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  launchAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  launchAppBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  }
});
