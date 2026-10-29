import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { FinanceDashboard } from '../../features/finance/components/FinanceDashboard';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const FinanceDashboardScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Overall finance dashboard"}
        subtitle={"Every rupee, from grant to impact — tracked across the portfolio."}
        currentRoute="/(finance)/dashboard"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <FinanceDashboard />
      </ModuleShell>
    </ModuleGate>
  );
};
