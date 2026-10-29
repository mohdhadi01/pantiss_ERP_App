import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getInitials } from '../../utils/helpers';

export interface AvatarProps {
  name: string;
  initials?: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  initials,
  size = 36,
  color = '#ffffff',
  backgroundColor,
  style,
}) => {
  const displayInitials = initials || getInitials(name);

  const getHashColor = (str: string) => {
    const palette = [
      '#2563eb',
      '#059669',
      '#d97706',
      '#7c3aed',
      '#0891b2',
      '#db2777',
      '#4f46e5',
      '#ca8a04',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  };

  const bg = backgroundColor || getHashColor(name || 'User');

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize: Math.max(10, Math.round(size * 0.4)),
          },
        ]}
      >
        {displayInitials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
