import React from 'react';
import { Stack } from 'expo-router';
import { ModuleGuard } from '../../components/auth/ModuleGuard';
import { useTheme } from '../../hooks/useTheme';

export default function FinanceLayout() {
  const { theme } = useTheme();

  return (
    <ModuleGuard requiredModuleId="finance">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="area/[areaId]" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="books" />
      <Stack.Screen name="banking" />
      <Stack.Screen name="vendor-management" />
      <Stack.Screen name="procurement" />
      <Stack.Screen name="salary" />
      <Stack.Screen name="reimbursement" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="taxation" />
      <Stack.Screen name="audit-trails" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="invoices" />
      <Stack.Screen name="investments" />
      <Stack.Screen name="alerts" />
      </Stack>
    </ModuleGuard>
  );
}
