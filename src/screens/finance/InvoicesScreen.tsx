import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { InvoicesView } from '../../features/finance/components/InvoicesView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const InvoicesScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Client Invoices"}
        subtitle={"Select a thematic area and project to review tranche amounts."}
        currentRoute="/(finance)/invoices"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <InvoicesView />
      </ModuleShell>
    </ModuleGate>
  );
};
