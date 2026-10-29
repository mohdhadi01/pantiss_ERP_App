import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { AuditTrailsView } from '../../features/finance/components/AuditTrailsView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const AuditTrailsScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Audit trail"}
        subtitle={"Follow every employee invoice, from submission to disbursement."}
        currentRoute="/(finance)/audit-trails"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <AuditTrailsView />
      </ModuleShell>
    </ModuleGate>
  );
};
