import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Platform, Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';
import { isPastDate, formatDisplayDate } from '../utils/dateUtils';
import { addCoupon } from '../services/couponStorage';
import { scheduleExpiryNotifications, requestNotificationPermission } from '../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponCreate'>;

interface FormState {
  title: string; brand: string; store: string;
  expiryDate: string; couponCode: string; memo: string;
}
interface FormErrors { title?: string; brand?: string; expiryDate?: string; }

// 바코드/쿠폰 번호 입력 모달
function BarcodeInputModal({
  visible, onClose, onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>바코드 / 쿠폰 번호 입력</Text>
          <Text style={modalStyles.sub}>번호를 직접 입력하거나 바코드 아래 숫자를 입력하세요</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="예: 1234-5678-9012"
            placeholderTextColor={Colors.inkSoft}
            value={code}
            onChangeText={setCode}
            keyboardType="default"
            autoFocus
          />
          <View style={modalStyles.btnRow}>
            <TouchableOpacity style={modalStyles.btnCancel} onPress={onClose}>
              <Text style={modalStyles.btnCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.btnConfirm, !code.trim() && { opacity: 0.4 }]}
              onPress={() => { if (code.trim()) { onConfirm(code.trim()); setCode(''); } }}
              disabled={!code.trim()}
            >
              <Text style={modalStyles.btnConfirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CouponCreateScreen({ navigation }: Props) {
  const [form, setForm] = useState<FormState>({ title: '', brand: '', store: '', expiryDate: '', couponCode: '', memo: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);

  const updateField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 6) formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    updateField('expiryDate', formatted);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = '쿠폰명을 입력해주세요.';
    if (!form.brand.trim()) e.brand = '브랜드명을 입력해주세요.';
    if (!form.expiryDate || form.expiryDate.length < 10) e.expiryDate = '유효기간을 입력해주세요. (YYYYMMDD)';
    else if (isPastDate(form.expiryDate)) e.expiryDate = '이미 지난 날짜는 등록할 수 없어요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const newCoupon = await addCoupon({
        title: form.title.trim(),
        brand: form.brand.trim(),
        store: form.store.trim() || undefined,
        expiryDate: form.expiryDate,
        couponCode: form.couponCode.trim() || undefined,
        memo: form.memo.trim() || undefined,
      });
      // 알림 예약 (권한 있으면)
      const permitted = await requestNotificationPermission();
      if (permitted) await scheduleExpiryNotifications(newCoupon);

      navigation.replace('CouponDetail', { couponId: newCoupon.id });
    } catch (err) {
      Alert.alert('오류', '저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>쿠폰 등록</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>필수 정보</Text>

        <FieldGroup label="쿠폰명" required error={errors.title}>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="예: 아메리카노 Tall, 2만원 상품권"
            placeholderTextColor={Colors.inkSoft}
            value={form.title}
            onChangeText={v => updateField('title', v)}
            returnKeyType="next"
          />
        </FieldGroup>

        <FieldGroup label="브랜드" required error={errors.brand}>
          <TextInput
            style={[styles.input, errors.brand && styles.inputError]}
            placeholder="예: 스타벅스, 베스킨라빈스"
            placeholderTextColor={Colors.inkSoft}
            value={form.brand}
            onChangeText={v => updateField('brand', v)}
            returnKeyType="next"
          />
        </FieldGroup>

        <FieldGroup label="유효기간" required error={errors.expiryDate} hint="숫자만 입력하면 자동으로 날짜 형식으로 바뀌어요">
          <TextInput
            style={[styles.input, errors.expiryDate && styles.inputError]}
            placeholder="예: 20261231"
            placeholderTextColor={Colors.inkSoft}
            value={form.expiryDate}
            onChangeText={handleDateInput}
            keyboardType="numeric"
            maxLength={10}
          />
          {form.expiryDate.length === 10 && !errors.expiryDate && (
            <Text style={styles.datePreview}>{formatDisplayDate(form.expiryDate)} 까지</Text>
          )}
        </FieldGroup>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>선택 정보</Text>

        <FieldGroup label="사용처">
          <TextInput
            style={styles.input}
            placeholder="예: 스타벅스 전국 매장"
            placeholderTextColor={Colors.inkSoft}
            value={form.store}
            onChangeText={v => updateField('store', v)}
          />
        </FieldGroup>

        <FieldGroup label="바코드 / 쿠폰 번호">
          <TouchableOpacity style={styles.barcodeRow} onPress={() => setBarcodeModalVisible(true)} activeOpacity={0.8}>
            <Text style={form.couponCode ? styles.barcodeValue : styles.barcodePlaceholder} numberOfLines={1}>
              {form.couponCode || '번호를 입력하거나 스캔하세요'}
            </Text>
            <View style={styles.scanBtn}>
              <Text style={styles.scanBtnText}>입력</Text>
            </View>
          </TouchableOpacity>
          {form.couponCode ? (
            <TouchableOpacity onPress={() => updateField('couponCode', '')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>× 지우기</Text>
            </TouchableOpacity>
          ) : null}
        </FieldGroup>

        <FieldGroup label="메모">
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="선물받은 분, 사용 조건 등 자유롭게"
            placeholderTextColor={Colors.inkSoft}
            value={form.memo}
            onChangeText={v => updateField('memo', v)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </FieldGroup>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{saving ? '저장 중…' : '쿠폰 등록하기'}</Text>
        </TouchableOpacity>
      </View>

      <BarcodeInputModal
        visible={barcodeModalVisible}
        onClose={() => setBarcodeModalVisible(false)}
        onConfirm={code => { updateField('couponCode', code); setBarcodeModalVisible(false); }}
      />
    </SafeAreaView>
  );
}

function FieldGroup({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkSoft, letterSpacing: 0.5 }}>{label}</Text>
        {required && <Text style={{ fontSize: 12, color: Colors.coral, fontWeight: '700' }}>*</Text>}
      </View>
      {hint && <Text style={{ fontSize: 11, color: Colors.inkSoft, marginBottom: 6 }}>{hint}</Text>}
      {children}
      {error && <Text style={{ fontSize: 11, color: Colors.coral, marginTop: 4, fontWeight: '500' }}>{error}</Text>}
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  title: { fontSize: 17, fontWeight: '800', color: Colors.ink, marginBottom: 6 },
  sub: { fontSize: 13, color: Colors.inkSoft, marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: Colors.ink, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnCancel: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center' },
  btnCancelText: { fontSize: 14, fontWeight: '700', color: Colors.inkSoft },
  btnConfirm: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.ink, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center' },
  btnConfirmText: { fontSize: 14, fontWeight: '800', color: Colors.background },
});

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
  barcodeRow: { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  barcodeValue: { flex: 1, fontSize: 14, color: Colors.ink, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  barcodePlaceholder: { flex: 1, fontSize: 14, color: Colors.inkSoft },
  scanBtn: { backgroundColor: Colors.ink, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  scanBtnText: { fontSize: 11, fontWeight: '700', color: Colors.background },
  clearBtn: { marginTop: 6, alignSelf: 'flex-end' },
  clearBtnText: { fontSize: 11, color: Colors.coral, fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(26,26,26,0.1)', backgroundColor: Colors.background },
  saveBtn: { backgroundColor: Colors.ink, borderRadius: 12, borderWidth: 2, borderColor: Colors.line, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  saveBtnText: { color: Colors.background, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
