import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

export interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Donut: React.FC<DonutProps> = ({
  segments,
  size = 148,
  thickness = 18,
  centerContent,
  style,
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const arcs: { color: string; dash: number; offset: number }[] = [];
  let running = 0;
  for (const segment of segments) {
    const dash = (segment.value / total) * circumference;
    arcs.push({ color: segment.color, dash: Math.max(dash - 2, 0), offset: running });
    running += dash;
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View style={[styles.svgBox, { width: size, height: size, transform: [{ rotate: '-90deg' }] }]}>
        <Svg width={size} height={size}>
          {arcs.map((arc, index) => (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={arc.color}
              strokeWidth={thickness}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
              fill="none"
              strokeLinecap="butt"
            />
          ))}
        </Svg>
      </View>
      {centerContent ? <View style={styles.center}>{centerContent}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgBox: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
