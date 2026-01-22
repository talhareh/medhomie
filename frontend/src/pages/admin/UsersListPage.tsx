import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { MainLayout } from '../../components/layout/MainLayout';
import { UserRole, User as AuthUser } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faGraduationCap,
  faBook,
  faCreditCard,
  faUsers,
  faCog,
  faDesktop,
  faEdit,
  faBan,
  faCheckCircle,
  faTrash,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

// We'll set up the modal root in a useEffect to ensure the DOM is ready
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    padding: '2rem',
    borderRadius: '0.5rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
};

// Extend the AuthUser interface for the form
interface UserFormData {
  email: string;
  fullName: string;
  role: UserRole;
  whatsappNumber: string;
  password?: string;
}

export const UsersListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    fullName: '',
    role: UserRole.STUDENT,
    whatsappNumber: '',
    password: '',
  });
  const [sortField, setSortField] = useState<keyof AuthUser | 'deviceCount'>('deviceCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [mobileActionMenu, setMobileActionMenu] = useState<string | null>(null);

  // Set up Modal root element
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      Modal.setAppElement(root);
    }
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== UserRole.ADMIN) {
      navigate('/');
      toast.error('Unauthorized access');
    }
  }, [user, navigate]);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await api.get<AuthUser[]>('/users');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast.error(error.response?.data?.message || 'Error fetching users');
        throw error;
      }
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      try {
        // Validate required fields
        if (!data.email || !data.password || !data.fullName || !data.whatsappNumber) {
          throw new Error('All fields are required');
        }

        // Log the create request
        console.log('Creating user with data:', { ...data, password: '[REDACTED]' });

        const response = await api.post('/users', data);
        return response.data;
      } catch (error: any) {
        console.error('Error in createUserMutation:', error.response || error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('User created successfully:', data);
      queryClient.invalidateQueries(['users']);
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Error creating user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<UserFormData> }) => {
      try {
        // Log the update request
        console.log('Updating user:', userId, 'with data:', data);

        // Remove empty strings and undefined values
        const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
          if (value !== '' && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as Partial<UserFormData>);

        // Don't send password if it's empty
        if (!cleanedData.password) {
          delete cleanedData.password;
        }

        console.log('Cleaned update data:', cleanedData);

        const response = await api.patch(`/users/${userId}`, cleanedData);
        return response.data;
      } catch (error: any) {
        console.error('Error in updateUserMutation:', error.response || error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Update successful:', data);
      queryClient.invalidateQueries(['users']);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Error updating user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Error deleting user');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      const response = await api.patch(`/users/${userId}/status`, { isApproved });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.message || 'Error updating user status');
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const response = await api.patch(`/users/${userId}/block`, { isBlocked });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['users']);
      toast.success(variables.isBlocked ? 'User blocked successfully' : 'User unblocked successfully');
    },
    onError: (error: any) => {
      console.error('Error updating user block status:', error);
      toast.error(error.response?.data?.message || 'Error updating user block status');
    },
  });

  const handleCreateUser = () => {
    // Validate required fields
    if (!formData.email || !formData.password || !formData.fullName || !formData.whatsappNumber) {
      toast.error('All fields are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) {
      console.error('No user selected for update');
      return;
    }

    // Create update payload
    const updatePayload = {
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
      whatsappNumber: formData.whatsappNumber,
      ...(formData.password ? { password: formData.password } : {})
    };

    console.log('Update payload:', updatePayload);

    updateUserMutation.mutate({
      userId: selectedUser._id,
      data: updatePayload
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      role: UserRole.STUDENT,
      whatsappNumber: '',
      password: '',
    });
  };

  const openEditModal = (user: AuthUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      whatsappNumber: user.whatsappNumber,
    });
    setIsEditModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch =
      searchTerm === '' ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.whatsappNumber && user.whatsappNumber.includes(searchTerm));
    return matchesRole && matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField as keyof AuthUser] ?? 0;
    const bValue = b[sortField as keyof AuthUser] ?? 0;

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchTerm]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileActionMenu && !(event.target as Element).closest('.action-menu-container')) {
        setMobileActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileActionMenu]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (field: keyof AuthUser | 'deviceCount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: keyof AuthUser | 'deviceCount') => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-red-500">Error loading users. Please try again later.</div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Users Management</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full sm:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            >
              Add User
            </button>
          </div>
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden lg:block bg-white rounded-lg shadow w-full">
          <div className="overflow-x-hidden">
            <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    WhatsApp
                    <FontAwesomeIcon icon={faWhatsapp} className="text-green-500" />
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('deviceCount')}
                  >
                    Devices
                    <FontAwesomeIcon icon={faDesktop} className="text-gray-500" />
                    {getSortIcon('deviceCount')}
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map(user => (
                <tr 
                  key={user._id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                >
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center">
                      {user.profilePicture ? (
                        <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {user.fullName[0]}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                    {user.whatsappNumber || '-'}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(user.deviceCount || 0) >= 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {user.deviceCount || 0} / 3
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                      {user.isBlocked && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-900">
                          Blocked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                    {(user as any).createdAt ? new Date((user as any).createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(user);
                        }}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          blockUserMutation.mutate({ userId: user._id, isBlocked: !user.isBlocked });
                        }}
                        className={user.isBlocked ? 'text-green-600 hover:text-green-900 px-2 py-1' : 'text-orange-600 hover:text-orange-900 px-2 py-1'}
                        title={user.isBlocked ? 'Unblock user' : 'Block user'}
                      >
                        <FontAwesomeIcon icon={user.isBlocked ? faCheckCircle : faBan} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user._id);
                        }}
                        className="text-red-600 hover:text-red-900 px-2 py-1"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Tablet Table View - Hidden on mobile and desktop */}
        <div className="hidden md:block lg:hidden bg-white rounded-lg shadow w-full">
          <div className="overflow-x-hidden">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map(user => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {user.profilePicture ? (
                          <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">{user.fullName[0]}</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                        {user.isBlocked && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-900">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block action-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileActionMenu(mobileActionMenu === user._id ? null : user._id);
                          }}
                          className="text-gray-600 hover:text-gray-900 px-2 py-1"
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {mobileActionMenu === user._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  openEditModal(user);
                                  setMobileActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faEdit} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  blockUserMutation.mutate({ userId: user._id, isBlocked: !user.isBlocked });
                                  setMobileActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={user.isBlocked ? faCheckCircle : faBan} /> {user.isBlocked ? 'Unblock' : 'Block'}
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteUser(user._id);
                                  setMobileActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faTrash} /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View - Only visible on mobile */}
        <div className="lg:hidden space-y-4">
          {currentUsers.map(user => (
            <div 
              key={user._id} 
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/admin/users/${user._id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {user.profilePicture ? (
                    <img className="h-12 w-12 rounded-full flex-shrink-0" src={user.profilePicture} alt="" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 font-medium text-lg">{user.fullName[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.fullName}</div>
                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                      {user.isBlocked && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-900">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative ml-2 action-menu-container" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileActionMenu(mobileActionMenu === user._id ? null : user._id);
                    }}
                    className="text-gray-600 hover:text-gray-900 p-2"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                  {mobileActionMenu === user._id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMobileActionMenu(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              openEditModal(user);
                              setMobileActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              blockUserMutation.mutate({ userId: user._id, isBlocked: !user.isBlocked });
                              setMobileActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={user.isBlocked ? faCheckCircle : faBan} /> {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteUser(user._id);
                              setMobileActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">WhatsApp:</span> {user.whatsappNumber || '-'}
                </div>
                <div>
                  <span className="font-medium">Devices:</span>{' '}
                  <span className={`px-2 py-1 rounded-full ${(user.deviceCount || 0) >= 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.deviceCount || 0} / 3
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {sortedUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastUser, sortedUsers.length)}</span> of{' '}
              <span className="font-medium">{sortedUsers.length}</span> users
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onRequestClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        style={customModalStyles}
        contentLabel="Create User Modal"
      >
        <div className="relative">
          <h3 className="text-lg font-medium mb-4">Create New User</h3>
          <button
            onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateUser();
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-black rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-black rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-black rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="mt-1 block w-full px-4 py-2 border border-black rounded-md focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-black rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
          resetForm();
        }}
        style={customModalStyles}
        contentLabel="Edit User Modal"
      >
        <div className="relative">
          <h3 className="text-lg font-medium mb-4">Edit User</h3>
          <button
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
              resetForm();
            }}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateUser();
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </MainLayout>
  );
};
