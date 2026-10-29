import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useHR } from '../../features/hr/HRContext';
import { DesignationsView } from '../../features/hr/components/DesignationsView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const JobDesignationsScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"Job Designations"}
        subtitle={"Define the roles your teams need, organised by thematic area."}
        currentRoute="/(hr)/job-designations"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <DesignationsView store={store} />
      </ModuleShell>
    </ModuleGate>
  );
};
