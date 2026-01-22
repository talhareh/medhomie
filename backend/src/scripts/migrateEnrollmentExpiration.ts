import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Enrollment } from '../models/Enrollment';

config();

/**
 * Migration script to set expiration dates for existing enrollments
 * Sets expiration date to 10 years from enrollment date for enrollments without expiration dates
 */
const migrateEnrollmentExpiration = async () => {
  try {
    console.log('Starting enrollment expiration migration...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all enrollments without expiration dates
    const enrollmentsWithoutExpiration = await Enrollment.find({
      expirationDate: { $exists: false }
    });

    console.log(`Found ${enrollmentsWithoutExpiration.length} enrollments without expiration dates`);

    if (enrollmentsWithoutExpiration.length === 0) {
      console.log('No enrollments to migrate');
      await mongoose.disconnect();
      return;
    }

    // Update each enrollment
    let updatedCount = 0;
    for (const enrollment of enrollmentsWithoutExpiration) {
      try {
        // Set expiration date to 10 years from enrollment date
        const expirationDate = new Date(enrollment.enrollmentDate);
        expirationDate.setFullYear(expirationDate.getFullYear() + 10);

        enrollment.expirationDate = expirationDate;
        enrollment.isExpired = false;

        await enrollment.save();
        updatedCount++;

        if (updatedCount % 100 === 0) {
          console.log(`Updated ${updatedCount} enrollments...`);
        }
      } catch (error) {
        console.error(`Error updating enrollment ${enrollment._id}:`, error);
        // Continue with other enrollments
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} enrollments.`);

    // Also handle enrollments with null expiration dates
    const enrollmentsWithNullExpiration = await Enrollment.find({
      expirationDate: null
    });

    if (enrollmentsWithNullExpiration.length > 0) {
      console.log(`Found ${enrollmentsWithNullExpiration.length} enrollments with null expiration dates`);
      
      let nullUpdatedCount = 0;
      for (const enrollment of enrollmentsWithNullExpiration) {
        try {
          const expirationDate = new Date(enrollment.enrollmentDate);
          expirationDate.setFullYear(expirationDate.getFullYear() + 10);

          enrollment.expirationDate = expirationDate;
          enrollment.isExpired = false;

          await enrollment.save();
          nullUpdatedCount++;
        } catch (error) {
          console.error(`Error updating enrollment ${enrollment._id}:`, error);
        }
      }

      console.log(`Updated ${nullUpdatedCount} enrollments with null expiration dates.`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Migration script completed successfully');
  } catch (error) {
    console.error('Error in migration script:', error);
    process.exit(1);
  }
};

// Run migration if script is executed directly
if (require.main === module) {
  migrateEnrollmentExpiration()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateEnrollmentExpiration };

