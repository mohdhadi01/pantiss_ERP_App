import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { ProcurementView } from '../../features/finance/components/ProcurementView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

/** Web /finance/procurement. */
export const ProcurementScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={financeSectionTitles['procurement']}
        subtitle={financeSectionDescriptions['procurement']}
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
