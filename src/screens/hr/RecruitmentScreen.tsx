import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useHR } from '../../features/hr/HRContext';
import { RecruitmentView } from '../../features/hr/components/RecruitmentView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const RecruitmentScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"Recruitment & Hiring"}
        subtitle={"Applicant pipeline, interview scheduling, and offer letter releases."}
        currentRoute="/(hr)/recruitment"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <RecruitmentView store={store} />
      </ModuleShell>
    </ModuleGate>
  );
};
