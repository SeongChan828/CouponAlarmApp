import { Coupon } from '../types/coupon';
import { getTodayString } from './dateUtils';
import { getCouponStatus } from './couponStatus';

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const now = new Date().toISOString();

export const DUMMY_COUPONS: Coupon[] = [
  {
    id: '1',
    title: '아메리카노 Tall',
    brand: '스타벅스',
    store: '스타벅스 전국 매장',
    expiryDate: addDays(2),
    couponCode: '1234-5678-9012-3456',
    memo: '생일 선물로 받음',
    status: getCouponStatus(addDays(2)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '2',
    title: '파인트 아이스크림',
    brand: '베스킨라빈스',
    store: '베스킨라빈스 전 매장',
    expiryDate: addDays(5),
    couponCode: 'BR-9876-5432',
    memo: '',
    status: getCouponStatus(addDays(5)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '3',
    title: '2만원 상품권',
    brand: '올리브영',
    store: '올리브영 온·오프라인',
    expiryDate: addDays(23),
    couponCode: 'OLV-2024-XXXX',
    memo: '명절 선물',
    status: getCouponStatus(addDays(23)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '4',
    title: '황금올리브 치킨',
    brand: 'BBQ',
    store: 'BBQ 치킨 전 가맹점',
    expiryDate: addDays(1),
    couponCode: 'BBQ-1111-2222',
    memo: '',
    status: getCouponStatus(addDays(1)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '5',
    title: '아이스 카페라떼',
    brand: '이디야커피',
    store: '이디야 전 매장',
    expiryDate: addDays(-3),
    couponCode: 'EDIYA-XXXX',
    memo: '기간 지남',
    status: getCouponStatus(addDays(-3)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '6',
    title: '슈퍼 클리어 스킨케어 세트',
    brand: '이니스프리',
    store: '이니스프리 매장',
    expiryDate: addDays(60),
    couponCode: 'INF-7777-8888',
    memo: '온라인 주문 적립 쿠폰',
    status: 'used',
    usedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];
