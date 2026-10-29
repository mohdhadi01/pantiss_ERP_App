import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import { useTheme } from '../hooks/useTheme';
import { linking } from './linking';
import type { DrawerSection, RootDrawerParamList } from './types';
import { PublicStack } from './stacks/PublicStack';
import { FinanceStack } from './stacks/FinanceStack';
import { HrStack } from './stacks/HrStack';
import { AppDrawerContent } from '../components/layout/AppDrawerContent';

const RootDrawer = createDrawerNavigator<RootDrawerParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <NavigationContainer
      linking={linking}
      fallback={
        <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.brandPrimary} />
        </View>
      }
    >
      <RootDrawer.Navigator
        initialRouteName="PublicStack"
        drawerContent={(props) => {
          const activeName = props.state.routes[props.state.index].name;
          const section: DrawerSection =
            activeName === 'FinanceStack' ? 'finance' : activeName === 'HrStack' ? 'hr' : 'none';

          return (
            <AppDrawerContent
              {...props}
              section={section}
              collapsed={isWide && sidebarCollapsed}
              onToggleCollapse={isWide ? () => setSidebarCollapsed((v) => !v) : undefined}
              onClose={isWide ? undefined : () => props.navigation.closeDrawer()}
            />
          );
        }}
        screenOptions={{
          headerShown: false,
          drawerType: isWide ? 'permanent' : 'slide',
          drawerStyle: {
            width: isWide ? (sidebarCollapsed ? 80 : 260) : Math.min(300, width * 0.9),
            backgroundColor: theme.colors.moduleBg,
            borderRightWidth: 1,
            borderRightColor: theme.colors.border,
          },
          swipeEnabled: !isWide,
          swipeEdgeWidth: 60,
          overlayColor: 'rgba(2, 6, 23, 0.55)',
        }}
      >
        <RootDrawer.Screen
          name="PublicStack"
          component={PublicStack}
          options={{ swipeEnabled: false, drawerType: 'front' }}
        />
        <RootDrawer.Screen name="FinanceStack" component={FinanceStack} />
        <RootDrawer.Screen name="HrStack" component={HrStack} />
      </RootDrawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
