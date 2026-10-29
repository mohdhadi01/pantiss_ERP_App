import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { WelcomeSplash } from '../../components/animations/WelcomeSplash';
import type { PublicStackNav } from '../../navigation/types';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<PublicStackNav>();

  const handleEnter = () => {
    navigation.navigate('Landing');
  };

  return <WelcomeSplash onComplete={handleEnter} />;
};
