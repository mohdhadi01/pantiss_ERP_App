import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { AlertsView } from '../../features/finance/components/AlertsView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const AlertsScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Alerts & Highlights"}
        subtitle={"Real-time alerts on advances, compliance deadlines, and budget exceptions."}
        currentRoute="/(finance)/alerts"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <AlertsView />
      </ModuleShell>
    </ModuleGate>
  );
};
