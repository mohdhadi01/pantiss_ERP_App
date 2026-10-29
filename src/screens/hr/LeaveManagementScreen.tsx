import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useHR } from '../../features/hr/HRContext';
import { LeaveView } from '../../features/hr/components/LeaveView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const LeaveManagementScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"Leave Management"}
        subtitle={"Track Admin clearance and record HR decisions on employee leave requests."}
        currentRoute="/(hr)/leave-management"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <LeaveView store={store} />
      </ModuleShell>
    </ModuleGate>
  );
};
