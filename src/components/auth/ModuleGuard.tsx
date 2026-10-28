import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  const authorized =
    isAuthenticated &&
    !!user &&
    normalize(user.moduleId) === normalize(requiredModuleId) &&
    (!requiredRole || user.role === requiredRole);

  useEffect(() => {
    if (!isLoading && !authorized) {
      router.replace('/modules/core-operations');
    }
  }, [isLoading, authorized, router]);

  if (isLoading || !authorized) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.brandPrimary} />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
