import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { AreaFinanceDashboard } from '../../features/finance/components/AreaFinanceDashboard';
import { financeAreas } from '../../features/finance/data';
import type { FinanceStackParamList, FinanceStackNav, RootDrawerNav } from '../../navigation/types';

/**
 * Web /finance/{areaId} — thematic finance dashboard reached from the
 * portfolio scorecards. The shell keeps the Dashboard nav item active,
 * matching the web's sidebar state.
 */
export const AreaDashboardScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const route = useRoute<RouteProp<FinanceStackParamList, 'AreaDashboard'>>();
  const alerts = useFinanceAlerts();
  const area = financeAreas.find((item) => item.id === route.params.areaId);

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={`${area?.name ?? 'Area'} finances`}
        subtitle="Thematic finance dashboard"
        currentRoute="/(finance)/dashboard"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <AreaFinanceDashboard areaId={route.params.areaId} />
      </ModuleShell>
    </ModuleGate>
  );
};
