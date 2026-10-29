import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { BudgetsView } from '../../features/finance/components/BudgetsView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const BudgetScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Budget planning & allocations"}
        subtitle={"Portfolio budgets, revisions and approvals for FY 2026–27."}
        currentRoute="/(finance)/budget"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <BudgetsView />
      </ModuleShell>
    </ModuleGate>
  );
};
