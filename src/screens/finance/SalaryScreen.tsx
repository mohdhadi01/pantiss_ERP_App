import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { SalaryView } from '../../features/finance/components/SalaryView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const SalaryScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Salary register & payroll rollout"}
        subtitle={"Salary approvals and payment forwarding for the payroll month."}
        currentRoute="/(finance)/salary"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <SalaryView />
      </ModuleShell>
    </ModuleGate>
  );
};
