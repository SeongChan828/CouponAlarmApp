import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Coupon } from '../types/coupon';
import { Colors } from '../constants/colors';
import { formatDDay, getDaysUntilExpiry, formatDisplayDate } from '../utils/dateUtils';
import StatusBadge from './StatusBadge';

interface CouponCardProps {
  coupon: Coupon;
  onPress: (coupon: Coupon) => void;
}

function getDDayColor(expiryDate: string, status: Coupon['status']): string {
  if (status === 'used' || status === 'expired') return Colors.inkSoft;
  const days = getDaysUntilExpiry(expiryDate);
  if (days <= 3) return Colors.coral;
  if (days <= 7) return Colors.mustard;
  return Colors.inkSoft;
}

export default function CouponCard({ coupon, onPress }: CouponCardProps) {
  const isInactive = coupon.status === 'used' || coupon.status === 'expired';
  const ddayColor = getDDayColor(coupon.expiryDate, coupon.status);
  const dday = formatDDay(coupon.expiryDate);

  return (
    <TouchableOpacity
      style={[styles.card, isInactive && styles.cardInactive]}
      onPress={() => onPress(coupon)}
      activeOpacity={0.75}
    >
      {/* 브랜드 썸네일 */}
      <View style={[styles.brandThumb, isInactive && styles.thumbInactive]}>
        <Text style={styles.brandInitial}>
          {coupon.brand.charAt(0)}
        </Text>
      </View>

      {/* 쿠폰 정보 */}
      <View style={styles.info}>
        <Text style={[styles.brand, isInactive && styles.textInactive]} numberOfLines={1}>
          {coupon.brand}
        </Text>
        <Text style={[styles.title, isInactive && styles.textInactive]} numberOfLines={1}>
          {coupon.title}
        </Text>
        <Text style={[styles.expiryDate, isInactive && styles.textInactive]}>
          {formatDisplayDate(coupon.expiryDate)} 까지
        </Text>
      </View>

      {/* D-day + 상태 뱃지 */}
      <View style={styles.right}>
        <Text style={[styles.dday, { color: ddayColor }]}>{dday}</Text>
        <StatusBadge status={coupon.status} size="sm" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.line,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 10,
  },
  cardInactive: {
    opacity: 0.5,
  },
  brandThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
    flexShrink: 0,
  },
  thumbInactive: {
    backgroundColor: Colors.inkSoft,
  },
  brandInitial: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  brand: {
    fontSize: 11,
    color: Colors.inkSoft,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  expiryDate: {
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  textInactive: {
    color: Colors.inkSoft,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  dday: {
    fontSize: 16,
    fontWeight: '800',
  },
});
