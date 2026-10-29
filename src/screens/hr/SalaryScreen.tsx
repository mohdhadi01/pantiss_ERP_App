import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { SalaryApprovalsView } from '../../features/hr/components/SalaryApprovalsView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const SalaryScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"Salary Approvals"}
        subtitle={"Review Admin-approved salaries and release them to Finance."}
        currentRoute="/(hr)/salary"
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <SalaryApprovalsView />
      </ModuleShell>
    </ModuleGate>
  );
};
