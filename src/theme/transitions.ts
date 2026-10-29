import { SharedTransition } from 'react-native-reanimated';

export const cardHeroSharedTransition = SharedTransition.springify()
  .damping(24)
  .stiffness(150);
