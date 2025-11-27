import api from '../utils/axios';
import {
  Voucher,
  VoucherFormData,
  VoucherListResponse,
  VoucherDetailResponse,
  VoucherValidationResponse,
  VoucherUsage
} from '../types/voucher';

export const voucherService = {
  // Admin: Create voucher
  createVoucher: async (data: VoucherFormData): Promise<Voucher> => {
    const response = await api.post<Voucher>('/vouchers', data);
    return response.data.data || response.data;
  },

  // Admin: Get all vouchers
  getVouchers: async (
    page = 1,
    limit = 10,
    filters?: {
      isActive?: boolean;
      courseId?: string;
      search?: string;
    }
  ): Promise<VoucherListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters?.courseId) {
      params.append('courseId', filters.courseId);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await api.get<VoucherListResponse>(`/vouchers?${params.toString()}`);
    return response.data;
  },

  // Admin: Get voucher by ID
  getVoucherById: async (id: string): Promise<VoucherDetailResponse> => {
    const response = await api.get<VoucherDetailResponse>(`/vouchers/${id}`);
    return response.data;
  },

  // Admin: Update voucher
  updateVoucher: async (id: string, data: Partial<VoucherFormData>): Promise<Voucher> => {
    const response = await api.put<Voucher>(`/vouchers/${id}`, data);
    return response.data.data || response.data;
  },

  // Admin: Delete voucher
  deleteVoucher: async (id: string): Promise<void> => {
    await api.delete(`/vouchers/${id}`);
  },

  // Student: Validate voucher code
  validateVoucher: async (code: string, courseId: string): Promise<VoucherValidationResponse> => {
    const response = await api.post<VoucherValidationResponse>('/vouchers/validate', {
      code,
      courseId
    });
    return response.data;
  },

  // Student: Get my voucher usage
  getMyVoucherUsage: async (): Promise<VoucherUsage[]> => {
    const response = await api.get<{ success: boolean; data: VoucherUsage[] }>('/vouchers/my-usage');
    return response.data.data || [];
  },

  // Admin: Apply voucher retroactively
  applyVoucherRetroactive: async (enrollmentId: string, voucherCode: string): Promise<VoucherUsage> => {
    const response = await api.post<{ success: boolean; data: VoucherUsage }>('/vouchers/apply-retroactive', {
      enrollmentId,
      voucherCode
    });
    return response.data.data;
  }
};

