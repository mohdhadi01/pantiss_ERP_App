import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { ProjectsView } from '../../features/finance/components/ProjectsView';
import type { FinanceStackParamList, FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const route = useRoute<RouteProp<FinanceStackParamList, 'Projects'>>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Project finances & grant utilization"}
        subtitle={"Grant utilization across thematic project portfolios."}
        currentRoute="/(finance)/projects"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <ProjectsView area={route.params?.area} />
      </ModuleShell>
    </ModuleGate>
  );
};
