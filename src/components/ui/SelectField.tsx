import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import { ModalSheet } from './ModalSheet';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectFieldProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  accent?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  accent,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const accentColor = accent ?? theme.colors.brandPrimary;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      ) : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: theme.colors.inputBg,
            borderColor: error ? theme.colors.dangerBorder : theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
            opacity: disabled ? 0.55 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            { color: selected ? theme.colors.text : theme.colors.textGhost },
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="ChevronDown" size={16} color={theme.colors.textSubtle} />
      </Pressable>
      {error ? (
        <Text style={[styles.error, { color: theme.colors.dangerText }]}>{error}</Text>
      ) : null}

      <ModalSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label ?? placeholder}
        size="sm"
      >
        <View style={styles.optionList}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: isSelected
                      ? `${accentColor}14`
                      : pressed
                        ? theme.colors.surfaceSoft
                        : 'transparent',
                    borderColor: isSelected ? `${accentColor}33` : 'transparent',
                  },
                ]}
              >
                <View style={styles.optionText}>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isSelected ? accentColor : theme.colors.text, fontWeight: isSelected ? '600' : '500' },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.description ? (
                    <Text style={[styles.optionDescription, { color: theme.colors.textMuted }]}>
                      {option.description}
                    </Text>
                  ) : null}
                </View>
                {isSelected ? <Icon name="Check" size={16} color={accentColor} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ModalSheet>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  error: {
    fontSize: 11,
    fontWeight: '500',
  },
  optionList: {
    gap: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    fontSize: 13.5,
  },
  optionDescription: {
    fontSize: 11,
    marginTop: 2,
  },
});
