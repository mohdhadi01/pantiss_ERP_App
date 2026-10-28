import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Icon } from '../ui/Icon';

export interface WelcomeSplashProps {
  onComplete: () => void;
  /** Renders loader-only chrome (no entry CTA) — used while fonts/hydration load. */
  loading?: boolean;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onComplete, loading = false }) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Layout calculation for responsive positioning
  const topOffset = Math.max(insets.top + 10, 44);
  const bottomOffset = Math.max(insets.bottom + 38, 54);
  const cardWidth = Math.min(160, (windowWidth - 44) / 2);

  // Core radar diameters matching Pantiss_ERP PageLoader.tsx
  // Web: [160, 240, 330, 430]
  const orbit1 = 150;
  const orbit2 = 230;
  const orbit3 = 310;
  const orbit4 = 390;

  // FuturisticCore size: 320px
  const coreSize = 320;
  const dashedRoseRadius = coreSize / 2 - 4; // ~156
  const dashedEmeraldRadius = (coreSize * 0.8) / 2 - 4; // ~124
  const satelliteRadius = (coreSize * 0.56) / 2 - 3; // ~86

  // Rotation shared values matching Pantiss_ERP PageLoader.tsx
  const rotateClockwise = useSharedValue(0);
  const rotateCounter = useSharedValue(0);
  const rotateSatellites = useSharedValue(0);
  const pulseRing = useSharedValue(1);
  const logoGlow = useSharedValue(0.35);

  // Equalizer bar heights animation for Monthly Impact (exact values from web)
  const barHeights = [0.55, 0.8, 0.45, 0.95, 0.7, 0.6, 0.85, 0.5, 0.72, 0.9];

  useEffect(() => {
    // 28s continuous clockwise rotation (matching web: duration 28)
    rotateClockwise.value = withRepeat(
      withTiming(360, { duration: 28000, easing: Easing.linear }),
      -1,
      false
    );

    // 18s continuous counter-clockwise rotation (matching web: duration 18)
    rotateCounter.value = withRepeat(
      withTiming(-360, { duration: 18000, easing: Easing.linear }),
      -1,
      false
    );

    // 9s satellite ring rotation (matching web: duration 9)
    rotateSatellites.value = withRepeat(
      withTiming(-360, { duration: 9000, easing: Easing.linear }),
      -1,
      false
    );

    // Breathing pulse for outer ring (matching web: duration 3.2s, opacity [0.06, 0.16, 0.06])
    pulseRing.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.98, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Center logo glow pulsing
    logoGlow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const clockwiseStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateClockwise.value}deg` }],
  }));

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateCounter.value}deg` }],
  }));

  const satelliteStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateSatellites.value}deg` }],
  }));

  // Breathing outer ring opacity: exact web range 0.06 to 0.16 on red-400/20
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseRing.value }],
    opacity: 0.7 + (pulseRing.value - 0.98) * 5,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: logoGlow.value,
    transform: [{ scale: 1 + (logoGlow.value - 0.3) * 0.15 }],
  }));

  const handleEnter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onComplete();
  };

  return (
    <View style={styles.container}>
      {/* ── Background Ambient Radial Red Glow & 52px Architectural Grid (matching web) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="ambientGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#dc2626" stopOpacity="0.12" />
              <Stop offset="40%" stopColor="#f43f5e" stopOpacity="0.05" />
              <Stop offset="75%" stopColor="#09090b" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {/* 52px background grid lines matching web GridLines() */}
          {Array.from({ length: Math.ceil(windowHeight / 52) }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1="0"
              y1={i * 52}
              x2={windowWidth}
              y2={i * 52}
              stroke="rgba(148, 163, 184, 0.04)"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: Math.ceil(windowWidth / 52) }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={i * 52}
              y1="0"
              x2={i * 52}
              y2={windowHeight}
              stroke="rgba(148, 163, 184, 0.04)"
              strokeWidth="1"
            />
          ))}
          <Circle cx="50%" cy="50%" r={windowWidth * 0.8} fill="url(#ambientGrad)" />
        </Svg>
      </View>

      {/* ── Orbit Rings (Exact web colors: border-white/10 and border-red-400/20) ── */}
      <View style={styles.orbitContainer} pointerEvents="none">
        {/* Ring 1 (150px) - border-white/10 */}
        <View style={[styles.staticRing, { width: orbit1, height: orbit1 }]} />

        {/* Ring 2 (230px) - border-white/10 */}
        <View style={[styles.staticRing, { width: orbit2, height: orbit2 }]} />

        {/* Ring 3 (310px) - border-white/10 */}
        <View style={[styles.staticRing, { width: orbit3, height: orbit3 }]} />

        {/* Outermost Ring (390px) - border-white/10 */}
        <View style={[styles.staticRing, { width: orbit4, height: orbit4 }]} />

        {/* Outermost Breathing Ring (390px) - border-red-400/20 with pulse */}
        <Animated.View
          style={[
            styles.breathingRing,
            { width: orbit4, height: orbit4 },
            pulseStyle,
          ]}
        />

        {/* ── FuturisticCore: Clockwise Dashed Rose Ring (28s, border-rose-300/15) ── */}
        <Animated.View style={[styles.rotatingRingWrapper, { width: coreSize, height: coreSize }, clockwiseStyle]}>
          <Svg width={coreSize} height={coreSize}>
            <Circle
              cx={coreSize / 2}
              cy={coreSize / 2}
              r={dashedRoseRadius}
              stroke="rgba(253, 164, 175, 0.15)"
              strokeWidth={1}
              strokeDasharray="6, 8"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* ── FuturisticCore: Counter-Clockwise Dashed Emerald Ring (18s, border-emerald-300/20) ── */}
        <Animated.View style={[styles.rotatingRingWrapper, { width: coreSize * 0.8, height: coreSize * 0.8 }, counterStyle]}>
          <Svg width={coreSize * 0.8} height={coreSize * 0.8}>
            <Circle
              cx={(coreSize * 0.8) / 2}
              cy={(coreSize * 0.8) / 2}
              r={dashedEmeraldRadius}
              stroke="rgba(110, 231, 183, 0.20)"
              strokeWidth={1}
              strokeDasharray="4, 10"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* ── FuturisticCore: Satellites Ring (9s, border-red-300/15) with Satellite Dots ── */}
        <Animated.View style={[styles.rotatingRingWrapper, { width: coreSize * 0.56, height: coreSize * 0.56 }, satelliteStyle]}>
          <Svg width={coreSize * 0.56} height={coreSize * 0.56}>
            <Circle
              cx={(coreSize * 0.56) / 2}
              cy={(coreSize * 0.56) / 2}
              r={satelliteRadius}
              stroke="rgba(252, 165, 165, 0.15)"
              strokeWidth={1}
              fill="none"
            />
            {/* Top Rose Satellite Dot (size 1.5 bg-rose-300 with glow) */}
            <Circle cx={(coreSize * 0.56) / 2} cy={3} r={3} fill="#fda4af" />
            {/* Bottom-Right Emerald Satellite Dot (size 1 bg-emerald-300 with glow) */}
            <Circle cx={(coreSize * 0.56) * 0.82} cy={(coreSize * 0.56) * 0.82} r={2.5} fill="#6ee7b7" />
          </Svg>
        </Animated.View>

        {/* ── FuturisticCore: Reticle Crosshair Ticks ── */}
        <View style={styles.reticleCrosshair}>
          <View style={[styles.reticleLineVertical, { top: -coreSize * 0.5 }]} />
          <View style={[styles.reticleLineVertical, { bottom: -coreSize * 0.5 }]} />
          <View style={[styles.reticleLineHorizontal, { left: -coreSize * 0.5 }]} />
          <View style={[styles.reticleLineHorizontal, { right: -coreSize * 0.5 }]} />
        </View>

        {/* ── Connection Lines (matching web ConnectionLine) ── */}
        <LinearGradient
          colors={['rgba(248, 113, 113, 0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.connectionLine, { top: -65, left: -180, width: 65 }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(248, 113, 113, 0.35)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.connectionLine, { bottom: -60, right: -180, width: 60 }]}
        />

        {/* ── Activity Dots (matching web ActivityDot) ── */}
        <View style={[styles.activityDot, { top: -115, left: -130 }]} />
        <View style={[styles.activityDot, { bottom: -110, right: -130 }]} />
        <View style={[styles.activityDot, { top: -150, left: -30 }]} />
      </View>

      {/* ── ALL 4 FLOATING KPI / METRIC CARDS (Exact web styles) ── */}

      {/* 1. Top Left: Total Programs */}
      <Animated.View
        entering={FadeInDown.delay(250).duration(500)}
        style={[
          styles.statCard,
          {
            top: topOffset,
            left: 16,
            width: cardWidth,
          },
        ]}
      >
        <Text style={styles.statLabel}>TOTAL PROGRAMS</Text>
        <Text style={styles.statValue}>1,248</Text>
        <Text style={[styles.statChange, { color: '#34d399' }]}>↑ 12.4% this quarter</Text>
      </Animated.View>

      {/* 2. Top Right: Beneficiaries */}
      <Animated.View
        entering={FadeInDown.delay(350).duration(500)}
        style={[
          styles.statCard,
          {
            top: topOffset,
            right: 16,
            width: cardWidth,
          },
        ]}
      >
        <Text style={styles.statLabel}>BENEFICIARIES</Text>
        <Text style={styles.statValue}>84,309</Text>
        <Text style={[styles.statChange, { color: '#fb7185' }]}>↑ 8.1% vs last month</Text>
      </Animated.View>

      {/* 3. Bottom Left: Monthly Impact Animated 10-Bar Equalizer Chart */}
      <Animated.View
        entering={FadeInUp.delay(450).duration(500)}
        style={[
          styles.statCard,
          {
            bottom: bottomOffset,
            left: 16,
            width: cardWidth,
          },
        ]}
      >
        <Text style={styles.statLabel}>MONTHLY IMPACT</Text>
        <View style={styles.barChartRow}>
          {barHeights.map((h, i) => (
            <LinearGradient
              key={i}
              colors={['#fb7185', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.equalizerBar,
                {
                  height: h * 28,
                  width: Math.max(4, (cardWidth - 52) / 10),
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* 4. Bottom Right: Active Donors */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(500)}
        style={[
          styles.statCard,
          {
            bottom: bottomOffset,
            right: 16,
            width: cardWidth,
          },
        ]}
      >
        <Text style={styles.statLabel}>ACTIVE DONORS</Text>
        <Text style={styles.statValue}>3,720</Text>
        <Text style={[styles.statChange, { color: '#fb7185' }]}>↑ 5.6% this month</Text>
      </Animated.View>

      {/* ── Central Main Hero Content ── */}
      <Animated.View
        entering={FadeIn.delay(100).duration(500)}
        style={styles.centerContent}
      >
        {/* Logo with Soft Blurred Ambient Glow */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.logoGlowAura, glowStyle]} />
          <Image
            source={require('@/assets/images/pantiss-mark-transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Wordmark Titles */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(450)}
          style={styles.textColumn}
        >
          <Text style={styles.titleText}>Pantiss ERP</Text>
          <Text style={styles.groupSubtitle}>GROUP OF NON-PROFITS</Text>
          <Text style={styles.descText}>
            One connected workspace for programs, people, finance and partnerships.
          </Text>
        </Animated.View>

        {/* Entry Action Button */}
        {!loading && (
        <Animated.View
          entering={FadeInUp.delay(450).duration(450)}
          style={styles.actionColumn}
        >
          <Pressable
            onPress={handleEnter}
            style={({ pressed }) => [
              styles.enterButton,
              { transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.enterButtonGradient}
            >
              <Text style={styles.enterButtonText}>Enter workspace</Text>
              <Icon name="ArrowRight" size={17} color="#ffffff" strokeWidth={2.4} />
            </LinearGradient>
          </Pressable>

          {/* Secure Access Indicator */}
          <View style={styles.secureBadge}>
            <Icon name="ShieldCheck" size={14} color="#34d399" />
            <Text style={styles.secureText}>SECURE ORGANIZATIONAL ACCESS</Text>
          </View>
        </Animated.View>
        )}
      </Animated.View>

      {/* ── Footnote Bottom ── */}
      <View style={[styles.footerNote, { bottom: Math.max(insets.bottom + 10, 14) }]}>
        <Text style={styles.footerText}>
          PROGRAMS · PEOPLE · PARTNERSHIPS
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  orbitContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staticRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  breathingRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.18)',
  },
  rotatingRingWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleCrosshair: {
    position: 'absolute',
    width: 2,
    height: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleLineVertical: {
    position: 'absolute',
    width: 1,
    height: 22,
    backgroundColor: 'rgba(254, 205, 211, 0.16)',
  },
  reticleLineHorizontal: {
    position: 'absolute',
    height: 1,
    width: 22,
    backgroundColor: 'rgba(167, 243, 208, 0.16)',
  },
  connectionLine: {
    position: 'absolute',
    height: 1,
  },
  activityDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 8,
    elevation: 4,
  },
  statCard: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 20,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.40)',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#ffffff',
  },
  statChange: {
    fontSize: 10,
    fontWeight: '600',
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 30,
    marginTop: 4,
  },
  equalizerBar: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    maxWidth: 320,
    zIndex: 10,
  },
  logoWrapper: {
    position: 'relative',
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlowAura: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  textColumn: {
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#ffffff',
  },
  groupSubtitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 2.2,
    color: 'rgba(255, 255, 255, 0.38)',
  },
  descText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.52)',
    marginTop: 2,
  },
  actionColumn: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  enterButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  enterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 205, 211, 0.22)',
  },
  enterButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 1.4,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  footerNote: {
    position: 'absolute',
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.2)',
  },
});
