import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Polygon,
  Line,
} from 'react-native-svg';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { categories } from '../../data/modules';
import { CategorySlug, ModuleItem } from '../../types/modules';
import { ModuleCard } from '../../components/cards/ModuleCard';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { WorkspaceRail } from '../../components/navigation/WorkspaceRail';
import { Icon } from '../../components/ui/Icon';
import Animated, { FadeIn } from 'react-native-reanimated';
import { cardHeroSharedTransition } from '../../theme/transitions';
import { TopNavigation } from '../../components/layout/TopNavigation';
import { LoginModal } from '../../components/auth/LoginModal';
import type {
  PublicStackParamList,
  PublicStackNav,
  RootDrawerNav,
} from '../../navigation/types';

/**
 * Slanted Partition Background matching web `.module-hero::after` and `.grid-pattern`
 * Exact web CSS: linear-gradient(105deg, transparent 0 72%, rgba(255,255,255,.025) 72% 72.3%, transparent 72.3%)
 * with ambient glow: bg-gradient-to-br opacity-[0.07] blur-3xl.
 */
interface CategorySlantBackgroundProps {
  categoryId: CategorySlug;
  accentColors: [string, string];
  isDesktop?: boolean;
  isDark?: boolean;
}

const CategorySlantBackground: React.FC<CategorySlantBackgroundProps> = ({
  categoryId,
  accentColors,
  isDesktop = false,
  isDark = true,
}) => {
  // On desktop: partition starts at ~73% top, 65% bottom (105deg slant)
  // On mobile: partition starts at ~72% top, 59% bottom (105deg slant)
  const topX = isDesktop ? 73 : 72;
  const bottomX = isDesktop ? 65 : 59;
  const glowId = `ambient-glow-${categoryId}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {/* Ambient soft glow matching web: bg-gradient-to-br ${category.accent} opacity-[0.07] blur-3xl */}
          <RadialGradient
            id={glowId}
            cx="88%"
            cy="12%"
            r="60%"
            fx="88%"
            fy="12%"
          >
            <Stop offset="0%" stopColor={accentColors[0]} stopOpacity={isDark ? "0.22" : "0.14"} />
            <Stop offset="38%" stopColor={accentColors[1]} stopOpacity={isDark ? "0.10" : "0.06"} />
            <Stop offset="75%" stopColor={accentColors[1]} stopOpacity={isDark ? "0.02" : "0.01"} />
            <Stop offset="100%" stopColor={accentColors[1]} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient soft glow fill */}
        <Polygon points="0,0 100,0 100,100 0,100" fill={`url(#${glowId})`} />

        {/* Slanted partition line matching web: .module-hero::after (105deg) */}
        <Line
          x1={topX}
          y1={0}
          x2={bottomX}
          y2={100}
          stroke={isDark ? "rgba(255, 255, 255, 0.035)" : "rgba(15, 23, 42, 0.05)"}
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />

        {/* Delicate Blueprint Grid Pattern matching web: .grid-pattern */}
        <Line
          x1={isDesktop ? 86 : 84}
          y1={0}
          x2={isDesktop ? 86 : 84}
          y2={100}
          stroke={isDark ? "rgba(128, 144, 168, 0.035)" : "rgba(15, 23, 42, 0.04)"}
          strokeWidth="0.6"
          strokeDasharray="2, 4"
          vectorEffect="non-scaling-stroke"
        />
        <Line
          x1={bottomX}
          y1={48}
          x2={100}
          y2={48}
          stroke={isDark ? "rgba(128, 144, 168, 0.035)" : "rgba(15, 23, 42, 0.04)"}
          strokeWidth="0.6"
          strokeDasharray="2, 4"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
    </View>
  );
};

export const ModulesScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<PublicStackNav>();
  const route = useRoute<RouteProp<PublicStackParamList, 'Modules'>>();
  const params = route.params;
  const { width: windowWidth } = useWindowDimensions();

  const isDesktop = windowWidth >= 780;
  const isWideDesktop = windowWidth >= 1140;
  const isTablet = windowWidth >= 780 && windowWidth < 1140;

  const routeCategoryId = params?.categoryId;
  const initialSlug = (routeCategoryId as CategorySlug) || 'core-operations';
  const [activeCategorySlug, setActiveCategorySlug] = useState<CategorySlug>(initialSlug);

  React.useEffect(() => {
    if (routeCategoryId && routeCategoryId !== activeCategorySlug) {
      setActiveCategorySlug(routeCategoryId as CategorySlug);
    }
  }, [routeCategoryId]);

  const categoryIndex = categories.findIndex((c) => c.id === activeCategorySlug);
  const category =
    categories.find((c) => c.id === activeCategorySlug) || categories[0];

  const handleSelectCategory = (newSlug: CategorySlug) => {
    if (newSlug === activeCategorySlug) return;
    Haptics.selectionAsync().catch(() => {});
    setActiveCategorySlug(newSlug);
    navigation.setParams({ categoryId: newSlug });
  };

  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);

  const handleSelectModule = (mod: ModuleItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (mod.status === 'Soon') return;

    if (mod.id === 'human-resources' || mod.id === 'hr') {
      if (
        isAuthenticated &&
        (user?.moduleId === 'human-resources' || user?.moduleId === 'hr')
      ) {
        navigation.getParent<RootDrawerNav>()?.reset({
          index: 0,
          routes: [{ name: 'HrStack', params: { screen: 'HrDashboard' } }],
        });
      } else {
        setSelectedModule(mod);
        setLoginModalVisible(true);
      }
      return;
    }

    if (mod.id === 'finance') {
      if (isAuthenticated && user?.moduleId === 'finance') {
        navigation.getParent<RootDrawerNav>()?.reset({
          index: 0,
          routes: [{ name: 'FinanceStack', params: { screen: 'FinanceDashboard' } }],
        });
      } else {
        setSelectedModule(mod);
        setLoginModalVisible(true);
      }
      return;
    }

    // Default: open login modal for other modules to authenticate
    setSelectedModule(mod);
    setLoginModalVisible(true);
  };

  const cardBgColors: [string, string] = isDark
    ? ['rgba(24, 32, 46, 0.98)', 'rgba(11, 14, 21, 0.96)']
    : ['rgba(255, 255, 255, 0.96)', 'rgba(242, 245, 251, 0.88)'];

  const cardBorderAndShadow = isDark
    ? {
        borderColor: 'rgba(255, 255, 255, 0.075)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 4,
        ...Platform.select({
          web: { boxShadow: '0 22px 80px rgba(0, 0, 0, 0.25)' } as any,
        }),
      }
    : {
        borderColor: 'rgba(15, 23, 42, 0.08)',
        shadowColor: '#202d46',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 3,
        ...Platform.select({
          web: { boxShadow: '0 18px 60px rgba(32, 45, 70, 0.08)' } as any,
        }),
      };

  const cardBorderAndShadowDesktop = isDark
    ? {
        borderColor: 'rgba(255, 255, 255, 0.075)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 22 },
        shadowOpacity: 0.25,
        shadowRadius: 36,
        elevation: 4,
        ...Platform.select({
          web: { boxShadow: '0 22px 80px rgba(0, 0, 0, 0.25)' } as any,
        }),
      }
    : {
        borderColor: 'rgba(15, 23, 42, 0.08)',
        shadowColor: '#202d46',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        elevation: 3,
        ...Platform.select({
          web: { boxShadow: '0 18px 60px rgba(32, 45, 70, 0.08)' } as any,
        }),
      };

  /* Mobile-Specific Hero Card matching web module-hero */
  const renderMobileHeroCard = () => (
    <Animated.View
      sharedTransitionTag={`category-shell-${category.id}`}
      sharedTransitionStyle={cardHeroSharedTransition}
      style={[styles.mobileBannerCard, cardBorderAndShadow]}
    >
      {/* Exact Web Card Background Gradient: --card-bg */}
      <LinearGradient
        colors={cardBgColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Slanted partition line, ambient glow and blueprint grid */}
      <CategorySlantBackground
        categoryId={category.id}
        accentColors={category.accentColors}
        isDesktop={false}
        isDark={isDark}
      />

      {/* Watermark Number: exact web opacity */}
      <Text
        style={[
          styles.mobileWatermarkNumber,
          { color: theme.colors.text, opacity: isDark ? 0.025 : 0.035 },
        ]}
        pointerEvents="none"
      >
        {String((categoryIndex >= 0 ? categoryIndex : 0) + 1).padStart(2, '0')}
      </Text>

      {/* Top Row: Icon Box on Left, Available Badge on Right */}
      <View style={styles.mobileBannerTopRow}>
        <Animated.View
          sharedTransitionTag={`category-icon-${category.id}`}
          sharedTransitionStyle={cardHeroSharedTransition}
        >
          {/* Icon Box with colorful glow shadow matching web shadow-[0_12px_32px_var(--card-glow)] */}
          <LinearGradient
            colors={category.accentColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.mobileBannerIconBox,
              {
                shadowColor: category.glowColor,
                ...Platform.select({
                  web: {
                    boxShadow: `0 12px 32px ${category.glowColor}`,
                  } as any,
                }),
              },
            ]}
          >
            <Icon name={category.iconName} size={22} color="#ffffff" strokeWidth={1.8} />
          </LinearGradient>
        </Animated.View>

        {/* Available Badge matching web: border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-subtle)] */}
        <View
          style={[
            styles.mobileAvailableBadge,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceSoft,
            },
          ]}
        >
          <Text
            style={[
              styles.mobileAvailableBadgeText,
              { color: theme.colors.textSubtle },
            ]}
          >
            {category.modules.length} available
          </Text>
        </View>
      </View>

      {/* Content Block: Full-width Title (NO wrapping!), Eyebrow & Description */}
      <View style={styles.mobileBannerContent}>
        <Text
          style={[
            styles.mobileBannerEyebrow,
            { color: theme.colors.textSubtle },
          ]}
        >
          {category.eyebrow.toUpperCase()} WORKSPACE
        </Text>
        <Animated.Text
          sharedTransitionTag={`category-title-${category.id}`}
          sharedTransitionStyle={cardHeroSharedTransition}
          style={[
            styles.mobileBannerTitle,
            { color: theme.colors.text },
          ]}
          numberOfLines={1}
        >
          {category.title}
        </Animated.Text>
        <Text
          style={[
            styles.mobileBannerDesc,
            { color: theme.colors.textMuted },
          ]}
        >
          {category.description}{' '}
          {category.id === 'cxo'
            ? 'Select your executive role to sign in.'
            : 'Select an operating module to continue.'}
        </Text>
      </View>
    </Animated.View>
  );

  /* Desktop-Specific Hero Card matching web module-hero */
  const renderDesktopHeroCard = () => (
    <Animated.View
      sharedTransitionTag={`category-shell-${category.id}`}
      sharedTransitionStyle={cardHeroSharedTransition}
      style={[styles.bannerCard, cardBorderAndShadowDesktop]}
    >
      {/* Exact Web Card Background Gradient: --card-bg */}
      <LinearGradient
        colors={cardBgColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Slanted partition line, ambient glow and blueprint grid */}
      <CategorySlantBackground
        categoryId={category.id}
        accentColors={category.accentColors}
        isDesktop={true}
        isDark={isDark}
      />

      <Text
        style={[
          styles.watermarkNumber,
          { color: theme.colors.text, opacity: isDark ? 0.025 : 0.035 },
        ]}
        pointerEvents="none"
      >
        {String((categoryIndex >= 0 ? categoryIndex : 0) + 1).padStart(2, '0')}
      </Text>

      <View style={styles.bannerBody}>
        <Animated.View
          sharedTransitionTag={`category-icon-${category.id}`}
          sharedTransitionStyle={cardHeroSharedTransition}
        >
          {/* Icon Box with colorful glow shadow matching web shadow-[0_12px_32px_var(--card-glow)] */}
          <LinearGradient
            colors={category.accentColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.bannerIconBox,
              {
                shadowColor: category.glowColor,
                ...Platform.select({
                  web: {
                    boxShadow: `0 12px 32px ${category.glowColor}`,
                  } as any,
                }),
              },
            ]}
          >
            <Icon name={category.iconName} size={25} color="#ffffff" strokeWidth={1.75} />
          </LinearGradient>
        </Animated.View>

        <View style={styles.bannerTextCol}>
          <Text style={[styles.bannerEyebrow, { color: theme.colors.textSubtle }]}>
            {category.eyebrow.toUpperCase()} WORKSPACE
          </Text>
          <Animated.Text
            sharedTransitionTag={`category-title-${category.id}`}
            sharedTransitionStyle={cardHeroSharedTransition}
            style={[styles.bannerTitle, { color: theme.colors.text }]}
          >
            {category.title}
          </Animated.Text>
          <Text style={[styles.bannerDesc, { color: theme.colors.textMuted }]}>
            {category.description}{' '}
            {category.id === 'cxo'
              ? 'Select your executive role to sign in.'
              : 'Select an operating module to continue.'}
          </Text>
        </View>

        <View
          style={[
            styles.availableBadge,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceSoft,
            },
          ]}
        >
          <Text
            style={[
              styles.availableBadgeText,
              { color: theme.colors.textSubtle },
            ]}
          >
            {category.modules.length} available
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderModulesGrid = () => (
    <View style={styles.modulesGrid}>
      {category.modules.map((mod, index) => {
        const cardWidth = isWideDesktop
          ? '31.8%'
          : isTablet
          ? '48.5%'
          : '100%';

        return (
          <View key={mod.id} style={{ width: cardWidth as any }}>
            <ModuleCard
              module={mod}
              index={index}
              onSelect={handleSelectModule}
            />
          </View>
        );
      })}
    </View>
  );

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.scrollContent}>
      {/* Top Header matching Pantiss_ERP TopNavigation */}
      <TopNavigation canGoBack subtitle="/ Workspace" />

      {/* Main Content Area */}
      <View style={styles.content}>
        {isDesktop ? (
          /* Desktop / Tablet Layout: Left 210px Rail + Right Content */
          <View style={styles.twoColumnRow}>
            <View style={styles.leftRailColumn}>
              <WorkspaceRail
                active={category.id}
                onSelect={handleSelectCategory}
                layout="vertical"
              />
            </View>
            <Animated.View
              key={category.id}
              entering={FadeIn.duration(200)}
              style={styles.rightContentColumn}
            >
              <Breadcrumb current={category.title} parentLabel="Workspace" />
              {renderDesktopHeroCard()}

              <View style={styles.sectionHeadingRow}>
                <View>
                  <Text style={[styles.sectionHeadingTitle, { color: theme.colors.text }]}>
                    {category.id === 'cxo' ? 'Executive monitoring' : 'Modules'}
                  </Text>
                  <Text style={[styles.sectionHeadingSub, { color: theme.colors.textSubtle }]}>
                    Continue to the workspace you need.
                  </Text>
                </View>
                <Text style={[styles.updatedJustNow, { color: theme.colors.textSubtle }]}>
                  Updated just now
                </Text>
              </View>

              {renderModulesGrid()}
            </Animated.View>
          </View>
        ) : (
          /* Mobile-Optimized Layout: Sleek Horizontal Workspaces at top, then Mobile Card */
          <View style={styles.mobileLayout}>
            {/* Upper options: same theme, horizontal scroll, compact height */}
            <WorkspaceRail
              active={category.id}
              onSelect={handleSelectCategory}
              layout="horizontal"
            />

            {/* Smooth in-place transition: NO screen blink, NO reload */}
            <Animated.View
              key={category.id}
              entering={FadeIn.duration(220)}
              style={styles.mobileContentTransition}
            >
              {/* Breadcrumb */}
              <Breadcrumb current={category.title} parentLabel="Workspace" />

              {/* Mobile-Friendly Hero Card with Slanted Line & Distinct Color Theme */}
              {renderMobileHeroCard()}

              {/* Section Heading */}
              <View style={styles.sectionHeadingRow}>
                <View>
                  <Text style={[styles.sectionHeadingTitle, { color: theme.colors.text }]}>
                    {category.id === 'cxo' ? 'Executive monitoring' : 'Modules'}
                  </Text>
                  <Text style={[styles.sectionHeadingSub, { color: theme.colors.textSubtle }]}>
                    Continue to the workspace you need.
                  </Text>
                </View>
                <Text style={[styles.updatedJustNow, { color: theme.colors.textSubtle }]}>
                  Updated just now
                </Text>
              </View>

              {/* Modules Grid */}
              {renderModulesGrid()}
            </Animated.View>
          </View>
        )}
      </View>

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        module={selectedModule}
        onClose={() => setLoginModalVisible(false)}
        onSuccess={(loggedUser) => {
          setLoginModalVisible(false);
          if (loggedUser.moduleId === 'finance') {
            navigation.getParent<RootDrawerNav>()?.reset({
              index: 0,
              routes: [{ name: 'FinanceStack', params: { screen: 'FinanceDashboard' } }],
            });
          } else if (
            loggedUser.moduleId === 'human-resources' ||
            loggedUser.moduleId === 'hr'
          ) {
            navigation.getParent<RootDrawerNav>()?.reset({
              index: 0,
              routes: [{ name: 'HrStack', params: { screen: 'HrDashboard' } }],
            });
          }
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 0,
    paddingBottom: 64,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
  },

  /* Mobile Layout Styles */
  mobileLayout: {
    gap: 14,
  },
  mobileContentTransition: {
    gap: 14,
  },
  mobileBannerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 4,
  },
  mobileWatermarkNumber: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -44 }],
    fontSize: 88,
    lineHeight: 88,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '800',
    letterSpacing: -4,
    zIndex: 0,
  },
  mobileBannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    position: 'relative',
    zIndex: 1,
  },
  mobileBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  mobileAvailableBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  mobileAvailableBadgeText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  mobileBannerContent: {
    gap: 3,
    position: 'relative',
    zIndex: 1,
  },
  mobileBannerEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  mobileBannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  mobileBannerDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 3,
    maxWidth: '75%',
  },

  /* Desktop Layout Styles */
  twoColumnRow: {
    flexDirection: 'row',
    gap: 36,
    alignItems: 'flex-start',
  },
  leftRailColumn: {
    width: 210,
    flexShrink: 0,
  },
  rightContentColumn: {
    flex: 1,
    minWidth: 0,
  },
  bannerCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 28,
  },
  watermarkNumber: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -55 }],
    fontSize: 120,
    lineHeight: 120,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '800',
    letterSpacing: -6,
    zIndex: 0,
  },
  bannerBody: {
    padding: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    position: 'relative',
    zIndex: 1,
  },
  bannerIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 6,
  },
  bannerTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  bannerEyebrow: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 2,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  bannerDesc: {
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 480,
  },
  availableBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'center',
    zIndex: 2,
  },
  availableBadgeText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingTop: 4,
  },
  sectionHeadingTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionHeadingSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  updatedJustNow: {
    fontSize: 10,
    fontWeight: '500',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
