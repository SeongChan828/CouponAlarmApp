/**
 * couponStorage.ts — AsyncStorage 기반 CRUD (실제 연동 버전)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coupon, CouponFormData } from '../types/coupon';
import { getCouponStatus } from '../utils/couponStatus';

const STORAGE_KEY = '@coupons_v1';

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const coupons: Coupon[] = JSON.parse(raw);
    return coupons.map(c => ({
      ...c,
      status: getCouponStatus(c.expiryDate, c.usedAt),
    }));
  } catch {
    return [];
  }
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  const all = await getAllCoupons();
  return all.find(c => c.id === id) ?? null;
}

export async function addCoupon(data: CouponFormData): Promise<Coupon> {
  const all = await getAllCoupons();
  const now = new Date().toISOString();
  const newCoupon: Coupon = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: getCouponStatus(data.expiryDate),
    createdAt: now,
    updatedAt: now,
  };
  const rawAll = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed: Coupon[] = rawAll ? JSON.parse(rawAll) : [];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...parsed, newCoupon]));
  return newCoupon;
}

export async function updateCoupon(
  id: string,
  patch: Partial<CouponFormData>,
): Promise<Coupon | null> {
  const rawAll = await AsyncStorage.getItem(STORAGE_KEY);
  const all: Coupon[] = rawAll ? JSON.parse(rawAll) : [];
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const updated: Coupon = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
    status: getCouponStatus(patch.expiryDate ?? all[idx].expiryDate, all[idx].usedAt),
  };
  all[idx] = updated;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return updated;
}

export async function deleteCoupon(id: string): Promise<void> {
  const rawAll = await AsyncStorage.getItem(STORAGE_KEY);
  const all: Coupon[] = rawAll ? JSON.parse(rawAll) : [];
  const filtered = all.filter(c => c.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function markCouponUsed(id: string): Promise<Coupon | null> {
  const rawAll = await AsyncStorage.getItem(STORAGE_KEY);
  const all: Coupon[] = rawAll ? JSON.parse(rawAll) : [];
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  all[idx] = { ...all[idx], status: 'used', usedAt: now, updatedAt: now };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[idx];
}
