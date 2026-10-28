import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { ProjectsView } from '../../features/finance/components/ProjectsView';

export default function ProjectsScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Projects & Grants"
      subtitle={financeSectionDescriptions.projects}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/projects"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <ProjectsView />
    </ModuleShell>
  );
}
