import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export interface ModuleGuardProps {
  /** 'finance' | 'human-resources' — web route-guard rule per module. */
  requiredModuleId: string;
  /** Web HRPage additionally requires role === 'hr-manager'. */
  requiredRole?: string;
  children: React.ReactNode;
}

const normalize = (moduleId: string): string => (moduleId === 'hr' ? 'human-resources' : moduleId);

/**
 * Route guard mirroring the web app: unauthenticated or wrong-module users
 * never see workspace screens — they are redirected to the modules page.
 * Waits for session restore before deciding, so refreshes don't flash a redirect.
 */
export const ModuleGuard: React.FC<ModuleGuardProps> = ({ requiredModuleId, requiredRole, children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { theme } = useTheme();

  const authorized =
    isAuthenticated &&
    !!user &&
    normalize(user.moduleId) === normalize(requiredModuleId) &&
    (!requiredRole || user.role === requiredRole);

  // Declarative redirect (web-parity): no imperative replace racing the
  // initial deep-link resolution.
  if (!isLoading && !authorized) {
    return <Redirect href="/modules/core-operations" />;
  }

  // IMPORTANT: the child navigator must stay mounted while auth restores.
  // Replacing it with a spinner makes expo-router find no navigator at the
  // deep-linked target and fall through to +not-found. Overlay instead.
  return (
    <>
      {children}
      {isLoading ? (
        <View style={[StyleSheet.absoluteFill, styles.loading, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.brandPrimary} />
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    elevation: 50,
  },
});
