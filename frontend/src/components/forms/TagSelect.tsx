import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllTags } from '../../services/tagService';
import { Tag } from '../../types/course';

interface TagSelectProps {
  selectedTags: string[];
  onChange: (tagIds: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export const TagSelect: React.FC<TagSelectProps> = ({ 
  selectedTags, 
  onChange, 
  multiple = true,
  className = ''
}) => {
  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags
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
  
  if (error) return <div className="text-red-500">Error loading tags</div>;

  return (
    <select
      multiple={multiple}
      value={selectedTags}
      onChange={handleChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      {tags.map((tag: Tag) => (
        <option key={tag._id} value={tag._id}>
          {tag.name}
        </option>
      ))}
    </select>
  );
};
