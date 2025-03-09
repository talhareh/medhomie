import { Request, Response } from 'express';
import { Course, CourseState } from '../models/Course';
import { User, UserRole } from '../models/User';
import { Payment, PaymentStatus } from '../models/Payment';

type CourseStatsType = {
  [CourseState.DRAFT]: number;
  [CourseState.ACTIVE]: number;
  [CourseState.INACTIVE]: number;
  total: number;
};

type PaymentStatsType = {
  [PaymentStatus.PENDING]: { count: number; amount: number };
  [PaymentStatus.VERIFIED]: { count: number; amount: number };
  [PaymentStatus.REJECTED]: { count: number; amount: number };
  total: { count: number; amount: number };
};

/**
 * Get dashboard statistics
 * @route GET /api/statistics/dashboard
 * @access Private (Admin only)
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Course statistics
    const courseStats = await Course.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format course stats
    const courseStatsByState: CourseStatsType = {
      [CourseState.DRAFT]: 0,
      [CourseState.ACTIVE]: 0,
      [CourseState.INACTIVE]: 0,
      total: 0
    };

    courseStats.forEach(stat => {
      // Ensure stat._id is a valid CourseState
      if (stat._id && Object.values(CourseState).includes(stat._id as CourseState)) {
        courseStatsByState[stat._id as CourseState] = stat.count;
        courseStatsByState.total += stat.count;
      }
    });

    // User statistics
    const totalStudents = await User.countDocuments({ role: UserRole.STUDENT });
    const blockedStudents = await User.countDocuments({ 
      role: UserRole.STUDENT, 
      isApproved: false 
    });

    // Payment statistics
    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Format payment stats
    const paymentStatsByStatus: PaymentStatsType = {
      [PaymentStatus.PENDING]: { count: 0, amount: 0 },
      [PaymentStatus.VERIFIED]: { count: 0, amount: 0 },
      [PaymentStatus.REJECTED]: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 }
    };

    paymentStats.forEach(stat => {
      // Ensure stat._id is a valid PaymentStatus
      if (stat._id && Object.values(PaymentStatus).includes(stat._id as PaymentStatus)) {
        paymentStatsByStatus[stat._id as PaymentStatus] = {
          count: stat.count,
          amount: stat.totalAmount
        };
        paymentStatsByStatus.total.count += stat.count;
        paymentStatsByStatus.total.amount += stat.totalAmount;
      }
    });

    res.status(200).json({
      courses: courseStatsByState,
      students: {
        total: totalStudents,
        blocked: blockedStudents
      },
      payments: paymentStatsByStatus
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};
