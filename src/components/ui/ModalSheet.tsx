import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Icon } from './Icon';

export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Web Overlay sizes: sm 480 / md 620 / lg 780 / xl 1040. */
const SHEET_WIDTHS: Record<Exclude<SheetSize, 'full'>, number> = {
  sm: 480,
  md: 620,
  lg: 780,
  xl: 1040,
};

export interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Web Overlay eyebrow label — rendered in the module accent. */
  label?: string;
  labelColor?: string;
  title: string;
  description?: string;
  size?: SheetSize;
  /** Sticky footer — action buttons row. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Web `Overlay.tsx` equivalent: bottom sheet on phones, centered panel ≥1024px.
 * Backdrop `rgba(0,0,0,0.48)` + fade (web `.zo-backdrop`).
 */
export const ModalSheet: React.FC<ModalSheetProps> = ({
  visible,
  onClose,
  label,
  labelColor,
  title,
  description,
  size = 'md',
  footer,
  children,
}) => {
  const { theme } = useTheme();
  const { isLg } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = React.useState(visible);

  useEffect(() => {
    if (visible) setRendered(true);
  }, [visible]);

  if (!rendered) return null;

  const wide = isLg && size !== 'full';
  const sheetWidth = size === 'full' ? '100%' as const : Math.min(SHEET_WIDTHS[size], 9999);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityLabel="Close"
            onPress={onClose}
            style={[styles.backdrop, { opacity: visible ? 1 : 0 }]}
          />
        </View>

        <View style={[styles.flex, wide ? styles.center : styles.bottom]}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.moduleBg,
                borderTopLeftRadius: wide ? theme.radii.card : 24,
                borderTopRightRadius: wide ? theme.radii.card : 24,
                borderRadius: wide ? theme.radii.card : 0,
                marginTop: wide ? 0 : insets.top,
                marginBottom: wide ? 0 : 0,
                maxHeight: '92%',
                width: typeof sheetWidth === 'string' ? sheetWidth : '92%',
                maxWidth: typeof sheetWidth === 'number' ? sheetWidth : undefined,
                ...(theme.shadows.lg as object),
              },
            ]}
          >
            <View
              style={[
                styles.header,
                { borderBottomColor: theme.colors.border, paddingTop: wide ? 20 : 12 },
              ]}
            >
              <View style={styles.grabberWrap}>
                {!wide ? <View style={[styles.grabber, { backgroundColor: theme.colors.borderStrong }]} /> : null}
              </View>
              <View style={styles.headingRow}>
                <View style={styles.headingText}>
                  {label ? (
                    <Text
                      style={[
                        theme.fontStyles.eyebrow,
                        styles.label,
                        { color: labelColor ?? theme.colors.brandPrimary },
                      ]}
                    >
                      {label}
                    </Text>
                  ) : null}
                  <Text numberOfLines={2} style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
                    {title}
                  </Text>
                  {description ? (
                    <Text style={[styles.description, { color: theme.colors.textMuted }]}>
                      {description}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityLabel="Close dialog"
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.close,
                    { backgroundColor: theme.colors.surfaceSoft, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Icon name="X" size={17} color={theme.colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={[styles.bodyContent, { paddingBottom: footer ? 0 : 32 + insets.bottom }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>

            {footer ? (
              <View style={[styles.footer, { borderTopColor: theme.colors.border, paddingBottom: 16 + insets.bottom }]}>
                {footer}
              </View>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bottom: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderWidth: 1,
    borderColor: 'rgba(128, 144, 168, 0.16)',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  grabberWrap: {
    alignItems: 'center',
    height: 14,
    justifyContent: 'center',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headingText: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 20,
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
});
