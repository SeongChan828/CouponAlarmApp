/**
 * CouponSuccessScreen.tsx
 * 쿠폰 등록 완료 화면 - 와이어프레임 06번
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Easing,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';
import { getCouponById } from '../services/couponStorage';
import { Coupon } from '../types/coupon';
import { formatDisplayDate, getDaysUntilExpiry } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponSuccess'>;

export default function CouponSuccessScreen({ navigation, route }: Props) {
  const { couponId, locationEnabled, radius } = route.params;
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    getCouponById(couponId).then(c => setCoupon(c));

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 4, tension: 70, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const daysLeft = coupon ? getDaysUntilExpiry(coupon.expiryDate) : 0;
  const ddayText = daysLeft <= 0 ? 'D-day' : `D-${daysLeft}`;
  const ddayColor = daysLeft <= 3 ? Colors.coral : daysLeft <= 7 ? Colors.mustard : Colors.inkSoft;

  const radiusLabel = radius === 1000 ? '1km' : radius ? `${radius}m` : '';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* 체크 원 */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.checkMark} />
        </Animated.View>

        <Text style={styles.title}>쿠폰이 등록되었어요!</Text>
        <Text style={styles.sub}>유효기간과 위치를 안전하게 챙겨드릴게요.</Text>

        {/* 요약 카드 */}
        {coupon && (
          <Animated.View style={[
            styles.summaryCard,
            { opacity: cardAnim, transform: [{ translateY: cardSlide }] },
          ]}>
            <Row label="브랜드"  value={coupon.brand} />
            <Row label="상품"    value={coupon.title} bold />
            <Row
              label="유효기간"
              value={`${ddayText}  (${formatDisplayDate(coupon.expiryDate)})`}
              valueColor={ddayColor}
              bold
            />
            <Row
              label="위치 알림"
              value={locationEnabled ? `ON · ${radiusLabel}` : 'OFF'}
              valueColor={locationEnabled ? Colors.coral : Colors.inkSoft}
              bold
              last
            />
          </Animated.View>
        )}

        {/* 버튼 */}
        <Animated.View style={[styles.btnArea, { opacity: cardAnim }]}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'CouponList' }] })}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>홈으로 가기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'CouponList' },
                  { name: 'CouponCreate', params: {} },
                ],
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>다른 쿠폰 추가하기</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, bold, valueColor, last }: {
  label: string; value: string; bold?: boolean; valueColor?: string; last?: boolean;
}) {
  return (
    <View style={[rowS.row, last && { borderBottomWidth: 0 }]}>
      <Text style={rowS.label}>{label}</Text>
      <Text style={[rowS.value, bold && rowS.bold, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

const rowS = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(26,26,26,0.07)' },
  label: { fontSize: 13, color: Colors.inkSoft, fontWeight: '500' },
  value: { fontSize: 13, color: Colors.ink, fontWeight: '500' },
  bold:  { fontWeight: '800' },
});

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },

  /* 체크 원 */
  checkCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.coral,
    borderWidth: 2.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.line, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6,
    marginBottom: 4,
  },
  checkMark: {
    width: 32, height: 18,
    borderLeftWidth: 4, borderBottomWidth: 4, borderColor: Colors.white,
    transform: [{ translateX: 3 }, { translateY: -3 }, { rotate: '-45deg' }],
  },

  title: { fontSize: 24, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },
  sub:   { fontSize: 13, color: Colors.inkSoft, textAlign: 'center', marginTop: -6 },

  /* 요약 카드 */
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 18, borderWidth: 1.5, borderColor: Colors.line,
    paddingHorizontal: 20, paddingVertical: 4,
    shadowColor: Colors.line, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },

  /* 버튼 */
  btnArea:      { width: '100%', gap: 10, marginTop: 4 },
  btnPrimary:   {
    backgroundColor: Colors.ink, borderRadius: 12, borderWidth: 2, borderColor: Colors.line,
    paddingVertical: 17, alignItems: 'center',
    shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  btnPrimaryText:   { color: Colors.background, fontSize: 16, fontWeight: '800' },
  btnSecondary:     { borderRadius: 12, borderWidth: 1.5, borderColor: Colors.line, paddingVertical: 15, alignItems: 'center', backgroundColor: Colors.card },
  btnSecondaryText: { color: Colors.ink, fontSize: 14, fontWeight: '700' },
});
