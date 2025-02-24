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
  paymentReceipt: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface EnrollmentRequest {
  courseId: string;
  receipt: File;
}
