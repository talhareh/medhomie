import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { getAllUsers, updateUser, deleteUser, logoutUser } from '../services/authService';
import { useStage, STAGES } from '../context/StageContext';

// ============================================
// HOME/DASHBOARD PAGE
// ============================================
export default function HomePage() {
  const navigate = useNavigate();
  const { updateStage } = useStage();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    number: '',
    password: ''
  });

  // Get logged in user from localStorage (set this during login)
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Check for token on component mount and update stage
  useEffect(() => {
    // Update stage to HOME
    updateStage(STAGES.HOME);
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // If user exists but no token, they need to login again
    if (user && !token) {
      alert('Please login again to get your authentication token. This is required for security.');
      logoutUser();
      navigate('/login');
      return;
    }
    
    // If no user at all, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchAllUsers();
  }, [navigate, updateStage]);

  const fetchAllUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data.users || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Don't show alert, just log and show empty state
      console.log('Failed to fetch users:', error.message);
      setUsers([]);
      setIsLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  };

  const handleEdit = (user) => {
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      number: user.number,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      // Check for token before attempting update
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        logoutUser();
        navigate('/login');
        return;
      }
      
      await updateUser(editFormData.id, editFormData);
      alert('User updated successfully!');
      setShowEditModal(false);
      fetchAllUsers(); // Refresh the list
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      
      // If token error, redirect to login
      if (error.message && error.message.includes('token')) {
        alert('Your session has expired. Please login again.');
        logoutUser();
        navigate('/login');
        return;
      }
      
      alert(error.message || 'Error updating user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      // Check for token before attempting delete
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        logoutUser();
        navigate('/login');
        return;
      }
      
      await deleteUser(userId);
      alert('User deleted successfully!');
      fetchAllUsers(); // Refresh the list
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // If token error, redirect to login
      if (error.message && error.message.includes('token')) {
        alert('Your session has expired. Please login again.');
        logoutUser();
        navigate('/login');
        return;
      }
      
      alert(error.message || 'Error deleting user');
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return 'Not available';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }
    return date.toLocaleDateString();
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header showLogoutButton />
      
      {/* Welcome Section */}
      <div className="bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome, {loggedInUser.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">Manage all registered users</p>
      </div>

      {/* Quick Navigation Section */}
      <div className="bg-white px-6 py-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link 
            to="/about" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2">About MedHome</h3>
                <p className="text-blue-100">Learn about our mission, values, and medical education excellence</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/programs" 
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎓</span>
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2">Our Programs</h3>
                <p className="text-orange-100">Explore our comprehensive range of medical education courses</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white px-6 py-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Registered Users ({users.length})
            </h2>
          </div>

          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* User Name Card - Clickable */}
                  <div
                    onClick={() => handleUserClick(user)}
                    className="bg-gray-50 hover:bg-gray-100 px-6 py-4 cursor-pointer flex items-center justify-between transition border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {user.name}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {selectedUser?.id === user.id ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* User Details - Expandable */}
                  {selectedUser?.id === user.id && (
                    <div className="bg-white p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Full Name</label>
                          <p className="text-gray-800 mt-1">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Email</label>
                          <p className="text-gray-800 mt-1">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">WhatsApp Number</label>
                          <p className="text-gray-800 mt-1">{user.number}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Registered On</label>
                          <p className="text-gray-800 mt-1">
                            {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg transition"
                        >
                          ✏️ Edit User
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-3 rounded-lg transition"
                        >
                          🗑️ Delete User
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={editFormData.number}
                  onChange={(e) => setEditFormData({ ...editFormData, number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password or leave blank"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-lg transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold py-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}