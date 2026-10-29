import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { VendorManagementView } from '../../features/finance/components/VendorManagementView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const VendorManagementScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Vendor directory & contracts"}
        subtitle={"Empaneled vendor master directory and compliance."}
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
