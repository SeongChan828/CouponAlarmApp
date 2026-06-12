import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Platform, Modal, Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';
import { isPastDate, formatDisplayDate } from '../utils/dateUtils';
import { addCoupon } from '../services/couponStorage';
import { scheduleExpiryNotifications, requestNotificationPermission } from '../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponCreate'>;
interface FormState { title: string; brand: string; store: string; expiryDate: string; couponCode: string; memo: string; }
interface FormErrors { title?: string; brand?: string; expiryDate?: string; }

function BarcodeModal({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: (c: string) => void }) {
  const [code, setCode] = useState('');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={bS.overlay} onPress={onClose}>
        <Pressable style={bS.sheet} onPress={e => e.stopPropagation()}>
          <View style={bS.handle} />
          <Text style={bS.title}>쿠폰 번호 입력</Text>
          <Text style={bS.sub}>쿠폰 하단의 번호를 입력해주세요</Text>
          <TextInput style={bS.input} placeholder="예: 1234-5678-9012-3456" placeholderTextColor={Colors.inkSoft} value={code} onChangeText={setCode} autoFocus returnKeyType="done" onSubmitEditing={() => { if (code.trim()) { onConfirm(code.trim()); setCode(''); }}} />
          <View style={bS.btnRow}>
            <TouchableOpacity style={bS.btnCancel} onPress={onClose}><Text style={bS.btnCancelText}>취소</Text></TouchableOpacity>
            <TouchableOpacity style={[bS.btnConfirm, !code.trim() && { opacity: 0.4 }]} onPress={() => { if (code.trim()) { onConfirm(code.trim()); setCode(''); }}} disabled={!code.trim()}><Text style={bS.btnConfirmText}>확인</Text></TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function CouponCreateScreen({ navigation, route }: Props) {
  const prefill = route.params?.prefill ?? {};
  const [form, setForm] = useState<FormState>({ title: prefill.title ?? '', brand: prefill.brand ?? '', store: prefill.store ?? '', expiryDate: prefill.expiryDate ?? '', couponCode: prefill.couponCode ?? '', memo: prefill.memo ?? '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [barcodeModal, setBarcodeModal] = useState(false);

  const set = (k: keyof FormState, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k as keyof FormErrors]) setErrors(p => ({ ...p, [k]: undefined }));
  };

  const handleDate = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    let f = d;
    if (d.length > 4) f = `${d.slice(0,4)}-${d.slice(4)}`;
    if (d.length > 6) f = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`;
    set('expiryDate', f);
  };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.title.trim())  e.title = '쿠폰명을 입력해주세요.';
    if (!form.brand.trim())  e.brand = '브랜드명을 입력해주세요.';
    if (!form.expiryDate || form.expiryDate.length < 10) e.expiryDate = '유효기간을 입력해주세요.';
    else if (isPastDate(form.expiryDate)) e.expiryDate = '이미 지난 날짜는 등록할 수 없어요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const newCoupon = await addCoupon({
        title: form.title.trim(), brand: form.brand.trim(),
        store: form.store.trim() || undefined,
        expiryDate: form.expiryDate,
        couponCode: form.couponCode.trim() || undefined,
        memo: form.memo.trim() || undefined,
      });
      const permitted = await requestNotificationPermission();
      if (permitted) await scheduleExpiryNotifications(newCoupon);

      // ✅ 위치 알림 설정 화면으로 이동
      navigation.replace('CouponLocationSetup', { couponId: newCoupon.id });
    } catch {
      Alert.alert('오류', '저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <View><Text style={s.eyebrow}>STEP 01</Text><Text style={s.title}>쿠폰 정보 입력</Text></View>
        <View style={s.stepBadge}><Text style={s.stepText}>직접 입력</Text></View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SH label="필수 정보" color={Colors.coral} />

        <FG label="쿠폰명" required error={errors.title} hint="받은 쿠폰의 상품명">
          <TextInput style={[s.input, errors.title && s.inputErr]} placeholder="예: 아메리카노 Tall, 황금올리브 치킨" placeholderTextColor={Colors.inkSoft} value={form.title} onChangeText={v => set('title', v)} />
        </FG>
        <FG label="브랜드명" required error={errors.brand} hint="쿠폰을 발행한 브랜드">
          <TextInput style={[s.input, errors.brand && s.inputErr]} placeholder="예: 스타벅스, BBQ, 베스킨라빈스" placeholderTextColor={Colors.inkSoft} value={form.brand} onChangeText={v => set('brand', v)} />
        </FG>
        <FG label="유효기간" required error={errors.expiryDate} hint="숫자 8자리 입력 → 자동 변환">
          <TextInput style={[s.input, errors.expiryDate && s.inputErr]} placeholder="예: 20261231 → 2026-12-31" placeholderTextColor={Colors.inkSoft} value={form.expiryDate} onChangeText={handleDate} keyboardType="numeric" maxLength={10} />
          {form.expiryDate.length === 10 && !errors.expiryDate && (
            <Text style={s.datePreview}>📅  {formatDisplayDate(form.expiryDate)} 까지</Text>
          )}
        </FG>

        <View style={s.divider} />
        <SH label="선택 정보" color={Colors.inkSoft} />

        <FG label="사용처" hint="사용 가능한 매장 또는 온라인">
          <TextInput style={s.input} placeholder="예: 스타벅스 전국 매장" placeholderTextColor={Colors.inkSoft} value={form.store} onChangeText={v => set('store', v)} />
        </FG>
        <FG label="바코드 / 쿠폰 번호">
          <TouchableOpacity style={s.barcodeRow} onPress={() => setBarcodeModal(true)} activeOpacity={0.8}>
            <Text style={form.couponCode ? s.barcodeVal : s.barcodePh} numberOfLines={1}>{form.couponCode || '번호를 탭해서 입력하세요'}</Text>
            <View style={s.tagBtn}><Text style={s.tagText}>입력</Text></View>
          </TouchableOpacity>
          {form.couponCode ? <TouchableOpacity onPress={() => set('couponCode', '')} style={s.clearBtn}><Text style={s.clearText}>× 지우기</Text></TouchableOpacity> : null}
        </FG>
        <FG label="메모" hint="사용 조건, 메모 등 자유롭게">
          <TextInput style={[s.input, s.multiline]} placeholder="예: 생일 선물로 받음, 1인 1매" placeholderTextColor={Colors.inkSoft} value={form.memo} onChangeText={v => set('memo', v)} multiline numberOfLines={3} textAlignVertical="top" />
        </FG>
      </ScrollView>

      <View style={s.footer}>
        <Text style={s.footerNote}>* 필수 항목을 입력하면 다음 단계로 이동해요</Text>
        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>{saving ? '저장 중…' : '다음  →'}</Text>
        </TouchableOpacity>
      </View>

      <BarcodeModal visible={barcodeModal} onClose={() => setBarcodeModal(false)} onConfirm={code => { set('couponCode', code); setBarcodeModal(false); }} />
    </SafeAreaView>
  );
}

function SH({ label, color }: { label: string; color: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} /><Text style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: '700', color }}>{label}</Text></View>;
}
function FG({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}><Text style={{ fontSize: 13, fontWeight: '700', color: Colors.ink }}>{label}</Text>{required && <Text style={{ fontSize: 13, color: Colors.coral, fontWeight: '800' }}> *</Text>}</View>
      {hint && <Text style={{ fontSize: 11, color: Colors.inkSoft, marginBottom: 7 }}>{hint}</Text>}
      {children}
      {error && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }}><Text style={{ fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: Colors.coral, width: 14, height: 14, borderRadius: 7, textAlign: 'center', lineHeight: 14 }}>!</Text><Text style={{ fontSize: 11, color: Colors.coral }}>{error}</Text></View>}
    </View>
  );
}

const bS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1.5, borderColor: Colors.line, borderBottomWidth: 0, paddingTop: 12, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 28 },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(26,26,26,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 17, fontWeight: '800', color: Colors.ink, marginBottom: 4 },
  sub: { fontSize: 13, color: Colors.inkSoft, marginBottom: 20 },
  input: { backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: Colors.ink, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnCancel: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center' },
  btnCancelText: { fontSize: 14, fontWeight: '700', color: Colors.inkSoft },
  btnConfirm: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.ink, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center' },
  btnConfirmText: { fontSize: 14, fontWeight: '800', color: Colors.background },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, fontWeight: '300', color: Colors.ink },
  eyebrow: { fontSize: 9, letterSpacing: 2, color: Colors.coral, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '800', color: Colors.ink },
  stepBadge: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.navy, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.line },
  stepText: { fontSize: 10, fontWeight: '700', color: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 },
  input: { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 11, fontSize: 14, color: Colors.ink },
  inputErr: { borderColor: Colors.coral, borderWidth: 2 },
  multiline: { height: 88, paddingTop: 12 },
  datePreview: { marginTop: 7, fontSize: 13, color: Colors.coral, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(26,26,26,0.1)', marginVertical: 20 },
  barcodeRow: { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  barcodeVal: { flex: 1, fontSize: 14, color: Colors.ink, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  barcodePh: { flex: 1, fontSize: 14, color: Colors.inkSoft },
  tagBtn: { backgroundColor: Colors.ink, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '700', color: Colors.background },
  clearBtn: { marginTop: 6, alignSelf: 'flex-end' },
  clearText: { fontSize: 11, color: Colors.coral, fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: 'rgba(26,26,26,0.08)', gap: 8 },
  footerNote: { fontSize: 11, color: Colors.inkSoft, textAlign: 'center' },
  saveBtn: { backgroundColor: Colors.ink, borderRadius: 12, borderWidth: 2, borderColor: Colors.line, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  saveBtnText: { color: Colors.background, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
