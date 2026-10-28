import { ComponentType } from 'react';

export interface NavItem {
  id: string;
  label: string;
  route: string;
  iconName: string;
  badge?: string | number;
}
