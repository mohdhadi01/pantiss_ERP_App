import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { AssignmentView } from '../../features/hr/components/AssignmentView';
import type { HrStackParamList, HrStackNav, RootDrawerNav } from '../../navigation/types';

export const ProjectAssignmentScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const route = useRoute<RouteProp<HrStackParamList, 'ProjectAssignment'>>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={hrSectionTitles['project-assignment']}
        subtitle={hrSectionDescriptions['project-assignment']}
        currentRoute="/(hr)/project-assignment"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <AssignmentView store={store} employee={route.params?.employee} />
      </ModuleShell>
    </ModuleGate>
  );
};
