import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Coupon } from '../types/coupon';
import { Colors } from '../constants/colors';
import { isPastDate, formatDisplayDate } from '../utils/dateUtils';
import { getCouponById, updateCoupon } from '../services/couponStorage';
import { scheduleExpiryNotifications } from '../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponEdit'>;
interface FormErrors { title?: string; brand?: string; expiryDate?: string; }

export default function CouponEditScreen({ navigation, route }: Props) {
  const { couponId } = route.params;
  const [original, setOriginal] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ title: '', brand: '', store: '', expiryDate: '', couponCode: '', memo: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getCouponById(couponId).then(c => {
        if (c) {
          setOriginal(c);
          setForm({ title: c.title, brand: c.brand, store: c.store ?? '', expiryDate: c.expiryDate, couponCode: c.couponCode ?? '', memo: c.memo ?? '' });
        }
        setLoading(false);
      });
    }, [couponId]),
  );

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let f = digits;
    if (digits.length > 4) f = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 6) f = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    updateField('expiryDate', f);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = '쿠폰명을 입력해주세요.';
    if (!form.brand.trim()) e.brand = '브랜드명을 입력해주세요.';
    if (!form.expiryDate || form.expiryDate.length < 10) e.expiryDate = '유효기간을 입력해주세요.';
    else if (isPastDate(form.expiryDate)) e.expiryDate = '이미 지난 날짜는 등록할 수 없어요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const updated = await updateCoupon(couponId, {
        title: form.title.trim(),
        brand: form.brand.trim(),
        store: form.store.trim() || undefined,
        expiryDate: form.expiryDate,
        couponCode: form.couponCode.trim() || undefined,
        memo: form.memo.trim() || undefined,
      });
      if (updated) await scheduleExpiryNotifications(updated);
      navigation.goBack();
    } catch {
      Alert.alert('오류', '저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>쿠폰 수정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>필수 정보</Text>

        <FG label="쿠폰명" required error={errors.title}>
          <TextInput style={[styles.input, errors.title && styles.inputError]} value={form.title} onChangeText={v => updateField('title', v)} placeholder="쿠폰명" placeholderTextColor={Colors.inkSoft} />
        </FG>
        <FG label="브랜드" required error={errors.brand}>
          <TextInput style={[styles.input, errors.brand && styles.inputError]} value={form.brand} onChangeText={v => updateField('brand', v)} placeholder="브랜드명" placeholderTextColor={Colors.inkSoft} />
        </FG>
        <FG label="유효기간" required error={errors.expiryDate} hint="숫자만 입력하면 자동으로 날짜 형식으로 바뀌어요">
          <TextInput style={[styles.input, errors.expiryDate && styles.inputError]} value={form.expiryDate} onChangeText={handleDateInput} placeholder="예: 20261231" placeholderTextColor={Colors.inkSoft} keyboardType="numeric" maxLength={10} />
          {form.expiryDate.length === 10 && !errors.expiryDate && (
            <Text style={styles.datePreview}>{formatDisplayDate(form.expiryDate)} 까지</Text>
          )}
        </FG>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>선택 정보</Text>

        <FG label="사용처">
          <TextInput style={styles.input} value={form.store} onChangeText={v => updateField('store', v)} placeholder="사용 가능한 매장" placeholderTextColor={Colors.inkSoft} />
        </FG>
        <FG label="바코드 / 쿠폰 번호">
          <TextInput style={styles.input} value={form.couponCode} onChangeText={v => updateField('couponCode', v)} placeholder="쿠폰 번호" placeholderTextColor={Colors.inkSoft} />
        </FG>
        <FG label="메모">
          <TextInput style={[styles.input, styles.inputMultiline]} value={form.memo} onChangeText={v => updateField('memo', v)} placeholder="메모" placeholderTextColor={Colors.inkSoft} multiline numberOfLines={3} textAlignVertical="top" />
        </FG>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{saving ? '저장 중…' : '수정 저장하기'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FG({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkSoft, letterSpacing: 0.5 }}>{label}</Text>
        {required && <Text style={{ fontSize: 12, color: Colors.coral, fontWeight: '700' }}>*</Text>}
      </View>
      {hint && <Text style={{ fontSize: 11, color: Colors.inkSoft, marginBottom: 6 }}>{hint}</Text>}
      {children}
      {error && <Text style={{ fontSize: 11, color: Colors.coral, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, fontWeight: '300', color: Colors.ink },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  sectionLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '700', color: Colors.coral, marginBottom: 16, marginTop: 4 },
  input: { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: 14, color: Colors.ink },
  inputError: { borderColor: Colors.coral },
  inputMultiline: { height: 88, paddingTop: 12 },
  datePreview: { marginTop: 6, fontSize: 12, color: Colors.coral, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(26,26,26,0.1)', marginVertical: 20 },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(26,26,26,0.1)', backgroundColor: Colors.background },
  saveBtn: { backgroundColor: Colors.ink, borderRadius: 12, borderWidth: 2, borderColor: Colors.line, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  saveBtnText: { color: Colors.background, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
