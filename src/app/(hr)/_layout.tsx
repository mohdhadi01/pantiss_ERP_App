import React from 'react';
import { Stack } from 'expo-router';
import { HRProvider } from '../../features/hr/HRContext';
import { ModuleGuard } from '../../components/auth/ModuleGuard';
import { useTheme } from '../../hooks/useTheme';

export default function HRLayout() {
  const { theme } = useTheme();

  return (
    <ModuleGuard requiredModuleId="human-resources">
      <HRProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'fade',
          }}
        >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="recruitment" />
        <Stack.Screen name="employee-onboarding" />
        <Stack.Screen name="project-assignment" />
        <Stack.Screen name="job-designations" />
        <Stack.Screen name="salary" />
        <Stack.Screen name="attendance" />
        <Stack.Screen name="leave-management" />
        <Stack.Screen name="kbi-metrics" />
        <Stack.Screen name="appraisals" />
        </Stack>
      </HRProvider>
    </ModuleGuard>
  );
}
