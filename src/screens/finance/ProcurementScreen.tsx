import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { ProcurementView } from '../../features/finance/components/ProcurementView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const ProcurementScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Procurement & requisitions"}
        subtitle={"Manage requests by project or review the history of all procurement requests."}
        currentRoute="/(finance)/procurement"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <ProcurementView />
      </ModuleShell>
    </ModuleGate>
  );
};
