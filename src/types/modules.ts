
export type CategorySlug = 'core-operations' | 'thematic-areas' | 'cxo';

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  accentColors: [string, string];
  glowColor: string;
  status?: 'Live' | 'Soon';
  route?: string;
}

export interface Category {
  id: CategorySlug;
  eyebrow: string;
  title: string;
  description: string;
  iconName: string;
  accentColors: [string, string];
  glowColor: string;
  modules: ModuleItem[];
}
