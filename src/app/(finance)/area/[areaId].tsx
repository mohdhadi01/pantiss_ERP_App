import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ModuleShell } from '../../../components/layout/ModuleShell';
import { financeNavItems } from '../../../features/finance/constants';
import { useFinanceAlerts } from '../../../features/finance/data/alertsStore';
import { AreaFinanceDashboard } from '../../../features/finance/components/AreaFinanceDashboard';
import { financeAreas } from '../../../features/finance/data';

/**
 * Web /finance/{areaId} — thematic finance dashboard reached from the
 * portfolio scorecards. The shell keeps the Dashboard nav item active,
 * matching the web's sidebar state.
 */
export default function AreaFinanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ areaId?: string }>();
  const alerts = useFinanceAlerts();
  const area = financeAreas.find((item) => item.id === params.areaId);

  return (
    <ModuleShell
      title={`${area?.name ?? 'Area'} finances`}
      subtitle="Thematic finance dashboard"
      currentRoute="/(finance)/dashboard"
      navItems={financeNavItems}
      avatarVariant="finance"
      searchPlaceholder="Search financial records"
      showAlerts
      unreadAlertsCount={alerts.unreadCount}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <AreaFinanceDashboard areaId={String(params.areaId ?? '')} />
    </ModuleShell>
  );
}
