import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

export interface AnimatedNumberProps {
  /** Target numeric value. */
  value: number;
  /** Decimal places to render. */
  decimals?: number;
  /** Milliseconds (web uses 1200–1400ms easeOutCubic). */
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Count-up number — port of the web `AnimatedNumber`/`useCountUp`
 * (IntersectionObserver-free; starts on mount).
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  style,
}) => {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();

    const tick = () => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      const eased = easeOutCubic(progress);
      const current = from + (value - from) * eased;
      setDisplay(current);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Text style={[{ fontVariant: ['tabular-nums'] }, style]}>
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
};
