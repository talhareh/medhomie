import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../services/categoryService';
import { Category } from '../../types/course';

interface CategorySelectProps {
  selectedCategories: string[];
  onChange: (categoryIds: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ 
  selectedCategories, 
  onChange, 
  multiple = true,
  className = ''
}) => {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      onChange(selectedOptions);
    } else {
      onChange([e.target.value]);
    }
  };

  if (isLoading) return <div className="animate-pulse h-10 bg-gray-200 rounded"></div>;
  
  if (error) return <div className="text-red-500">Error loading categories</div>;

  return (
    <select
      multiple={multiple}
      value={selectedCategories}
      onChange={handleChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      {categories.map((category: Category) => (
        <option key={category._id} value={category._id}>
          {category.name}
        </option>
      ))}
    </select>
  );
};
