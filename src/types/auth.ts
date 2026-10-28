export type CoreOperationsRole =
  | 'finance-manager'
  | 'hr-manager'
  | 'me-manager'
  | 'communications-manager'
  | 'business-development-manager'
  | 'strategy-manager';

export type MESection = 'dashboard' | 'projects' | 'reports' | 'employee-status';

export interface AuthUser {
  id: string;
  name: string;
  initials: string;
  role: CoreOperationsRole | 'ceo' | 'coo' | 'cfo';
  roleLabel: string;
  moduleId: string;
  allowedSections: MESection[];
}

export interface DemoAccount extends AuthUser {
  password: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (id: string, password: string, remember?: boolean) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => Promise<void>;
}
