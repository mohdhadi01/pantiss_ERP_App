import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { InvestmentsView } from '../../features/finance/components/InvestmentsView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const InvestmentsScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Mutual Funds & Fixed Deposits Portfolio"}
        subtitle={"Capital preservation and yield optimization across institutional fixed deposits and mutual funds."}
        currentRoute="/(finance)/investments"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <InvestmentsView />
      </ModuleShell>
    </ModuleGate>
  );
};
