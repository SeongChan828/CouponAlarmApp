import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Coupon } from '../types/coupon';
import { Colors } from '../constants/colors';
import { formatDisplayDate, formatDDay, getDaysUntilExpiry, formatTimestamp } from '../utils/dateUtils';
import { getStatusLabel } from '../utils/couponStatus';
import StatusBadge from '../components/StatusBadge';
import { getCouponById, markCouponUsed, deleteCoupon } from '../services/couponStorage';
import { cancelCouponNotifications } from '../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponDetail'>;

export default function CouponDetailScreen({ navigation, route }: Props) {
  const { couponId } = route.params;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getCouponById(couponId).then(data => {
        if (active) { setCoupon(data); setLoading(false); }
      });
      return () => { active = false; };
    }, [couponId]),
  );

  const handleMarkUsed = () => {
    if (!coupon) return;
    Alert.alert('사용 완료', `"${coupon.title}" 쿠폰을 사용 완료로 변경할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '사용 완료',
        onPress: async () => {
          const updated = await markCouponUsed(coupon.id);
          await cancelCouponNotifications(coupon.id);
          if (updated) setCoupon(updated);
        },
      },
    ]);
  };

  const handleDelete = () => {
    if (!coupon) return;
    Alert.alert('쿠폰 삭제', '이 쿠폰을 삭제할까요? 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteCoupon(coupon.id);
          await cancelCouponNotifications(coupon.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.coral} />
        </View>
      </SafeAreaView>
    );
  }

  if (!coupon) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>쿠폰을 찾을 수 없어요.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← 목록으로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const daysLeft = getDaysUntilExpiry(coupon.expiryDate);
  const isActive = coupon.status === 'available' || coupon.status === 'expiringSoon';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>쿠폰 상세</Text>
        {isActive ? (
          <TouchableOpacity onPress={() => navigation.navigate('CouponEdit', { couponId: coupon.id })} style={styles.editBtn}>
            <Text style={styles.editText}>수정</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 50 }} />}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 히어로 카드 */}
        <View style={[styles.heroCard, coupon.status === 'expiringSoon' && styles.heroUrgent]}>
          <View style={styles.heroTop}>
            <View style={styles.brandThumb}>
              <Text style={styles.brandInitial}>{coupon.brand.charAt(0)}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroBrand}>{coupon.brand}</Text>
              <Text style={styles.heroTitle}>{coupon.title}</Text>
            </View>
            <StatusBadge status={coupon.status} />
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.ddayRow}>
            <View>
              <Text style={styles.ddayLabel}>유효기간</Text>
              <Text style={styles.ddayDate}>{formatDisplayDate(coupon.expiryDate)}</Text>
            </View>
            <Text style={[
              styles.dday,
              daysLeft <= 3 && styles.ddayUrgent,
              daysLeft > 3 && daysLeft <= 7 && styles.ddayWarning,
              (coupon.status === 'used' || coupon.status === 'expired') && styles.ddayInactive,
            ]}>
              {formatDDay(coupon.expiryDate)}
            </Text>
          </View>
        </View>

        {/* 상세 정보 */}
        <View style={styles.infoCard}>
          {coupon.store ? <InfoRow label="사용처" value={coupon.store} /> : null}
          {coupon.couponCode ? <InfoRow label="쿠폰 번호" value={coupon.couponCode} mono /> : null}
          {coupon.memo ? <InfoRow label="메모" value={coupon.memo} /> : null}
          <InfoRow label="등록일" value={formatTimestamp(coupon.createdAt)} />
          {coupon.usedAt ? <InfoRow label="사용일" value={formatTimestamp(coupon.usedAt)} /> : null}
          <InfoRow label="상태" value={getStatusLabel(coupon.status)} />
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          {isActive && (
            <TouchableOpacity style={styles.btnPrimary} onPress={handleMarkUsed} activeOpacity={0.85}>
              <Text style={styles.btnPrimaryText}>✓  사용 완료</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnDestructive} onPress={handleDelete} activeOpacity={0.85}>
            <Text style={styles.btnDestructiveText}>쿠폰 삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, mono && infoStyles.mono]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(26,26,26,0.06)', gap: 16 },
  label: { fontSize: 12, color: Colors.inkSoft, fontWeight: '600', width: 80, flexShrink: 0 },
  value: { flex: 1, fontSize: 13, color: Colors.ink, textAlign: 'right', fontWeight: '500' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1, fontSize: 12 },
});

import { Platform } from 'react-native';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.inkSoft },
  backLink: { fontSize: 14, color: Colors.coral, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, fontWeight: '300', color: Colors.ink },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.ink },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.card },
  editText: { fontSize: 12, fontWeight: '700', color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  heroCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.line, padding: 18, shadowColor: Colors.line, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  heroUrgent: { borderColor: Colors.coral, borderWidth: 2 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  brandThumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.line },
  brandInitial: { color: Colors.white, fontSize: 20, fontWeight: '800' },
  heroInfo: { flex: 1 },
  heroBrand: { fontSize: 12, color: Colors.inkSoft, fontWeight: '500' },
  heroTitle: { fontSize: 17, fontWeight: '800', color: Colors.ink, marginTop: 2 },
  heroDivider: { height: 1, backgroundColor: 'rgba(26,26,26,0.1)', marginVertical: 14 },
  ddayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ddayLabel: { fontSize: 11, color: Colors.inkSoft, marginBottom: 3 },
  ddayDate: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  dday: { fontSize: 32, fontWeight: '900', color: Colors.inkSoft },
  ddayUrgent: { color: Colors.coral },
  ddayWarning: { color: Colors.mustard },
  ddayInactive: { color: Colors.inkSoft, opacity: 0.6 },
  infoCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.line, paddingHorizontal: 18, shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  actions: { gap: 10, marginTop: 4 },
  btnPrimary: { backgroundColor: Colors.ink, borderRadius: 12, borderWidth: 2, borderColor: Colors.line, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  btnPrimaryText: { color: Colors.background, fontSize: 15, fontWeight: '800' },
  btnDestructive: { borderRadius: 12, borderWidth: 1.5, borderColor: Colors.coral, paddingVertical: 14, alignItems: 'center' },
  btnDestructiveText: { color: Colors.coral, fontSize: 14, fontWeight: '700' },
});
