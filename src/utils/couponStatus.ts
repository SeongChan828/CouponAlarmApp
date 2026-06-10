import { CouponStatus } from '../types/coupon';
import { getDaysUntilExpiry } from './dateUtils';

/**
 * 쿠폰 상태 자동 판정
 * 1. usedAt이 있으면 → 'used'
 * 2. 오늘 날짜가 expiryDate 이후면 → 'expired'
 * 3. 남은 기간이 3일 이내면 → 'expiringSoon'
 * 4. 그 외 → 'available'
 */
export function getCouponStatus(expiryDate: string, usedAt?: string): CouponStatus {
  if (usedAt) return 'used';

  const daysLeft = getDaysUntilExpiry(expiryDate);

  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 3) return 'expiringSoon';
  return 'available';
}

/**
 * 상태별 한글 라벨
 */
export function getStatusLabel(status: CouponStatus): string {
  switch (status) {
    case 'available':     return '사용 가능';
    case 'expiringSoon':  return '만료 임박';
    case 'used':          return '사용 완료';
    case 'expired':       return '만료됨';
  }
}

/**
 * 상태별 배경색 (StatusBadge용)
 */
export function getStatusBadgeColor(status: CouponStatus): string {
  switch (status) {
    case 'available':    return '#4CAF50';
    case 'expiringSoon': return '#FF5B4A';
    case 'used':         return '#9E9E9E';
    case 'expired':      return '#BDBDBD';
  }
}

/**
 * 목록 정렬: 유효기간 임박 순 (used/expired는 뒤로)
 */
export function sortCouponsByExpiry(
  coupons: Array<{ expiryDate: string; status: CouponStatus; usedAt?: string }>,
) {
  const order: Record<CouponStatus, number> = {
    expiringSoon: 0,
    available:    1,
    expired:      2,
    used:         3,
  };

  return [...coupons].sort((a, b) => {
    const orderDiff = order[a.status] - order[b.status];
    if (orderDiff !== 0) return orderDiff;
    // 같은 그룹 내에선 유효기간 빠른 순
    return a.expiryDate.localeCompare(b.expiryDate);
  });
}
