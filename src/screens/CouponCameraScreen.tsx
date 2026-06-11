/**
 * CouponCameraScreen.tsx
 * expo-camera 내장 바코드 스캐너 사용
 * 스캔된 값 → CouponCreate prefill로 전달
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponCamera'>;

const { width: SW } = Dimensions.get('window');
const BOX = SW * 0.68;

export default function CouponCameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned]           = useState(false);
  const [torch,   setTorch]             = useState(false);
  const [lastCode, setLastCode]         = useState<string>('');

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  /* ── 바코드 인식 ── */
  const handleScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setLastCode(data);
  };

  /* ── 등록 폼으로 이동 ── */
  const goToCreate = () => {
    navigation.replace('CouponCreate', {
      prefill: { couponCode: lastCode },
    });
  };

  /* ── 로딩 ── */
  if (!permission) {
    return (
      <SafeAreaView style={styles.bg}>
        <ActivityIndicator size="large" color={Colors.coral} />
      </SafeAreaView>
    );
  }

  /* ── 권한 거부 ── */
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permScreen}>
        <View style={styles.permCard}>
          <Text style={styles.permEmoji}>📷</Text>
          <Text style={styles.permTitle}>카메라 권한이 필요해요</Text>
          <Text style={styles.permSub}>
            바코드 스캔을 위해{'\n'}카메라 접근을 허용해주세요.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>권한 허용하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permSkip} onPress={() => navigation.goBack()}>
            <Text style={styles.permSkipText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── 카메라 ── */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr','ean13','ean8','code128','code39','itf14','upc_a','upc_e','codabar','pdf417'],
        }}
        onBarcodeScanned={scanned ? undefined : handleScanned}
      />

      {/* ── 오버레이 ── */}
      <View style={styles.overlay}>
        {/* 상단 딤 */}
        <View style={styles.dimTop} />

        {/* 중간: 좌딤 + 스캔박스 + 우딤 */}
        <View style={styles.middle}>
          <View style={styles.dimSide} />

          {/* 스캔 박스 */}
          <View style={[styles.scanBox, { width: BOX, height: BOX }]}>
            {/* 모서리 4개 */}
            {(['TL','TR','BL','BR'] as const).map(pos => (
              <View key={pos} style={[styles.corner, styles[`corner${pos}`]]} />
            ))}

            {/* 인식 완료 오버레이 */}
            {scanned && (
              <View style={styles.scannedOverlay}>
                <Text style={styles.scannedCheck}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.dimSide} />
        </View>

        {/* 하단 딤 + 안내 */}
        <View style={styles.dimBottom}>
          {!scanned ? (
            <>
              <Text style={styles.guideText}>바코드를 네모 안에 맞춰주세요</Text>
              <Text style={styles.guideSub}>QR코드 · 바코드 모두 인식 가능해요</Text>
            </>
          ) : (
            <>
              <Text style={styles.guideText}>인식 완료!</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText} numberOfLines={1}>{lastCode}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* ── 상단 헤더 ── */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.iconBtnText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>사진으로 인식</Text>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setTorch(v => !v)}>
          <Text style={styles.iconBtnText}>{torch ? '💡' : '🔦'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── 하단 버튼 ── */}
      <View style={styles.bottomBar}>
        {scanned ? (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => { setScanned(false); setLastCode(''); }}
            >
              <Text style={styles.btnOutlineText}>다시 스캔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFill} onPress={goToCreate}>
              <Text style={styles.btnFillText}>쿠폰 등록하기 →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.btnManual}
            onPress={() => navigation.replace('CouponCreate', {})}
          >
            <Text style={styles.btnManualText}>✏️  직접 입력으로 전환</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

/* ── 상수 ── */
const DIM  = 'rgba(0,0,0,0.62)';
const CW   = 22;   // 모서리 길이
const CT   = 3;    // 모서리 두께

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#000' },
  bg:         { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },

  /* 오버레이 */
  overlay:    { ...StyleSheet.absoluteFillObject },
  dimTop:     { flex: 1, backgroundColor: DIM },
  middle:     { flexDirection: 'row' },
  dimSide:    { flex: 1, backgroundColor: DIM },
  dimBottom:  { flex: 1.2, backgroundColor: DIM, alignItems: 'center', paddingTop: 24, gap: 8 },

  /* 스캔 박스 */
  scanBox:    { position: 'relative' },
  corner:     { position: 'absolute', width: CW, height: CW, borderColor: Colors.coral },
  cornerTL:   { top: 0,    left: 0,   borderTopWidth: CT,    borderLeftWidth: CT },
  cornerTR:   { top: 0,    right: 0,  borderTopWidth: CT,    borderRightWidth: CT },
  cornerBL:   { bottom: 0, left: 0,   borderBottomWidth: CT, borderLeftWidth: CT },
  cornerBR:   { bottom: 0, right: 0,  borderBottomWidth: CT, borderRightWidth: CT },

  /* 인식 완료 */
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76,175,80,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedCheck: { fontSize: 52, color: '#4CAF50', fontWeight: '800' },

  /* 안내 텍스트 */
  guideText:  { color: Colors.white, fontSize: 15, fontWeight: '700' },
  guideSub:   { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  codeBox:    { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, maxWidth: SW * 0.7 },
  codeText:   { color: Colors.white, fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 },

  /* 헤더 */
  header:       { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  iconBtnText:  { color: Colors.white, fontSize: 16 },
  headerTitle:  { flex: 1, textAlign: 'center', color: Colors.white, fontSize: 16, fontWeight: '800' },

  /* 하단 바 */
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 48 : 32, paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  btnRow:       { flexDirection: 'row', gap: 10 },
  btnOutline:   { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.white, alignItems: 'center' },
  btnOutlineText:{ color: Colors.white, fontSize: 13, fontWeight: '700' },
  btnFill:      { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.coral, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center' },
  btnFillText:  { color: Colors.white, fontSize: 13, fontWeight: '800' },
  btnManual:    { paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center' },
  btnManualText:{ color: Colors.ink, fontSize: 14, fontWeight: '700' },

  /* 권한 거부 화면 */
  permScreen: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permCard:   { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.line, padding: 32, alignItems: 'center', gap: 12, width: '100%', shadowColor: Colors.line, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6 },
  permEmoji:  { fontSize: 48, marginBottom: 4 },
  permTitle:  { fontSize: 18, fontWeight: '800', color: Colors.ink, textAlign: 'center' },
  permSub:    { fontSize: 14, color: Colors.inkSoft, textAlign: 'center', lineHeight: 22 },
  permBtn:    { marginTop: 8, backgroundColor: Colors.ink, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, borderWidth: 2, borderColor: Colors.line, shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  permBtnText:{ color: Colors.background, fontSize: 14, fontWeight: '800' },
  permSkip:   { paddingVertical: 10 },
  permSkipText:{ fontSize: 13, color: Colors.inkSoft },
});
