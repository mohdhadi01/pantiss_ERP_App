import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

export interface TextFieldProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  /** Hint under the field. */
  hint?: string;
  error?: string;
  secure?: boolean;
  /** Right-side static adornment (unit suffix like "%" or "₹"). */
  suffix?: string;
  /** Right-side pressable element (replaces secure toggle when provided). */
  rightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
}

/**
 * Web-parity form input: 48px tall, radius 8, 1.5px border, tinted fill,
 * focus ring in `--brand-ring` (approximated with a soft glow).
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  hint,
  error,
  secure,
  suffix,
  rightElement,
  containerStyle,
  inputStyle,
  multiline,
  ...inputProps
}) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  const borderColor = error
    ? theme.colors.dangerBorder
    : focused
      ? theme.colors.brandPrimary
      : theme.isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : '#e5e7eb';

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.fieldRow,
          {
            backgroundColor: focused
              ? theme.isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : '#ffffff'
              : theme.colors.inputBg,
            borderColor,
            borderRadius: multiline ? 10 : 8,
            minHeight: multiline ? 88 : 48,
            alignItems: multiline ? 'flex-start' : 'center',
            ...(focused ? (theme.shadows.sm as object) : null),
            shadowColor: theme.colors.brandPrimary,
          },
        ]}
      >
        <TextInput
          {...inputProps}
          multiline={multiline}
          secureTextEntry={secure && !reveal}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.textGhost}
          selectionColor={theme.colors.brandPrimary}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            { color: theme.colors.text },
            inputStyle,
          ]}
        />
        {suffix && !multiline ? (
          <Text style={[styles.suffix, { color: theme.colors.textSubtle }]}>{suffix}</Text>
        ) : null}
        {rightElement ??
          (secure ? (
            <Pressable
              accessibilityLabel={reveal ? 'Hide password' : 'Show password'}
              onPress={() => setReveal((v) => !v)}
              style={styles.trailing}
            >
              <Icon name={reveal ? 'EyeOff' : 'Eye'} size={17} color={theme.colors.textSubtle} />
            </Pressable>
          ) : null)}
      </View>
      {error ? (
        <Text style={[styles.error, { color: theme.colors.dangerText }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: theme.colors.textSubtle }]}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  fieldRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 2,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },
  inputMultiline: {
    paddingTop: 12,
    textAlignVertical: 'top',
    minHeight: 84,
  },
  suffix: {
    fontSize: 13,
    fontWeight: '500',
  },
  trailing: {
    padding: 6,
    marginRight: -6,
  },
  error: {
    fontSize: 11,
    fontWeight: '500',
  },
  hint: {
    fontSize: 11,
  },
});
