export type CouponStatus = 'available' | 'expiringSoon' | 'used' | 'expired';

export type Coupon = {
  id: string;
  title: string;
  brand: string;
  store?: string;
  expiryDate: string; // 'YYYY-MM-DD'
  couponCode?: string;
  memo?: string;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
  usedAt?: string;
};

export type CouponFormData = Omit<Coupon, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'usedAt'>;
