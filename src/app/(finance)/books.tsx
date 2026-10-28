import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { BooksView } from '../../features/finance/components/BooksView';

export default function BooksScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Books & Ledgers"
      subtitle={financeSectionDescriptions.books}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/books"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <BooksView />
    </ModuleShell>
  );
}
