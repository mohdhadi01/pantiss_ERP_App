import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { TaxationView } from '../../features/finance/components/TaxationView';
import type { FinanceStackNav, RootDrawerNav } from '../../navigation/types';

export const TaxationScreen: React.FC = () => {
  const navigation = useNavigation<FinanceStackNav>();
  const alerts = useFinanceAlerts();

  return (
    <ModuleGate moduleId="finance">
      <ModuleShell
        title={"Filings, credits & tax deducted"}
        subtitle={"Monitor GST filing, track input tax credit, and review total TDS."}
        currentRoute="/(finance)/taxation"
        avatarVariant="finance"
        searchPlaceholder="Search financial records"
        showAlerts
        unreadAlertsCount={alerts.unreadCount}
        onPressAlerts={() => navigation.navigate('Alerts')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <TaxationView />
      </ModuleShell>
    </ModuleGate>
  );
};
