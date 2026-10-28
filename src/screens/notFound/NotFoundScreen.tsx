import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { useTheme } from '../../hooks/useTheme';
import { Icon } from '../../components/ui/Icon';
import type { PublicStackParamList } from '../../navigation/types';

/** Web NotFoundPage parity: SearchX tile + "Workspace not found" + red-600 CTA. */
export const NotFoundScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<PublicStackParamList>>();
  // Keep the route hook so the screen stays route-aware (typed params, linking).
  useRoute<RouteProp<PublicStackParamList, 'NotFound'>>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.iconTile, { backgroundColor: theme.colors.dangerSoft }]}>
        <Icon name="SearchX" size={26} color={theme.colors.redAccent} strokeWidth={1.8} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>Workspace not found</Text>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>
        This workspace may have moved, or you might not have access yet.
      </Text>
      <Pressable
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Landing' }] })}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.redAccent, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Icon name="ArrowLeft" size={16} color="#ffffff" />
        <Text style={styles.buttonText}>Back to home</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  iconTile: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
