import { Platform, ViewStyle } from 'react-native';

export const shadows = {
  none: {},
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
    default: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    } as any,
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    android: {
      elevation: 3,
    },
    default: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    } as any,
  }),
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 6,
    },
    default: {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    } as any,
  }),
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1e293b',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.07,
      shadowRadius: 25,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 10px 25px rgba(30, 41, 59, 0.07)',
    } as any,
  }),
};
