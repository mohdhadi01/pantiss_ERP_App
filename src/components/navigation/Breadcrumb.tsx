import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from '../ui/Icon';

export interface BreadcrumbProps {
  current: string;
  parentLabel?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  current,
  parentLabel = 'Workspace',
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handleParentPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate('Landing');
  };

  return (
    <View style={styles.container}>
      <Icon name="LayoutGrid" size={13} color={theme.colors.textSubtle} />
      <Pressable onPress={handleParentPress} style={styles.crumb}>
        <Text style={[styles.crumbText, { color: theme.colors.textSubtle }]}>
          {parentLabel}
        </Text>
      </Pressable>
      <Icon name="ChevronRight" size={11} color={theme.colors.textSubtle} />
      <Text style={[styles.currentText, { color: theme.colors.textMuted }]}>
        {current}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  crumb: {
    paddingVertical: 2,
  },
  crumbText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
