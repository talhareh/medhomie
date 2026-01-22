export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Enrollment {
  _id: string;
  student: {
    _id: string;
    fullName: string;
    email: string;
    whatsappNumber?: string;
  };
  course: {
    _id: string;
    title: string;
    price: number;
  };
  paymentReceipt?: string;
  paymentMethod?: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  approvalDate?: string;
  rejectionReason?: string;
  expirationDate?: string;
  isExpired?: boolean;
}

export interface EnrollmentRequest {
  courseId: string;
  receipt: File;
}

export interface CourseWithEnrollment {
  _id: string;
  title: string;
  instructor: {
    _id: string;
    fullName: string;
  };
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  enrolledCount: number;
}

export interface Student {
  _id: string;
  fullName: string;
  email: string;
  whatsappNumber?: string;
}

export interface StudentEnrollment extends Student {
  enrollmentDate: string;
}

export interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onEnroll: (studentIds: string[]) => Promise<void>;
}

export interface RemoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onRemove: (studentIds: string[]) => Promise<void>;
}

export interface UpdateExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId?: string;
  enrollmentIds?: string[];
  currentExpirationDate?: string;
  onUpdate: (expirationDate: string) => Promise<void>;
}
