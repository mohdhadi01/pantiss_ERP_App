import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { BankingView } from '../../features/finance/components/BankingView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const BankingScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Banking & treasury operations"}
        subtitle={"Real-time liquidity and bank feeds across institutional accounts."}
        currentRoute="/(finance)/banking"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <BankingView />
      </ModuleShell>
    </ModuleGate>
  );
};
