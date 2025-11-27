export interface CourseInfo {
  _id: string;
  title: string;
  price: number;
}

export interface Voucher {
  _id: string;
  code: string;
  description?: string;
  discountPercentage: number;
  applicableCourses: string[] | CourseInfo[];
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdBy: string | UserInfo;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
}

export interface VoucherUsage {
  _id: string;
  voucher: string | Voucher;
  student: string | UserInfo;
  course: string | CourseInfo;
  enrollment: string;
  payment?: string;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
  usedAt: string;
  appliedBy: string | UserInfo;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherValidationResponse {
  success: boolean;
  data?: {
    voucher: Voucher;
    discountPercentage: number;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  };
  message?: string;
}

export interface VoucherFormData {
  code: string;
  description?: string;
  discountPercentage: number;
  applicableCourses: string[];
  usageLimit: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface VoucherListResponse {
  success: boolean;
  data: Voucher[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VoucherDetailResponse {
  success: boolean;
  data: {
    voucher: Voucher;
    usageCount: number;
    recentUsages: VoucherUsage[];
  };
}

