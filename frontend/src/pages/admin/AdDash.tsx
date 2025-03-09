import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import api from '../../utils/axios';

// Interface for statistics
interface DashboardStats {
  courses: {
    DRAFT: number;
    ACTIVE: number;
    INACTIVE: number;
    total: number;
  };
  students: {
    total: number;
    blocked: number;
  };
  payments: {
    pending: { count: number; amount: number };
    verified: { count: number; amount: number };
    rejected: { count: number; amount: number };
    total: { count: number; amount: number };
  };
}

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  isApproved: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  whatsappNumber: string;
  phoneNumber?: string;
}

interface LoginHistory {
  _id: string;
  timestamp: Date;
  ipAddress: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    platform?: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
}

export const AdDash = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statsLoading, setStatsLoading] = useState(true);
  const usersPerPage = 5;
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
    fetchDashboardStats();
  }, [user, navigate]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.fullName.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) || 
        (user.phoneNumber && user.phoneNumber.includes(term)) ||
        (user.whatsappNumber && user.whatsappNumber.includes(term))
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get('/statistics/dashboard');
      setStats(response.data);
      setStatsLoading(false);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchLoginHistory = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/login-history`);
      setLoginHistory(response.data);
      setSelectedUser(userId);
    } catch (error) {
      toast.error('Failed to fetch login history');
    }
  };

  const updateUserStatus = async (userId: string, isApproved: boolean) => {
    try {
      await api.patch(`/users/${userId}/status`, { isApproved });
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Quick Access Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link 
            to="/admin/courses" 
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg shadow text-center transition-colors"
          >
            Manage Courses
          </Link>
          <Link 
            to="/admin/users" 
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg shadow text-center transition-colors"
          >
            Manage Users
          </Link>
          <Link 
            to="/admin/categories" 
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg shadow text-center transition-colors"
          >
            Manage Categories
          </Link>
          <Link 
            to="/admin/tags" 
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg shadow text-center transition-colors"
          >
            Manage Tags
          </Link>
          <Link 
            to="/admin/payments" 
            className="bg-primary hover:bg-primary-dark text-white p-4 rounded-lg shadow text-center transition-colors"
          >
            Manage Payments
          </Link>
        </div>

        {/* Dashboard Statistics */}
        {statsLoading ? (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ) : stats ? (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Course Statistics</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Courses:</span>
                  <span className="font-semibold">{stats.courses.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Draft Courses:</span>
                  <span className="font-semibold">{stats.courses.DRAFT}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Courses:</span>
                  <span className="font-semibold">{stats.courses.ACTIVE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inactive Courses:</span>
                  <span className="font-semibold">{stats.courses.INACTIVE}</span>
                </div>
              </div>
            </div>

            {/* Student Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Student Statistics</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Students:</span>
                  <span className="font-semibold">{stats.students.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blocked Students:</span>
                  <span className="font-semibold">{stats.students.blocked}</span>
                </div>
              </div>
            </div>

            {/* Payment Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Statistics</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">${stats.payments.total.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified Amount:</span>
                  <span className="font-semibold">${stats.payments.verified.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Amount:</span>
                  <span className="font-semibold">${stats.payments.pending.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-semibold">{stats.payments.total.count}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Users</h2>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    className="w-full p-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phoneNumber || user.whatsappNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="text-sm text-gray-900 border rounded px-2 py-1"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateUserStatus(user._id, !user.isApproved)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isApproved ? 'Approved' : 'Not Approved'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => fetchLoginHistory(user._id)}
                          className="text-primary hover:text-primary-dark"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastUser, filteredUsers.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredUsers.length}</span> users
                    </p>
                  </div>
                  <div>
                    <nav className="flex items-center">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                            currentPage === i + 1
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Login History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Login History</h2>
              {selectedUser ? (
                <div className="space-y-4">
                  {loginHistory.map(log => (
                    <div key={log._id} className="border-b pb-4">
                      <div className="text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Browser:</span> {log.deviceInfo.browser}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">OS:</span> {log.deviceInfo.os}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Location:</span>{' '}
                        {log.location?.city}, {log.location?.country}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">IP:</span> {log.ipAddress}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Select a user to view login history</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
