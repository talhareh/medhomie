import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getAllTags, createTag, updateTag, deleteTag } from '../../services/tagService';
import { Tag } from '../../types/course';
import { UserRole } from '../../types/auth';

export const TagsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  // Fetch tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags
  });

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      toast.success('Tag created successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error creating tag');
    }
  });

  // Update tag mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      toast.success('Tag updated successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error updating tag');
    }
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      toast.success('Tag deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting tag');
    }
  });

  // Check if user is admin
  if (!user || user.role !== UserRole.ADMIN) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTag) {
      updateMutation.mutate({
        id: editingTag._id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name
    });
    setIsModalOpen(true);
  };

  const handleDelete = (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      deleteMutation.mutate(tagId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: ''
    });
    setEditingTag(null);
    setIsModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tags Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add New Tag
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tags found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <div key={tag._id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{tag.name}</h3>
                  <p className="text-sm text-gray-500">Slug: {tag.slug}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(tag)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tag Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    {editingTag ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
