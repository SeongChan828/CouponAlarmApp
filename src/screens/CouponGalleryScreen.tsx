/**
 * CouponGalleryScreen.tsx
 * expo-image-picker로 갤러리 열기
 * 선택한 이미지 미리보기 → CouponCreate prefill로 이동
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Image, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponGallery'>;

type ScreenState = 'loading' | 'preview' | 'denied' | 'cancelled';

export default function CouponGalleryScreen({ navigation }: Props) {
  const [state, setState]       = useState<ScreenState>('loading');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    openGallery();
  }, []);

  const openGallery = async () => {
    setState('loading');

    /* 권한 요청 */
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setState('denied');
      return;
    }

    /* 갤러리 열기 */
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) {
      /* 취소 → 홈으로 */
      navigation.goBack();
      return;
    }

    setImageUri(result.assets[0].uri);
    setState('preview');
  };

  /* ── 로딩 ── */
  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.coral} />
        <Text style={styles.loadingText}>갤러리를 불러오는 중…</Text>
      </SafeAreaView>
    );
  }

  /* ── 권한 거부 ── */
  if (state === 'denied') {
    return (
      <SafeAreaView style={styles.permScreen}>
        <View style={styles.permCard}>
          <Text style={styles.permEmoji}>🖼️</Text>
          <Text style={styles.permTitle}>갤러리 권한이 필요해요</Text>
          <Text style={styles.permSub}>
            쿠폰 이미지를 불러오려면{'\n'}사진 라이브러리 접근을 허용해주세요.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={openGallery}>
            <Text style={styles.permBtnText}>권한 허용 후 다시 시도</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permSkip} onPress={() => navigation.goBack()}>
            <Text style={styles.permSkipText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ── 이미지 미리보기 ── */
  return (
    <SafeAreaView style={styles.safe}>

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>갤러리에서 선택</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>

        {/* 이미지 미리보기 카드 */}
        {imageUri && (
          <View style={styles.previewCard}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImg}
              resizeMode="contain"
            />
            {/* 다시 선택 버튼 — 이미지 위 우상단 */}
            <TouchableOpacity style={styles.rePickBtn} onPress={openGallery}>
              <Text style={styles.rePickText}>다른 이미지</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 안내 카드 */}
        <View style={styles.infoCard}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>안내</Text>
          </View>
          <Text style={styles.infoTitle}>이미지를 확인해주세요</Text>
          <Text style={styles.infoDesc}>
            선택한 쿠폰 이미지를 보면서{'\n'}
            아래 버튼을 눌러 쿠폰 정보를 직접 입력해주세요.{'\n\n'}
            쿠폰 번호가 보이면 직접 입력란에 넣어주세요.
          </Text>

          {/* 체크리스트 */}
          <View style={styles.checkList}>
            {['브랜드명 확인', '상품명 확인', '유효기간 확인', '바코드 번호 확인'].map(item => (
              <View key={item} style={styles.checkItem}>
                <View style={styles.checkDot} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

      </View>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecondary} onPress={openGallery} activeOpacity={0.8}>
          <Text style={styles.btnSecondaryText}>다른 이미지 선택</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.replace('CouponCreate', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>쿠폰 정보 직접 입력 →</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  centered:     { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText:  { fontSize: 14, color: Colors.inkSoft },

  /* 헤더 */
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText:     { fontSize: 22, fontWeight: '300', color: Colors.ink },
  headerTitle:  { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.ink, textAlign: 'center' },

  /* 바디 */
  body:         { flex: 1, paddingHorizontal: 20, gap: 14 },

  /* 이미지 미리보기 */
  previewCard: {
    height: 260,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.line,
    overflow: 'hidden',
    shadowColor: Colors.line,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  previewImg:   { width: '100%', height: '100%' },
  rePickBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(26,26,26,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rePickText:   { color: Colors.white, fontSize: 11, fontWeight: '700' },

  /* 안내 카드 */
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 18,
    gap: 8,
    shadowColor: Colors.line,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  infoBadge:     { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: Colors.mustard, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderColor: Colors.line },
  infoBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.ink, letterSpacing: 1 },
  infoTitle:     { fontSize: 15, fontWeight: '800', color: Colors.ink },
  infoDesc:      { fontSize: 13, color: Colors.inkSoft, lineHeight: 20 },
  checkList:     { gap: 8, marginTop: 4 },
  checkItem:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.coral },
  checkText:     { fontSize: 13, color: Colors.ink, fontWeight: '500' },

  /* 하단 버튼 */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26,26,26,0.08)',
    gap: 10,
  },
  btnSecondary: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.inkSoft },
  btnPrimary: {
    backgroundColor: Colors.ink,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.line,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.line,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  btnPrimaryText: { color: Colors.background, fontSize: 15, fontWeight: '800' },

  /* 권한 거부 */
  permScreen:   { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permCard:     { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.line, padding: 32, alignItems: 'center', gap: 12, width: '100%', shadowColor: Colors.line, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6 },
  permEmoji:    { fontSize: 48, marginBottom: 4 },
  permTitle:    { fontSize: 18, fontWeight: '800', color: Colors.ink, textAlign: 'center' },
  permSub:      { fontSize: 14, color: Colors.inkSoft, textAlign: 'center', lineHeight: 22 },
  permBtn:      { marginTop: 8, backgroundColor: Colors.ink, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, borderWidth: 2, borderColor: Colors.line, shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  permBtnText:  { color: Colors.background, fontSize: 14, fontWeight: '800' },
  permSkip:     { paddingVertical: 10 },
  permSkipText: { fontSize: 13, color: Colors.inkSoft },
});
