import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useHR } from '../../features/hr/HRContext';
import { AttendanceView } from '../../features/hr/components/AttendanceView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const AttendanceScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"Attendance"}
        subtitle={"Review punch times, live photo evidence and recorded locations."}
        currentRoute="/(hr)/attendance"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <AttendanceView store={store} />
      </ModuleShell>
    </ModuleGate>
  );
};
