import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface MoreScreenProps {
  onNavigate: (tab: 'stats' | 'accounts' | 'settings' | 'recurring' | 'goals') => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onNavigate }) => {
  const { colors } = useApp();

  const menuItems = [
    {
      id: 'stats',
      title: 'Analytics',
      subtitle: 'View spending charts and insights',
      icon: 'pie-chart',
      color: colors.primary,
    },
    {
      id: 'recurring',
      title: 'Subscriptions & EMIs',
      subtitle: 'Track monthly recurring bills & loan EMIs',
      icon: 'event-repeat',
      color: '#8B5CF6',
    },
    {
      id: 'goals',
      title: 'Savings Goals',
      subtitle: 'Target savings for emergency fund, car, etc.',
      icon: 'emoji-events',
      color: '#10B981',
    },
    {
      id: 'accounts',
      title: 'Accounts',
      subtitle: 'Manage your bank accounts and cards',
      icon: 'account-balance',
      color: colors.success,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences, categories, and data backup',
      icon: 'settings',
      color: colors.outline,
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.headerTitle, { color: colors.onBackground }]}>More</Text>
      
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.surfaceVariant }
            ]}
            onPress={() => onNavigate(item.id as any)}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${item.color}20` }]}>
              <MaterialIcons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: colors.onSurface }]}>{item.title}</Text>
              <Text style={[styles.subtitle, { color: colors.outline }]}>{item.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    marginLeft: 8,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
});
