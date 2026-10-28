import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import type { AuthUser } from '../types/auth';
import { LoginScreen } from '../screens/auth/LoginScreen';

const normalize = (moduleId: string): string =>
  moduleId === 'hr' ? 'human-resources' : moduleId;

export interface ModuleGateState {
  authorized: boolean;
  isLoading: boolean;
  user: AuthUser | null;
}

/**
 * Auth check per module — mirrors the web route-guard rule: the session must
 * be restored, the user's moduleId must match the module, and (for HR) the
 * role must match. Returns `{ authorized, isLoading, user }`.
 */
export function useModuleGate(
  requiredModuleId: string,
  requiredRole?: string,
): ModuleGateState {
  const { isAuthenticated, user, isLoading } = useAuth();

  const authorized =
    isAuthenticated &&
    !!user &&
    normalize(user.moduleId) === normalize(requiredModuleId) &&
    (!requiredRole || user.role === requiredRole);

  return { authorized, isLoading, user };
}

export interface ModuleGateProps {
  /** 'finance' | 'human-resources' — web route-guard rule per module. */
  moduleId: string;
  /** Web HRPage additionally requires role === 'hr-manager'. */
  role?: string;
  children: React.ReactNode;
}

/**
 * Gate wrapper for module screens. While the session restores it shows the
 * loading overlay; unauthorized visitors get the module login rendered inline
 * (web redirects to the module login); authorized users see the workspace.
 */
export const ModuleGate: React.FC<ModuleGateProps> = ({ moduleId, role, children }) => {
  const { authorized, isLoading } = useModuleGate(moduleId, role);
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.brandPrimary} />
      </View>
    );
  }

  if (!authorized) {
    return (
      <LoginScreen
        moduleId={moduleId}
        heading="Sign in to continue"
        showBackLink={false}
      />
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
