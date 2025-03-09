import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  isApproved: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  whatsappNumber: string;
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

export const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchLoginHistory = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/login-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLoginHistory(data);
      setSelectedUser(userId);
    } catch (error) {
      toast.error('Failed to fetch login history');
    }
  };

  const updateUserStatus = async (userId: string, isApproved: boolean) => {
    try {
      await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isApproved })
      });
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role })
      });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
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
