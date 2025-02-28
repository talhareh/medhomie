import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../services/categoryService';
import { getAllTags } from '../services/tagService';
import { Filters, CourseState } from '../types/course';

interface CourseFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({ filters, setFilters }) => {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search || ''}
            onChange={handleFilterChange}
            placeholder="Search courses..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="state"
            name="state"
            value={filters.state || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value={CourseState.DRAFT}>Draft</option>
            <option value={CourseState.ACTIVE}>Active</option>
            <option value={CourseState.INACTIVE}>Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
            Tag
          </label>
          <select
            id="tag"
            name="tag"
            value={filters.tag || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
