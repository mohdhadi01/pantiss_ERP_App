import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useHR } from '../../features/hr/HRContext';
import { HRDashboard } from '../../features/hr/components/HRDashboard';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"HR Dashboard"}
        subtitle={"Your people, approvals and priorities, connected in one place."}
        currentRoute="/(hr)/dashboard"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <HRDashboard data={store.data} />
      </ModuleShell>
    </ModuleGate>
  );
};
