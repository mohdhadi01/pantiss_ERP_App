import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../../hooks/useTheme';
import type { FinanceStackParamList } from '../types';
import { FinanceDashboardScreen } from '../../screens/finance/FinanceDashboardScreen';
import { AreaDashboardScreen } from '../../screens/finance/AreaDashboardScreen';
import { BudgetScreen } from '../../screens/finance/BudgetScreen';
import { BooksScreen } from '../../screens/finance/BooksScreen';
import { BankingScreen } from '../../screens/finance/BankingScreen';
import { VendorManagementScreen } from '../../screens/finance/VendorManagementScreen';
import { ProcurementScreen } from '../../screens/finance/ProcurementScreen';
import { SalaryScreen } from '../../screens/finance/SalaryScreen';
import { ReimbursementScreen } from '../../screens/finance/ReimbursementScreen';
import { PaymentsScreen } from '../../screens/finance/PaymentsScreen';
import { TaxationScreen } from '../../screens/finance/TaxationScreen';
import { AuditTrailsScreen } from '../../screens/finance/AuditTrailsScreen';
import { ProjectsScreen } from '../../screens/finance/ProjectsScreen';
import { InvoicesScreen } from '../../screens/finance/InvoicesScreen';
import { InvestmentsScreen } from '../../screens/finance/InvestmentsScreen';
import { AlertsScreen } from '../../screens/finance/AlertsScreen';

const Stack = createNativeStackNavigator<FinanceStackParamList>();

export const FinanceStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="FinanceDashboard" component={FinanceDashboardScreen} />
      <Stack.Screen name="AreaDashboard" component={AreaDashboardScreen} />
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="Books" component={BooksScreen} />
      <Stack.Screen name="Banking" component={BankingScreen} />
      <Stack.Screen name="VendorManagement" component={VendorManagementScreen} />
      <Stack.Screen name="Procurement" component={ProcurementScreen} />
      <Stack.Screen name="FinanceSalary" component={SalaryScreen} />
      <Stack.Screen name="Reimbursement" component={ReimbursementScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Taxation" component={TaxationScreen} />
      <Stack.Screen name="AuditTrails" component={AuditTrailsScreen} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
      <Stack.Screen name="Investments" component={InvestmentsScreen} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
    </Stack.Navigator>
  );
};
