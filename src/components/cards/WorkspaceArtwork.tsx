import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { CategorySlug } from '../../types/modules';
import { Icon } from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';

export interface WorkspaceArtworkProps {
  category: CategorySlug;
  iconName: string;
  accentColors: [string, string];
}

function OperationsMap({ strokeColor, faintColor }: { strokeColor: string; faintColor: string }) {
  return (
    <Svg viewBox="0 0 260 150" style={StyleSheet.absoluteFill}>
      <Path
        d="M45 38H93C108 38 110 64 130 64S151 38 169 38h46"
        stroke={strokeColor}
        strokeWidth="1.2"
        fill="none"
      />
      <Path
        d="M45 112H92c20 0 18-27 38-27s20 27 39 27h46"
        stroke={faintColor}
        strokeWidth="1.2"
        fill="none"
      />
      <Path
        d="M45 38v74M215 38v74"
        stroke={faintColor}
        strokeWidth="1"
        strokeDasharray="4 4"
        fill="none"
      />
      <Rect x="29" y="28" width="32" height="20" rx="6" stroke={strokeColor} strokeWidth="1" fill="none" />
      <Rect x="199" y="28" width="32" height="20" rx="6" stroke={strokeColor} strokeWidth="1" fill="none" />
      <Rect x="29" y="102" width="32" height="20" rx="6" stroke={faintColor} strokeWidth="1" fill="none" />
      <Rect x="199" y="102" width="32" height="20" rx="6" stroke={faintColor} strokeWidth="1" fill="none" />
      <Circle cx="130" cy="75" r="37" stroke={faintColor} strokeWidth="1" fill="none" />
      <Circle cx="130" cy="75" r="27" stroke={strokeColor} strokeWidth="1" fill="none" />
    </Svg>
  );
}

function ThematicLayers({ strokeColor, faintColor }: { strokeColor: string; faintColor: string }) {
  return (
    <Svg viewBox="0 0 260 150" style={StyleSheet.absoluteFill}>
      <Path d="M47 44 130 18l83 26-83 26Z" stroke={faintColor} strokeWidth="1" fill="none" />
      <Path d="M47 67l83-26 83 26-83 26Z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
      <Path d="m47 90 83-26 83 26-83 27Z" stroke={strokeColor} strokeWidth="1.4" fill="none" />
      <Path
        d="M47 90v15l83 27 83-27V90"
        stroke={faintColor}
        strokeWidth="1"
        strokeDasharray="3 3"
        fill="none"
      />
      <Circle cx="130" cy="75" r="31" stroke={faintColor} strokeWidth="1" fill="none" />
    </Svg>
  );
}

function LeadershipNetwork({ strokeColor, faintColor }: { strokeColor: string; faintColor: string }) {
  return (
    <Svg viewBox="0 0 260 150" style={StyleSheet.absoluteFill}>
      <Path
        d="m130 75-75-35m75 35 76-35m-76 35-72 38m72-38 72 38"
        stroke={faintColor}
        strokeWidth="1"
        strokeDasharray="4 4"
        fill="none"
      />
      <Path d="M55 40 58 113M206 40l-4 73" stroke={faintColor} strokeWidth="1" fill="none" />
      <Circle cx="55" cy="40" r="9" stroke={strokeColor} strokeWidth="1" fill="none" />
      <Circle cx="206" cy="40" r="9" stroke={strokeColor} strokeWidth="1" fill="none" />
      <Circle cx="58" cy="113" r="9" stroke={strokeColor} strokeWidth="1" fill="none" />
      <Circle cx="202" cy="113" r="9" stroke={strokeColor} strokeWidth="1" fill="none" />
      <Circle cx="130" cy="75" r="35" stroke={strokeColor} strokeWidth="1" fill="none" />
      <Circle cx="130" cy="75" r="25" stroke={faintColor} strokeWidth="1" fill="none" />
    </Svg>
  );
}

export const WorkspaceArtwork: React.FC<WorkspaceArtworkProps> = ({
  category,
  iconName,
  accentColors,
}) => {
  const { isDark } = useTheme();

  const strokeColor = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.18)';
  const faintColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)';

  return (
    <View style={styles.container}>
      {category === 'core-operations' && (
        <OperationsMap strokeColor={strokeColor} faintColor={faintColor} />
      )}
      {category === 'thematic-areas' && (
        <ThematicLayers strokeColor={strokeColor} faintColor={faintColor} />
      )}
      {category === 'cxo' && (
        <LeadershipNetwork strokeColor={strokeColor} faintColor={faintColor} />
      )}

      {/* Floating Center Icon */}
      <View style={styles.centerIconWrapper}>
        <LinearGradient
          colors={accentColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBox}
        >
          <Icon name={iconName} size={22} color="#ffffff" strokeWidth={1.8} />
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 160,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  centerIconWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
