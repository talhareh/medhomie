import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserById,
  getAvailableStudents
} from '../controllers/userController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (Admin only)
router.get('/', getUsers);

// Get available students for enrollment
router.get('/students', getAvailableStudents);

// Create user (Admin only)
router.post('/', createUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.patch('/:id', updateUser);

// Delete user (Admin only)
router.delete('/:id', deleteUser);

// Update user status (Admin only)
router.patch('/:id/status', updateUserStatus);

// Update user role (Admin only)
router.patch('/:id/role', updateUserRole);

export default router;
