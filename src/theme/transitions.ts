import { SharedTransition } from 'react-native-reanimated';

/**
 * Custom spring shared transition matching Pantiss_ERP Framer Motion config:
 * transition={{ type: "spring", stiffness: 150, damping: 24 }}
 */
export const cardHeroSharedTransition = SharedTransition.springify()
  .damping(24)
  .stiffness(150);
