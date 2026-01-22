import cron from 'node-cron';
import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { sendEnrollmentNotification } from '../services/emailService';

/**
 * Expires enrollments that have passed their expiration date
 * Runs daily at midnight UTC
 */
export const expireEnrollments = async (): Promise<void> => {
  try {
    console.log('Starting enrollment expiration job...');
    const now = new Date();

    // Find all enrollments that should be expired
    // Only process enrollments that have expirationDate set
    const expiredEnrollments = await Enrollment.find({
      status: EnrollmentStatus.APPROVED,
      isExpired: false,
      expirationDate: { $exists: true, $lte: now }
    }).populate('course', 'title').populate('student', 'email fullName');

    if (expiredEnrollments.length === 0) {
      console.log('No enrollments to expire');
      return;
    }

    console.log(`Found ${expiredEnrollments.length} enrollments to expire`);

    // Process each expired enrollment
    for (const enrollment of expiredEnrollments) {
      try {
        // Mark as expired
        enrollment.isExpired = true;
        await enrollment.save();

        // Remove student from course's enrolledStudents array
        await Course.findByIdAndUpdate(enrollment.course, {
          $pull: { enrolledStudents: enrollment.student }
        });

        // Send email notification
        const student = enrollment.student as any;
        const course = enrollment.course as any;

        if (student && course && student.email) {
          try {
            await sendEnrollmentNotification(
              student.email,
              student.fullName || 'Student',
              course.title,
              'removed'
            );
            console.log(`Expiration notification sent to ${student.email}`);
          } catch (emailError) {
            console.error(`Error sending expiration email to ${student.email}:`, emailError);
            // Continue processing other enrollments even if email fails
          }
        }

        console.log(`Expired enrollment: ${enrollment._id} for student ${enrollment.student} in course ${enrollment.course}`);
      } catch (error) {
        console.error(`Error processing expired enrollment ${enrollment._id}:`, error);
        // Continue processing other enrollments even if one fails
      }
    }

    console.log(`Enrollment expiration job completed. Processed ${expiredEnrollments.length} enrollments.`);
  } catch (error) {
    console.error('Error in enrollment expiration job:', error);
  }
};

/**
 * Initialize the cron job to run daily at midnight UTC
 */
export const startEnrollmentExpirationJob = (): void => {
  // Run daily at 00:00 UTC (midnight)
  cron.schedule('0 0 * * *', async () => {
    await expireEnrollments();
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('Enrollment expiration cron job scheduled to run daily at midnight UTC');
};

