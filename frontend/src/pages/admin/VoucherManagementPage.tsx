import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { voucherService } from '../../services/voucherService';
import { courseService } from '../../services/courseService';
import { Voucher, VoucherFormData, CourseInfo } from '../../types/voucher';
import { UserRole } from '../../types/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

export const VoucherManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    description: '',
    discountPercentage: 0,
    applicableCourses: [],
    usageLimit: 1,
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  // Fetch vouchers
  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['vouchers', page, searchTerm, isActiveFilter],
    queryFn: () => voucherService.getVouchers(page, 10, {
      search: searchTerm || undefined,
      isActive: isActiveFilter
    })
  });

  // Fetch courses for dropdown
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-voucher'],
    queryFn: () => courseService.getAllCourses()
  });

  // Fetch voucher details for viewing
  const { data: voucherDetails } = useQuery({
    queryKey: ['voucher-details', viewingVoucher?._id],
    queryFn: () => viewingVoucher ? voucherService.getVoucherById(viewingVoucher._id) : null,
    enabled: !!viewingVoucher
  });

  // Create voucher mutation
  const createMutation = useMutation({
    mutationFn: (data: VoucherFormData) => voucherService.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vouchers']);
      toast.success('Voucher created successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error creating voucher');
    }
  });

  // Update voucher mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoucherFormData> }) =>
      voucherService.updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vouchers']);
      toast.success('Voucher updated successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error updating voucher');
    }
  });

  // Delete voucher mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => voucherService.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vouchers']);
      toast.success('Voucher deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting voucher');
    }
  });

  // Check if user is admin
  if (!user || user.role !== UserRole.ADMIN) {
    navigate('/');
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountPercentage' || name === 'usageLimit' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleCourseSelect = (courseId: string) => {
    setFormData(prev => {
      const courses = prev.applicableCourses;
      if (courses.includes(courseId)) {
        return { ...prev, applicableCourses: courses.filter(id => id !== courseId) };
      } else {
        return { ...prev, applicableCourses: [...courses, courseId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.applicableCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    if (editingVoucher) {
      updateMutation.mutate({
        id: editingVoucher._id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    const courseIds = Array.isArray(voucher.applicableCourses[0])
      ? (voucher.applicableCourses as Course[]).map(c => c._id)
      : voucher.applicableCourses as string[];
    
    setFormData({
      code: voucher.code,
      description: voucher.description || '',
      discountPercentage: voucher.discountPercentage,
      applicableCourses: courseIds,
      usageLimit: voucher.usageLimit,
      validFrom: new Date(voucher.validFrom).toISOString().split('T')[0],
      validUntil: new Date(voucher.validUntil).toISOString().split('T')[0],
      isActive: voucher.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = (voucherId: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      deleteMutation.mutate(voucherId);
    }
  };

  const handleView = (voucher: Voucher) => {
    setViewingVoucher(voucher);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountPercentage: 0,
      applicableCourses: [],
      usageLimit: 1,
      validFrom: '',
      validUntil: '',
      isActive: true
    });
    setEditingVoucher(null);
    setIsModalOpen(false);
    setViewingVoucher(null);
  };

  const vouchers = vouchersData?.data || [];
  const pagination = vouchersData?.pagination;

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Voucher Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Voucher
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="Search by code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-2 flex-1 max-w-md"
          />
          <select
            value={isActiveFilter === undefined ? 'all' : isActiveFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setIsActiveFilter(value === 'all' ? undefined : value === 'true');
              setPage(1);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No vouchers found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Period
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vouchers.map((voucher) => {
                    const courses = Array.isArray(voucher.applicableCourses[0])
                      ? (voucher.applicableCourses as CourseInfo[])
                      : [];
                    const isExpired = new Date(voucher.validUntil) < new Date();
                    
                    return (
                      <tr key={voucher._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{voucher.code}</div>
                          {voucher.description && (
                            <div className="text-sm text-gray-500">{voucher.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{voucher.discountPercentage}%</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {courses.length > 0
                              ? courses.map(c => c.title).join(', ')
                              : `${voucher.applicableCourses.length} course(s)`
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {voucher.usedCount} / {voucher.usageLimit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(voucher.validFrom).toLocaleDateString()} - {new Date(voucher.validUntil).toLocaleDateString()}
                          </div>
                          {isExpired && (
                            <div className="text-xs text-red-500">Expired</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            voucher.isActive && !isExpired
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {voucher.isActive && !isExpired ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleView(voucher)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            onClick={() => handleEdit(voucher)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(voucher._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} vouchers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Voucher Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingVoucher ? 'Edit Voucher' : 'Add New Voucher'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                      Code *
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                      disabled={!!editingVoucher}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountPercentage">
                      Discount Percentage *
                    </label>
                    <input
                      type="number"
                      id="discountPercentage"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={2}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Applicable Courses *
                  </label>
                  <div className="border rounded p-3 max-h-40 overflow-y-auto">
                    {courses.length === 0 ? (
                      <p className="text-gray-500 text-sm">No courses available</p>
                    ) : (
                      courses.map((course: any) => (
                        <label key={course._id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={formData.applicableCourses.includes(course._id)}
                            onChange={() => handleCourseSelect(course._id)}
                            className="mr-2"
                          />
                          <span className="text-sm">{course.title} - ${course.price}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.applicableCourses.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.applicableCourses.length} course(s) selected
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usageLimit">
                      Usage Limit *
                    </label>
                    <input
                      type="number"
                      id="usageLimit"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      min="1"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="validFrom">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      id="validFrom"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="validUntil">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      id="validUntil"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </div>

                {editingVoucher && (
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : editingVoucher
                      ? 'Update'
                      : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Voucher Details Modal */}
        {viewingVoucher && voucherDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Voucher Details</h2>
                <button
                  onClick={() => setViewingVoucher(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Code:</h3>
                  <p>{voucherDetails.data.voucher.code}</p>
                </div>
                {voucherDetails.data.voucher.description && (
                  <div>
                    <h3 className="font-semibold">Description:</h3>
                    <p>{voucherDetails.data.voucher.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">Discount:</h3>
                  <p>{voucherDetails.data.voucher.discountPercentage}%</p>
                </div>
                <div>
                  <h3 className="font-semibold">Usage:</h3>
                  <p>{voucherDetails.data.usageCount} / {voucherDetails.data.voucher.usageLimit}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Valid Period:</h3>
                  <p>
                    {new Date(voucherDetails.data.voucher.validFrom).toLocaleDateString()} - 
                    {new Date(voucherDetails.data.voucher.validUntil).toLocaleDateString()}
                  </p>
                </div>
                {voucherDetails.data.recentUsages && voucherDetails.data.recentUsages.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent Usage:</h3>
                    <div className="border rounded p-3">
                      {voucherDetails.data.recentUsages.map((usage: any) => (
                        <div key={usage._id} className="mb-2 pb-2 border-b last:border-b-0">
                          <p className="text-sm">
                            <strong>Student:</strong> {typeof usage.student === 'object' ? usage.student.fullName : 'N/A'}
                          </p>
                          <p className="text-sm">
                            <strong>Course:</strong> {typeof usage.course === 'object' ? usage.course.title : 'N/A'}
                          </p>
                          <p className="text-sm">
                            <strong>Discount:</strong> ${usage.discountAmount.toFixed(2)} | 
                            <strong> Final Price:</strong> ${usage.finalPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Used on: {new Date(usage.usedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

