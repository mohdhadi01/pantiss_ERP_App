import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { ReimbursementView } from '../../features/finance/components/ReimbursementView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

/** Web /finance/reimbursement. */
export const ReimbursementScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={financeSectionTitles['reimbursement']}
        subtitle={financeSectionDescriptions['reimbursement']}
        currentRoute="/(finance)/reimbursement"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <ReimbursementView />
      </ModuleShell>
    </ModuleGate>
  );
};
