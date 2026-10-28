import React from 'react';
import * as LucideIcons from 'lucide-react-native';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#64748b',
  strokeWidth = 2,
  style,
}) => {
  // Normalize PascalCase or kebab-case name
  const pascalName = name
    .replace(/(^\w|-\w)/g, (clear) => clear.replace('-', '').toUpperCase());

  const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || LucideIcons.HelpCircle;

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
};
