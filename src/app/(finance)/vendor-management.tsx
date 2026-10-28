import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { VendorManagementView } from '../../features/finance/components/VendorManagementView';

export default function VendorManagementScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Vendor Management"
      subtitle={financeSectionDescriptions['vendor-management']}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/vendor-management"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <VendorManagementView />
    </ModuleShell>
  );
}
