import React, { createContext, useState, useCallback } from 'react';
import { CategorySlug } from '../types/modules';

export interface CategoryContextValue {
  selectedCategory: CategorySlug;
  selectCategory: (id: CategorySlug) => void;
  setSelectedCategory: (id: CategorySlug) => void;
}

export const CategoryContext = createContext<CategoryContextValue | null>(null);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>('core-operations');

  const selectCategory = useCallback((id: CategorySlug) => {
    setSelectedCategory(id);
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        selectedCategory,
        selectCategory,
        setSelectedCategory: selectCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
