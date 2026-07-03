import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

interface HeroSlider {
  _id: string;
  title: string;
  altText: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface NewSliderForm {
  title: string;
  altText: string;
  sortOrder: string;
  isActive: boolean;
  image: File | null;
}

interface EditFormState {
  title: string;
  altText: string;
  sortOrder: string;
  isActive: boolean;
  image: File | null;
}

const toUploadsUrl = (value: string) =>
  value.startsWith('http') ? value : value.replace('uploads/', '/api/uploads/');

const defaultFormState: NewSliderForm = {
  title: '',
  altText: '',
  sortOrder: '0',
  isActive: true,
  image: null,
};

const HeroSlidersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newSlider, setNewSlider] = useState<NewSliderForm>(defaultFormState);
  const [newSliderPreview, setNewSliderPreview] = useState<string | null>(null);
  const [editForms, setEditForms] = useState<Record<string, EditFormState>>({});

  const { data: sliders = [], isLoading } = useQuery({
    queryKey: ['hero-sliders'],
    queryFn: async () => {
      const response = await api.get<HeroSlider[]>('/hero-sliders');
      return response.data;
    },
    enabled: user?.role === 'admin',
  });

  const activePreviewCount = useMemo(
    () => sliders.filter((slider) => slider.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 5).length,
    [sliders]
  );

  useEffect(() => {
    if (!newSlider.image) {
      setNewSliderPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(newSlider.image);
    setNewSliderPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [newSlider.image]);

  const createMutation = useMutation({
    mutationFn: async (payload: NewSliderForm) => {
      const formData = new FormData();
      formData.append('title', payload.title.trim());
      formData.append('altText', payload.altText.trim());
      formData.append('sortOrder', payload.sortOrder || '0');
      formData.append('isActive', String(payload.isActive));
      if (payload.image) {
        formData.append('image', payload.image);
      }

      const response = await api.post('/hero-sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
      queryClient.invalidateQueries({ queryKey: ['public-hero-sliders'] });
      toast.success('Hero slide created successfully');
      setNewSlider(defaultFormState);
      setNewSliderPreview(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create hero slide');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ sliderId, form }: { sliderId: string; form: EditFormState }) => {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('altText', form.altText.trim());
      formData.append('sortOrder', form.sortOrder || '0');
      formData.append('isActive', String(form.isActive));
      if (form.image) {
        formData.append('image', form.image);
      }

      const response = await api.put(`/hero-sliders/${sliderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
      queryClient.invalidateQueries({ queryKey: ['public-hero-sliders'] });
      toast.success('Hero slide updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update hero slide');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sliderId: string) => {
      await api.delete(`/hero-sliders/${sliderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
      queryClient.invalidateQueries({ queryKey: ['public-hero-sliders'] });
      toast.success('Hero slide deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete hero slide');
    },
  });

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const getEditForm = (slider: HeroSlider): EditFormState => {
    return editForms[slider._id] ?? {
      title: slider.title,
      altText: slider.altText,
      sortOrder: String(slider.sortOrder ?? 0),
      isActive: slider.isActive,
      image: null,
    };
  };

  const updateEditForm = (sliderId: string, next: Partial<EditFormState>) => {
    setEditForms((current) => ({
      ...current,
      [sliderId]: {
        ...getEditForm(sliders.find((slider) => slider._id === sliderId)!),
        ...current[sliderId],
        ...next,
      },
    }));
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newSlider.title.trim() || !newSlider.altText.trim()) {
      toast.error('Title and alt text are required');
      return;
    }
    if (!newSlider.image) {
      toast.error('Please upload a hero slide image');
      return;
    }
    createMutation.mutate(newSlider);
  };

  const handleUpdate = (slider: HeroSlider) => {
    const form = getEditForm(slider);
    if (!form.title.trim() || !form.altText.trim()) {
      toast.error('Title and alt text are required');
      return;
    }
    updateMutation.mutate({ sliderId: slider._id, form });
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Hero Slides</h1>
          <p className="text-sm text-gray-600 mt-2">
            Upload curated homepage hero images. The public page uses the first 5 active slides ordered by sort order.
            Mobile shows only the first active slide.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Recommended: landscape images with a consistent aspect ratio, optimized under 5MB.
          </p>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Add Hero Slide</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal Title</label>
              <input
                type="text"
                value={newSlider.title}
                onChange={(e) => setNewSlider((current) => ({ ...current, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Homepage clinical training banner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
              <input
                type="text"
                value={newSlider.altText}
                onChange={(e) => setNewSlider((current) => ({ ...current, altText: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Doctors in clinical training session"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input
                type="number"
                value={newSlider.sortOrder}
                onChange={(e) => setNewSlider((current) => ({ ...current, sortOrder: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={newSlider.isActive}
                onChange={(e) => setNewSlider((current) => ({ ...current, isActive: e.target.checked }))}
              />
              Active
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setNewSlider((current) => ({ ...current, image: file }));
                }}
                className="w-full"
              />
            </div>
          </div>

          {newSliderPreview && (
            <div className="rounded-lg overflow-hidden border border-gray-200 max-w-xl">
              <img src={newSliderPreview} alt="New hero slide preview" className="w-full h-56 object-cover" />
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:bg-gray-400"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Hero Slide'}
          </button>
        </form>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h2 className="text-xl font-semibold">Manage Slides</h2>
            <p className="text-sm text-gray-600">
              Active slides currently eligible for homepage rotation: <span className="font-semibold">{activePreviewCount}</span> / 5
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : sliders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-gray-500">
              No hero slides yet. Create the first one above.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {sliders.map((slider) => {
                const form = getEditForm(slider);

                return (
                  <div key={slider._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <img
                      src={toUploadsUrl(slider.image)}
                      alt={slider.altText}
                      className="w-full h-56 object-cover"
                    />

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Internal Title</label>
                          <input
                            type="text"
                            value={form.title}
                            onChange={(e) => updateEditForm(slider._id, { title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                          <input
                            type="text"
                            value={form.altText}
                            onChange={(e) => updateEditForm(slider._id, { altText: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                          <input
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) => updateEditForm(slider._id, { sortOrder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => updateEditForm(slider._id, { isActive: e.target.checked })}
                          />
                          Active
                        </label>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Replace Image</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            onChange={(e) => updateEditForm(slider._id, { image: e.target.files?.[0] ?? null })}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdate(slider)}
                          disabled={updateMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this hero slide?')) {
                              deleteMutation.mutate(slider._id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default HeroSlidersPage;
