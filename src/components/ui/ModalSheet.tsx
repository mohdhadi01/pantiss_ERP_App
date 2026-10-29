import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Icon } from './Icon';

export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SHEET_WIDTHS: Record<Exclude<SheetSize, 'full'>, number> = {
  sm: 480,
  md: 620,
  lg: 780,
  xl: 1040,
};

export interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  label?: string;
  labelColor?: string;
  title: string;
  description?: string;
  size?: SheetSize;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

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
  const maxWidth = size === 'full' ? undefined : SHEET_WIDTHS[size];
  const sheetBg = theme.isDark ? '#0e121b' : '#ffffff';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={[styles.backdrop, { opacity: visible ? 1 : 0 }]}
        />

        {wide ? (
          <View style={styles.centerWrap} pointerEvents="box-none">
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: sheetBg,
                  borderRadius: theme.radii.card,
                  width: '92%',
                  maxWidth,
                  ...(theme.shadows.lg as object),
                },
              ]}
            >
              <SheetChrome
                {...{ theme, label, labelColor, title, description, onClose, footer, insets, grabber: false }}
              >
                {children}
              </SheetChrome>
            </View>
          </View>
        ) : (
          <View style={styles.bottomWrap} pointerEvents="box-none">
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: sheetBg,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  width: '100%',
                  maxHeight: '92%',
                  paddingBottom: insets.bottom,
                  ...(theme.shadows.lg as object),
                },
              ]}
            >
              <SheetChrome
                {...{ theme, label, labelColor, title, description, onClose, footer, insets, grabber: true }}
              >
                {children}
              </SheetChrome>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const SheetChrome: React.FC<{
  theme: ReturnType<typeof useTheme>['theme'];
  label?: string;
  labelColor?: string;
  title: string;
  description?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  insets: { top: number; bottom: number; left: number; right: number };
  grabber: boolean;
  children: React.ReactNode;
}> = ({ theme, label, labelColor, title, description, onClose, footer, insets, grabber, children }) => (
  <>
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      {grabber ? (
        <View style={styles.grabberWrap}>
          <View style={[styles.grabber, { backgroundColor: theme.colors.borderStrong }]} />
        </View>
      ) : null}
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
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel="Close dialog"
          onPress={onClose}
          hitSlop={6}
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
      contentContainerStyle={[styles.bodyContent, { paddingBottom: footer ? 28 : 28 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      {children}
    </ScrollView>

    {footer ? (
      <View
        style={[
          styles.footer,
          { borderTopColor: theme.colors.border, paddingBottom: 16 + (grabber ? 0 : insets.bottom) },
        ]}
      >
        {footer}
      </View>
    ) : null}
  </>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bottomWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderWidth: 1,
    borderColor: 'rgba(128, 144, 168, 0.16)',
    overflow: 'hidden',
    maxHeight: '92%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  grabberWrap: {
    alignItems: 'center',
    paddingVertical: 6,
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
