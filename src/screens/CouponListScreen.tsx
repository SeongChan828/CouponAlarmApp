import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Coupon } from '../types/coupon';
import { Colors } from '../constants/colors';
import { sortCouponsByExpiry } from '../utils/couponStatus';
import { getAllCoupons } from '../services/couponStorage';
import CouponCard from '../components/CouponCard';
import EmptyState from '../components/EmptyState';
import UrgentBanner from '../components/UrgentBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponList'>;
type FilterTab = 'all' | 'available' | 'used';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: '전체' },
  { key: 'available', label: '사용 가능' },
  { key: 'used',      label: '사용 완료' },
];

export default function CouponListScreen({ navigation }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // 화면 포커스될 때마다 최신 데이터 로드
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getAllCoupons().then(data => {
        if (active) {
          setCoupons(data);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, []),
  );

  const urgentCoupons = coupons.filter(c => c.status === 'expiringSoon');

  const filteredCoupons = (() => {
    let list = coupons;
    if (activeFilter === 'available') {
      list = coupons.filter(c => c.status === 'available' || c.status === 'expiringSoon');
    } else if (activeFilter === 'used') {
      list = coupons.filter(c => c.status === 'used' || c.status === 'expired');
    }
    return sortCouponsByExpiry(list);
  })();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>POSITIVE COUPON</Text>
          <Text style={styles.headerTitle}>내 쿠폰</Text>
        </View>
        <View style={styles.bellWrapper}>
          <View style={styles.bell} />
          {urgentCoupons.length > 0 && <View style={styles.bellDot} />}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.coral} />
        </View>
      ) : (
        <FlatList
          data={filteredCoupons}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, filteredCoupons.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <UrgentBanner count={urgentCoupons.length} onPress={() => setActiveFilter('available')} />
              <View style={styles.filterRow}>
                {FILTER_TABS.map(tab => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
                    onPress={() => setActiveFilter(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterTabText, activeFilter === tab.key && styles.filterTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {activeFilter === 'all' ? '전체 쿠폰' : activeFilter === 'available' ? '사용 가능' : '사용 완료'}
                </Text>
                <Text style={styles.sectionCount}>{filteredCoupons.length}장</Text>
              </View>
            </>
          }
          ListEmptyComponent={<EmptyState onAdd={() => navigation.navigate('CouponCreate')} />}
          renderItem={({ item }) => (
            <CouponCard coupon={item} onPress={c => navigation.navigate('CouponDetail', { couponId: c.id })} />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CouponCreate')} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerEyebrow: { fontSize: 10, letterSpacing: 3, color: Colors.coral, fontWeight: '600', marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },
  bellWrapper: { position: 'relative', width: 36, height: 36 },
  bell: { width: 36, height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.card },
  bellDot: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.coral, borderWidth: 1.5, borderColor: Colors.line },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.card },
  filterTabActive: { backgroundColor: Colors.ink },
  filterTabText: { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },
  filterTabTextActive: { color: Colors.background },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.ink, letterSpacing: 0.5 },
  sectionCount: { fontSize: 12, color: Colors.inkSoft },
  fab: { position: 'absolute', right: 20, bottom: 32, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.line, shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6 },
  fabText: { fontSize: 28, fontWeight: '300', color: Colors.background, lineHeight: 32 },
});
