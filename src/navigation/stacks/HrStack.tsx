import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../../hooks/useTheme';
import type { HrStackParamList } from '../types';
import { HRProvider } from '../../features/hr/HRContext';
import { DashboardScreen } from '../../screens/hr/DashboardScreen';
import { RecruitmentScreen } from '../../screens/hr/RecruitmentScreen';
import { EmployeeOnboardingScreen } from '../../screens/hr/EmployeeOnboardingScreen';
import { ProjectAssignmentScreen } from '../../screens/hr/ProjectAssignmentScreen';
import { JobDesignationsScreen } from '../../screens/hr/JobDesignationsScreen';
import { SalaryScreen } from '../../screens/hr/SalaryScreen';
import { AttendanceScreen } from '../../screens/hr/AttendanceScreen';
import { LeaveManagementScreen } from '../../screens/hr/LeaveManagementScreen';
import { KbiMetricsScreen } from '../../screens/hr/KbiMetricsScreen';
import { AppraisalsScreen } from '../../screens/hr/AppraisalsScreen';

const Stack = createNativeStackNavigator<HrStackParamList>();

export const HrStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <HRProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="HrDashboard" component={DashboardScreen} />
        <Stack.Screen name="Recruitment" component={RecruitmentScreen} />
        <Stack.Screen name="EmployeeOnboarding" component={EmployeeOnboardingScreen} />
        <Stack.Screen name="ProjectAssignment" component={ProjectAssignmentScreen} />
        <Stack.Screen name="JobDesignations" component={JobDesignationsScreen} />
        <Stack.Screen name="HrSalary" component={SalaryScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="LeaveManagement" component={LeaveManagementScreen} />
        <Stack.Screen name="KbiMetrics" component={KbiMetricsScreen} />
        <Stack.Screen name="Appraisals" component={AppraisalsScreen} />
      </Stack.Navigator>
    </HRProvider>
  );
};
