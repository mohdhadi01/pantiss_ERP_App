import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

export interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  /** Rendered in the hole (e.g. "88% overall"). */
  centerContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * SVG conic-gradient donut — the web's compliance donut
 * (`conic-gradient(#10b981 0 88%, #f59e0b 88% 94%, #ef4444 94% 100%)`).
 */
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

  // Precompute each arc's dash/offset — no mutation during render.
  const arcs: Array<{ color: string; dash: number; offset: number }> = [];
  let running = 0;
  for (const segment of segments) {
    const dash = (segment.value / total) * circumference;
    arcs.push({ color: segment.color, dash: Math.max(dash - 2, 0), offset: running });
    running += dash;
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" originX={size / 2} originY={size / 2}>
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
        </G>
      </Svg>
      {centerContent ? <View style={styles.center}>{centerContent}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
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
