import type {
  DrawerNavigationProp,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type DrawerSection = 'finance' | 'hr' | 'none';

export type PublicStackParamList = {
  Landing: undefined;
  Modules: { categoryId: string } | undefined;
  Login: { moduleId?: string } | undefined;
  NotFound: undefined;
};

export type FinanceStackParamList = {
  FinanceDashboard: undefined;
  AreaDashboard: { areaId: string };
  Budget: undefined;
  Books: undefined;
  Banking: undefined;
  VendorManagement: undefined;
  Procurement: undefined;
  FinanceSalary: undefined;
  Reimbursement: undefined;
  Payments: undefined;
  Taxation: undefined;
  AuditTrails: undefined;
  Projects: { area?: string } | undefined;
  Invoices: undefined;
  Investments: undefined;
  Alerts: undefined;
};

export type HrStackParamList = {
  HrDashboard: undefined;
  Recruitment: undefined;
  EmployeeOnboarding: undefined;
  ProjectAssignment: { employee?: string } | undefined;
  JobDesignations: undefined;
  HrSalary: undefined;
  Attendance: undefined;
  LeaveManagement: undefined;
  KbiMetrics: undefined;
  Appraisals: undefined;
};

export type RootDrawerParamList = {
  PublicStack: NavigatorScreenParams<PublicStackParamList>;
  FinanceStack: NavigatorScreenParams<FinanceStackParamList>;
  HrStack: NavigatorScreenParams<HrStackParamList>;
};

export type AppDrawerContentProps = DrawerContentComponentProps;

export type PublicStackNav = NativeStackNavigationProp<PublicStackParamList>;
export type FinanceStackNav = NativeStackNavigationProp<FinanceStackParamList>;
export type HrStackNav = NativeStackNavigationProp<HrStackParamList>;
export type RootDrawerNav = DrawerNavigationProp<RootDrawerParamList>;
