import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../../hooks/useTheme';
import type { PublicStackParamList } from '../types';
import { LandingScreen } from '../../screens/landing/LandingScreen';
import { ModulesScreen } from '../../screens/modules/ModulesScreen';
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { NotFoundScreen } from '../../screens/notFound/NotFoundScreen';

const Stack = createNativeStackNavigator<PublicStackParamList>();

export const PublicStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Modules" component={ModulesScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
};
