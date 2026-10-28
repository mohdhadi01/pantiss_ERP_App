import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { VendorManagementView } from '../../features/finance/components/VendorManagementView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

/** Web /finance/vendor-management. */
export const VendorManagementScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={financeSectionTitles['vendor-management']}
        subtitle={financeSectionDescriptions['vendor-management']}
        currentRoute="/(finance)/vendor-management"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <VendorManagementView />
      </ModuleShell>
    </ModuleGate>
  );
};
