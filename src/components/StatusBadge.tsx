import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CouponStatus } from '../types/coupon';
import { getStatusLabel, getStatusBadgeColor } from '../utils/couponStatus';

interface StatusBadgeProps {
  status: CouponStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const bgColor = getStatusBadgeColor(status);
  const label = getStatusLabel(status);
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, isSmall && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 9,
  },
});
